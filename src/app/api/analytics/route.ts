import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { calculateIntakeUtilization } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    const isInstitution = user.role === 'INSTITUTION_ADMIN';
    const institutionId = isInstitution ? user.institutionId : undefined;

    const studentWhere = institutionId ? { institutionId } : {};
    const batchWhere = institutionId ? { institutionId } : {};

    const [
      totalInstitutions,
      totalStudents,
      activeEnrolments,
      totalBatches,
      pendingBatches,
      approvedBatches,
      rejectedBatches,
      institutions,
      programmeDistribution,
      statusDistribution,
      recentAudits,
    ] = await Promise.all([
      institutionId ? 1 : prisma.institution.count(),
      prisma.student.count({ where: studentWhere }),
      prisma.student.count({ where: { ...studentWhere, enrolmentStatus: 'ACTIVE' } }),
      prisma.dataImportBatch.count({ where: batchWhere }),
      prisma.dataImportBatch.count({ where: { ...batchWhere, status: 'SUBMITTED' } }),
      prisma.dataImportBatch.count({ where: { ...batchWhere, status: 'APPROVED' } }),
      prisma.dataImportBatch.count({ where: { ...batchWhere, status: 'REJECTED' } }),
      prisma.institution.findMany({
        where: institutionId ? { id: institutionId } : {},
        select: { id: true, name: true, state: true, approvedIntake: true },
      }),
      prisma.student.groupBy({
        by: ['programme'],
        where: studentWhere,
        _count: { id: true },
      }),
      prisma.student.groupBy({
        by: ['enrolmentStatus'],
        where: studentWhere,
        _count: { id: true },
      }),
      prisma.auditLog.findMany({
        where: institutionId ? { institutionId } : {},
        orderBy: { timestamp: 'desc' },
        take: 8,
      }),
    ]);

    // Aggregate intake numbers
    const totalApprovedIntake = institutions.reduce((sum, inst) => sum + inst.approvedIntake, 0);
    const overallUtilization = calculateIntakeUtilization(activeEnrolments, totalApprovedIntake);

    // Group state distribution (for central view)
    const stateCounts: Record<string, number> = {};
    institutions.forEach((inst) => {
      stateCounts[inst.state] = (stateCounts[inst.state] || 0) + 1;
    });

    const formattedProgrammeDist = programmeDistribution.map((p) => ({
      name: p.programme.replace('B.Tech ', '').replace('M.Tech ', ''),
      fullName: p.programme,
      count: p._count.id,
    }));

    const formattedStateDist = Object.entries(stateCounts).map(([state, count]) => ({
      state,
      institutions: count,
    }));

    const formattedStatusDist = statusDistribution.map((s) => ({
      status: s.enrolmentStatus,
      count: s._count.id,
    }));

    return NextResponse.json({
      metrics: {
        totalInstitutions,
        totalStudents,
        activeEnrolments,
        totalApprovedIntake,
        utilizationPercentage: overallUtilization.utilizationPercentage,
        statusTier: overallUtilization.statusTier,
        remainingSeats: overallUtilization.remainingSeats,
        overEnrolmentAmount: overallUtilization.overEnrolmentAmount,
        totalBatches,
        pendingBatches,
        approvedBatches,
        rejectedBatches,
      },
      charts: {
        programmeDistribution: formattedProgrammeDist,
        stateDistribution: formattedStateDist,
        statusDistribution: formattedStatusDist,
      },
      recentAudits,
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Analytics API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
