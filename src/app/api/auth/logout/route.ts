import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, clearSessionCookie } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (user) {
      await logAuditEvent({
        actorUserId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        institutionId: user.institutionId,
        action: 'LOGOUT',
        entityType: 'SESSION',
      });
    }

    await clearSessionCookie();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Logout error:', err);
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 });
  }
}
