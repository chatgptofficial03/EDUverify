import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(['INSTITUTION_ADMIN', 'AICTE_ADMIN', 'OBSERVER']);

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const status = searchParams.get('status') || '';

    const where: any = {};
    if (user.role === 'INSTITUTION_ADMIN') {
      where.institutionId = user.institutionId;
    }
    if (status) {
      where.status = status;
    }

    const [total, batches] = await Promise.all([
      prisma.dataImportBatch.count({ where }),
      prisma.dataImportBatch.findMany({
        where,
        include: {
          institution: { select: { name: true, officialCode: true } },
          uploader: { select: { name: true, email: true } },
          reviewer: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      batches,
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
