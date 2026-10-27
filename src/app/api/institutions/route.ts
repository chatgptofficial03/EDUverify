import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { calculateIntakeUtilization } from '@/lib/validation';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(['AICTE_ADMIN', 'OBSERVER', 'INSTITUTION_ADMIN']);

    const institutions = await prisma.institution.findMany({
      include: {
        _count: {
          select: {
            students: true,
            importBatches: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Query active enrolments per institution
    const activeEnrolments = await prisma.student.groupBy({
      by: ['institutionId'],
      where: { enrolmentStatus: 'ACTIVE' },
      _count: { id: true },
    });

    const activeMap = new Map<string, number>();
    activeEnrolments.forEach((item) => {
      activeMap.set(item.institutionId, item._count.id);
    });

    const enriched = institutions.map((inst) => {
      const active = activeMap.get(inst.id) || 0;
      const intakeCalc = calculateIntakeUtilization(active, inst.approvedIntake);
      return {
        ...inst,
        activeEnrolment: active,
        totalStudents: inst._count.students,
        totalBatches: inst._count.importBatches,
        intakeStatus: intakeCalc,
      };
    });

    return NextResponse.json({ institutions: enriched });
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

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(['AICTE_ADMIN']);
    const body = await req.json();

    const {
      officialCode,
      name,
      institutionType = 'Engineering & Technology',
      state,
      district,
      address,
      approvedIntake = 300,
      academicYear = '2025-2026',
    } = body;

    if (!officialCode || !name || !state || !district) {
      return NextResponse.json(
        { error: 'Code, name, state, and district are required.' },
        { status: 400 }
      );
    }

    const existing = await prisma.institution.findUnique({
      where: { officialCode },
    });
    if (existing) {
      return NextResponse.json(
        { error: `Institution with code "${officialCode}" already exists.` },
        { status: 409 }
      );
    }

    const created = await prisma.institution.create({
      data: {
        officialCode,
        name,
        institutionType,
        state,
        district,
        address: address || null,
        approvedIntake: Number(approvedIntake) || 300,
        academicYear,
        approvalStatus: 'APPROVED',
      },
    });

    await logAuditEvent({
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'CREATE_INSTITUTION',
      entityType: 'INSTITUTION',
      entityId: created.id,
      metadata: { code: created.officialCode, name: created.name },
    });

    return NextResponse.json({ success: true, institution: created });
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
