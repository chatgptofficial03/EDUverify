import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(['INSTITUTION_ADMIN', 'AICTE_ADMIN', 'OBSERVER']);

    const batch = await prisma.dataImportBatch.findUnique({
      where: { id: params.id },
      include: {
        institution: true,
        uploader: { select: { name: true, email: true } },
        reviewer: { select: { name: true, email: true } },
        rows: {
          orderBy: { rowNumber: 'asc' },
        },
      },
    });

    if (!batch) {
      return NextResponse.json({ error: 'Batch not found.' }, { status: 404 });
    }

    if (user.role === 'INSTITUTION_ADMIN' && batch.institutionId !== user.institutionId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ batch });
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
