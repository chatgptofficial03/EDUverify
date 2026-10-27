import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { maskApaarId } from '@/lib/validation';
import { logAuditEvent } from '@/lib/audit';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(['VERIFIER', 'AICTE_ADMIN', 'INSTITUTION_ADMIN']);
    const body = await req.json();
    const query = String(body.query || '').trim();
    const purpose = String(body.purpose || 'Academic & Enrolment Verification').trim();

    if (!query) {
      return NextResponse.json(
        { error: 'Please provide a Student Record Number, APAAR ID, or Verification Reference.' },
        { status: 400 }
      );
    }

    const cleanApaar = query.replace(/[-\s]/g, '');

    // Search student by roll, APAAR, or verification reference
    let student = await prisma.student.findFirst({
      where: {
        OR: [
          { studentRecordNumber: query },
          { apaarId: cleanApaar },
          {
            verificationRequests: {
              some: { verificationReference: query },
            },
          },
        ],
      },
      include: {
        institution: true,
        verificationRequests: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!student) {
      // Record query attempt in audit log
      await logAuditEvent({
        actorUserId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        action: 'VERIFICATION_QUERY_NOT_FOUND',
        entityType: 'VERIFICATION',
        metadata: { queryTerm: query.length > 4 ? `***${query.slice(-4)}` : '***' },
      });

      return NextResponse.json({
        found: false,
        message: 'No student record found matching the provided identifier.',
      });
    }

    // Check latest batch approval status for this student's institution
    const latestBatch = await prisma.dataImportBatch.findFirst({
      where: { institutionId: student.institutionId },
      orderBy: { createdAt: 'desc' },
    });

    // Generate unique verification receipt reference
    const timestamp = new Date().toISOString();
    const hash = crypto
      .createHash('sha256')
      .update(`${student.id}-${user.id}-${timestamp}`)
      .digest('hex')
      .slice(0, 8)
      .toUpperCase();

    const verificationReference = `VER-DEMO-2026-${hash}`;

    // Write audit event
    await logAuditEvent({
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      institutionId: student.institutionId,
      action: 'VERIFICATION_QUERY_SUCCESS',
      entityType: 'VERIFICATION',
      entityId: student.id,
      metadata: {
        reference: verificationReference,
        purpose,
        maskedApaar: maskApaarId(student.apaarId),
      },
    });

    // Privacy-minimized payload
    return NextResponse.json({
      found: true,
      verificationReference,
      timestamp,
      purpose,
      verifiedBy: user.name,
      verifiedByRole: user.role,
      student: {
        fullName: student.fullName,
        studentRecordNumber: student.studentRecordNumber,
        maskedApaarId: maskApaarId(student.apaarId),
        programme: student.programme,
        course: student.course,
        academicYear: student.academicYear,
        enrolmentStatus: student.enrolmentStatus,
        institutionName: student.institution.name,
        institutionCode: student.institution.officialCode,
        institutionState: student.institution.state,
        approvalStatus: student.institution.approvalStatus,
        batchStatus: latestBatch?.status || 'APPROVED',
      },
      disclaimer:
        'DEMONSTRATION VERIFICATION RECEIPT: Issued by EduVerify Prototype under SIH 2026. Data verified against institutional and AICTE demo records. Not an official UIDAI or Ministry certificate.',
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Verification query error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
