import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  verifyPassword,
  createSessionToken,
  setSessionCookie,
  checkLoginThrottling,
  recordFailedLogin,
  resetLoginAttempts,
} from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Check rate limiting / login throttling
    const throttling = checkLoginThrottling(normalizedEmail);
    if (!throttling.allowed) {
      return NextResponse.json(
        {
          error: `Too many login attempts. Please wait ${throttling.waitSeconds} seconds before trying again.`,
        },
        { status: 429 }
      );
    }

    // Lookup user in DB
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { institution: true },
    });

    if (!user || !user.isActive) {
      recordFailedLogin(normalizedEmail);
      return NextResponse.json(
        { error: 'Invalid credentials or inactive account.' },
        { status: 401 }
      );
    }

    // Verify hashed password
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      recordFailedLogin(normalizedEmail);
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Reset failed attempts on success
    resetLoginAttempts(normalizedEmail);

    // Create session token & cookie
    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as any,
      institutionId: user.institutionId,
      institutionName: user.institution?.name || null,
      institutionCode: user.institution?.officialCode || null,
    };

    const token = createSessionToken(sessionUser);
    await setSessionCookie(token);

    // Write audit log
    await logAuditEvent({
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      institutionId: user.institutionId,
      action: 'LOGIN',
      entityType: 'SESSION',
      metadata: { role: user.role, institutionId: user.institutionId },
    });

    // Determine redirect path by role
    let redirectPath = '/dashboard/institution';
    if (user.role === 'AICTE_ADMIN') redirectPath = '/dashboard/central';
    else if (user.role === 'VERIFIER') redirectPath = '/verification';
    else if (user.role === 'OBSERVER') redirectPath = '/analytics';

    return NextResponse.json({
      success: true,
      user: sessionUser,
      redirectPath,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    const message =
      err?.message && !err.message.includes('password')
        ? `Authentication error: ${err.message}`
        : 'An unexpected internal error occurred during authentication.';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
