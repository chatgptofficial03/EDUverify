import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(['INSTITUTION_ADMIN']);

    const batch = await prisma.dataImportBatch.findUnique({
      where: { id: params.id },
      include: { institution: true },
    });

    if (!batch) {
      return NextResponse.json({ error: 'Batch not found.' }, { status: 404 });
    }

    if (batch.institutionId !== user.institutionId) {
      return NextResponse.json(
        { error: 'Forbidden. You cannot submit batches belonging to another institution.' },
        { status: 403 }
      );
    }

    // Allowed transition check: can only submit from VALIDATED or DRAFT
    if (batch.status !== 'VALIDATED' && batch.status !== 'DRAFT') {
      return NextResponse.json(
        { error: `Cannot submit batch in current status "${batch.status}".` },
        { status: 400 }
      );
    }

    const updated = await prisma.dataImportBatch.update({
      where: { id: params.id },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
    });

    // Notify all AICTE Admins
    const aicteAdmins = await prisma.user.findMany({
      where: { role: 'AICTE_ADMIN', isActive: true },
      select: { id: true },
    });

    if (aicteAdmins.length) {
      await prisma.notification.createMany({
        data: aicteAdmins.map((admin) => ({
          userId: admin.id,
          title: 'New Enrolment Batch Submitted',
          message: `${batch.institution.name} submitted batch "${batch.filename}" (${batch.totalRows} rows) for review.`,
          category: 'SUBMISSION',
        })),
      });
    }

    // Write audit event
    await logAuditEvent({
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      institutionId: user.institutionId,
      action: 'BATCH_SUBMIT',
      entityType: 'BATCH',
      entityId: batch.id,
      metadata: {
        filename: batch.filename,
        totalRows: batch.totalRows,
        validRows: batch.validRows,
      },
    });

    return NextResponse.json({ success: true, batch: updated });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Submit batch error:', err);
    return NextResponse.json({ error: 'Failed to submit batch.' }, { status: 500 });
  }
}
