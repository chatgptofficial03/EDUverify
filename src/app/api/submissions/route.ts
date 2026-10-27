import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(['AICTE_ADMIN', 'OBSERVER']);

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));

    const where: any = {};
    if (status) {
      where.status = status;
    } else {
      // By default list batches needing review or reviewed
      where.status = { in: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'] };
    }

    const [total, submissions] = await Promise.all([
      prisma.dataImportBatch.count({ where }),
      prisma.dataImportBatch.findMany({
        where,
        include: {
          institution: true,
          uploader: { select: { name: true, email: true } },
          reviewer: { select: { name: true, email: true } },
          rows: {
            where: { validationStatus: { in: ['INVALID', 'WARNING'] } },
            take: 5, // Sample problematic rows
          },
        },
        orderBy: { submittedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      submissions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
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
