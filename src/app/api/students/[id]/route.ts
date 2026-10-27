import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { validateStudentRow, maskApaarId } from '@/lib/validation';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(['INSTITUTION_ADMIN', 'AICTE_ADMIN', 'OBSERVER']);
    const student = await prisma.student.findUnique({
      where: { id: params.id },
      include: { institution: true, verificationRequests: true },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found.' }, { status: 404 });
    }

    // Institution isolation check
    if (user.role === 'INSTITUTION_ADMIN' && student.institutionId !== user.institutionId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      student: {
        ...student,
        maskedApaarId: maskApaarId(student.apaarId),
        apaarId: user.role === 'AICTE_ADMIN' ? student.apaarId : maskApaarId(student.apaarId),
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

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(['INSTITUTION_ADMIN']);
    const existing = await prisma.student.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Student not found.' }, { status: 404 });
    }

    // Ensure institution admin owns this student
    if (existing.institutionId !== user.institutionId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();

    // Validate update
    const validation = validateStudentRow(body, 1);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation failed.', issues: validation.errors },
        { status: 422 }
      );
    }

    const data = validation.normalized!;

    // If student record number changed, check uniqueness
    if (data.studentRecordNumber !== existing.studentRecordNumber) {
      const conflict = await prisma.student.findUnique({
        where: {
          institutionId_studentRecordNumber: {
            institutionId: user.institutionId!,
            studentRecordNumber: data.studentRecordNumber,
          },
        },
      });
      if (conflict) {
        return NextResponse.json(
          { error: `Record number "${data.studentRecordNumber}" is already in use.` },
          { status: 409 }
        );
      }
    }

    // If APAAR changed, check conflict
    if (data.apaarId !== existing.apaarId) {
      const apaarConflict = await prisma.student.findFirst({
        where: {
          apaarId: data.apaarId,
          id: { not: existing.id },
        },
      });
      if (apaarConflict) {
        return NextResponse.json(
          { error: `Duplicate APAAR ID collision with existing student record.` },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.student.update({
      where: { id: params.id },
      data: {
        studentRecordNumber: data.studentRecordNumber,
        apaarId: data.apaarId,
        fullName: data.fullName,
        dateOfBirth: body.dateOfBirth || null,
        programme: data.programme,
        course: data.course,
        academicYear: data.academicYear,
        admissionDate: data.admissionDate,
        enrolmentStatus: data.enrolmentStatus,
        seatCategory: data.seatCategory,
        nriStatus: data.nriStatus,
        ociStatus: data.ociStatus,
        foreignNationalStatus: data.foreignNationalStatus,
      },
    });

    await logAuditEvent({
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      institutionId: user.institutionId,
      action: 'UPDATE_STUDENT',
      entityType: 'STUDENT',
      entityId: updated.id,
      metadata: {
        studentRecordNumber: updated.studentRecordNumber,
        maskedApaar: maskApaarId(updated.apaarId),
      },
    });

    return NextResponse.json({
      success: true,
      student: { ...updated, maskedApaarId: maskApaarId(updated.apaarId) },
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Update student error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(['INSTITUTION_ADMIN']);
    const existing = await prisma.student.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Student not found.' }, { status: 404 });
    }

    if (existing.institutionId !== user.institutionId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.student.delete({ where: { id: params.id } });

    await logAuditEvent({
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      institutionId: user.institutionId,
      action: 'DELETE_STUDENT',
      entityType: 'STUDENT',
      entityId: params.id,
      metadata: { studentRecordNumber: existing.studentRecordNumber },
    });

    return NextResponse.json({ success: true });
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
