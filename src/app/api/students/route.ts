import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { validateStudentRow, maskApaarId, calculateIntakeUtilization } from '@/lib/validation';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(['INSTITUTION_ADMIN', 'AICTE_ADMIN', 'OBSERVER']);

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const search = searchParams.get('search') || '';
    const programme = searchParams.get('programme') || '';
    const academicYear = searchParams.get('academicYear') || '';
    const enrolmentStatus = searchParams.get('enrolmentStatus') || '';
    const seatCategory = searchParams.get('seatCategory') || '';
    const targetInstitutionId = searchParams.get('institutionId') || '';

    // Enforce data isolation: Institution Admin can only view their own institution
    let institutionFilter = user.institutionId;
    if (user.role === 'AICTE_ADMIN' || user.role === 'OBSERVER') {
      institutionFilter = targetInstitutionId || undefined;
    }

    const where: any = {};
    if (institutionFilter) {
      where.institutionId = institutionFilter;
    }

    if (programme) where.programme = programme;
    if (academicYear) where.academicYear = academicYear;
    if (enrolmentStatus) where.enrolmentStatus = enrolmentStatus;
    if (seatCategory) where.seatCategory = seatCategory;

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { studentRecordNumber: { contains: search } },
        { apaarId: { contains: search } },
      ];
    }

    const [total, students] = await Promise.all([
      prisma.student.count({ where }),
      prisma.student.findMany({
        where,
        include: { institution: { select: { name: true, officialCode: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    // Mask APAAR by default for privacy
    const sanitizedStudents = students.map((s) => ({
      ...s,
      maskedApaarId: maskApaarId(s.apaarId),
      // Hide raw APAAR in list unless central admin explicitly querying
      apaarId: user.role === 'AICTE_ADMIN' ? s.apaarId : maskApaarId(s.apaarId),
    }));

    return NextResponse.json({
      students: sanitizedStudents,
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
    console.error('Fetch students error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(['INSTITUTION_ADMIN']);
    const body = await req.json();

    const targetInstitutionId = user.institutionId;
    if (!targetInstitutionId) {
      return NextResponse.json(
        { error: 'User is not associated with an institution.' },
        { status: 400 }
      );
    }

    // Validate student row with core validation engine
    const validation = validateStudentRow(body, 1);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: 'Validation failed.',
          issues: validation.errors,
        },
        { status: 422 }
      );
    }

    const data = validation.normalized!;

    // Check unique studentRecordNumber within institution
    const existingRoll = await prisma.student.findUnique({
      where: {
        institutionId_studentRecordNumber: {
          institutionId: targetInstitutionId,
          studentRecordNumber: data.studentRecordNumber,
        },
      },
    });

    if (existingRoll) {
      return NextResponse.json(
        {
          error: `Student record number "${data.studentRecordNumber}" already exists in your institution.`,
          field: 'studentRecordNumber',
        },
        { status: 409 }
      );
    }

    // Check APAAR ID collision across institutions (anomaly detection)
    const existingApaar = await prisma.student.findFirst({
      where: { apaarId: data.apaarId },
      include: { institution: true },
    });

    if (existingApaar) {
      return NextResponse.json(
        {
          error: `Duplicate APAAR ID collision: This APAAR ID is already registered under ${existingApaar.institution.name}.`,
          field: 'apaarId',
        },
        { status: 409 }
      );
    }

    // Check intake limit
    const institution = await prisma.institution.findUnique({
      where: { id: targetInstitutionId },
    });

    if (institution) {
      const activeCount = await prisma.student.count({
        where: { institutionId: targetInstitutionId, enrolmentStatus: 'ACTIVE' },
      });
      const intakeStatus = calculateIntakeUtilization(activeCount + 1, institution.approvedIntake);
      if (intakeStatus.isExceeded) {
        return NextResponse.json(
          {
            error: `Adding this student exceeds approved institution intake (${institution.approvedIntake} seats). Currently enrolled: ${activeCount}.`,
            intakeStatus,
          },
          { status: 400 }
        );
      }
    }

    // Create student in DB
    const student = await prisma.student.create({
      data: {
        institutionId: targetInstitutionId,
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

    // Write audit event
    await logAuditEvent({
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      institutionId: targetInstitutionId,
      action: 'CREATE_STUDENT',
      entityType: 'STUDENT',
      entityId: student.id,
      metadata: {
        studentRecordNumber: student.studentRecordNumber,
        maskedApaar: maskApaarId(student.apaarId),
        programme: student.programme,
      },
    });

    return NextResponse.json({
      success: true,
      student: { ...student, maskedApaarId: maskApaarId(student.apaarId) },
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Create student error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
