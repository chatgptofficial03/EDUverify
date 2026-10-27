import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(['AICTE_ADMIN']);
    const body = await req.json();

    const { decision, reviewComment } = body;

    if (!['APPROVED', 'REJECTED'].includes(decision)) {
      return NextResponse.json(
        { error: 'Invalid decision. Must be APPROVED or REJECTED.' },
        { status: 400 }
      );
    }

    if (decision === 'REJECTED' && (!reviewComment || !reviewComment.trim())) {
      return NextResponse.json(
        { error: 'A review comment explaining the rejection reason is strictly required.' },
        { status: 400 }
      );
    }

    const batch = await prisma.dataImportBatch.findUnique({
      where: { id: params.id },
      include: { institution: true },
    });

    if (!batch) {
      return NextResponse.json({ error: 'Batch not found.' }, { status: 404 });
    }

    // Update batch status atomically
    const updated = await prisma.dataImportBatch.update({
      where: { id: params.id },
      data: {
        status: decision,
        reviewedBy: user.id,
        reviewedAt: new Date(),
        reviewComment: reviewComment?.trim() || null,
      },
    });

    // Notify institution uploader
    await prisma.notification.create({
      data: {
        userId: batch.uploadedBy,
        title: `Batch Submission ${decision}`,
        message:
          decision === 'APPROVED'
            ? `Your enrolment batch "${batch.filename}" was approved by AICTE.`
            : `Your enrolment batch "${batch.filename}" was rejected. Reason: ${reviewComment}`,
        category: 'REVIEW',
      },
    });

    // Write audit event
    await logAuditEvent({
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      institutionId: batch.institutionId,
      action: decision === 'APPROVED' ? 'BATCH_APPROVE' : 'BATCH_REJECT',
      entityType: 'BATCH',
      entityId: batch.id,
      metadata: {
        decision,
        reviewComment: reviewComment || null,
        batchFilename: batch.filename,
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
    console.error('Review submission error:', err);
    return NextResponse.json({ error: 'Failed to record review decision.' }, { status: 500 });
  }
}
