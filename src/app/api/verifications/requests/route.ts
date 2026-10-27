import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(['VERIFIER', 'AICTE_ADMIN', 'INSTITUTION_ADMIN']);

    const requests = await prisma.verificationRequest.findMany({
      include: {
        student: {
          include: { institution: { select: { name: true, officialCode: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ requests });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(['VERIFIER', 'AICTE_ADMIN']);
    const body = await req.json();

    const { studentId, purpose } = body;
    if (!studentId || !purpose) {
      return NextResponse.json(
        { error: 'Student ID and Purpose are required.' },
        { status: 400 }
      );
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student) {
      return NextResponse.json({ error: 'Student not found.' }, { status: 404 });
    }

    const ref = `VER-REQ-${Date.now().toString().slice(-6)}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

    const newRequest = await prisma.verificationRequest.create({
      data: {
        studentId,
        requestedBy: user.name || user.email,
        purpose,
        status: 'PENDING',
        verificationReference: ref,
      },
    });

    await logAuditEvent({
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      institutionId: student.institutionId,
      action: 'CREATE_VERIFICATION_REQUEST',
      entityType: 'VERIFICATION',
      entityId: newRequest.id,
      metadata: { reference: ref, purpose },
    });

    return NextResponse.json({ success: true, request: newRequest });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
