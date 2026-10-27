import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { calculateIntakeUtilization } from '@/lib/validation';
import { logAuditEvent } from '@/lib/audit';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(['AICTE_ADMIN']);
    const body = await req.json();

    const { approvedIntake, approvalStatus, name, state, district } = body;

    const existing = await prisma.institution.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Institution not found.' }, { status: 404 });
    }

    const updated = await prisma.institution.update({
      where: { id: params.id },
      data: {
        approvedIntake: approvedIntake !== undefined ? Number(approvedIntake) : existing.approvedIntake,
        approvalStatus: approvalStatus || existing.approvalStatus,
        name: name || existing.name,
        state: state || existing.state,
        district: district || existing.district,
      },
    });

    // Count active enrolments to return new utilization
    const activeCount = await prisma.student.count({
      where: { institutionId: params.id, enrolmentStatus: 'ACTIVE' },
    });
    const intakeStatus = calculateIntakeUtilization(activeCount, updated.approvedIntake);

    await logAuditEvent({
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'UPDATE_INSTITUTION',
      entityType: 'INSTITUTION',
      entityId: updated.id,
      institutionId: updated.id,
      metadata: {
        previousIntake: existing.approvedIntake,
        newIntake: updated.approvedIntake,
        previousStatus: existing.approvalStatus,
        newStatus: updated.approvalStatus,
      },
    });

    return NextResponse.json({
      success: true,
      institution: {
        ...updated,
        activeEnrolment: activeCount,
        intakeStatus,
      },
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
