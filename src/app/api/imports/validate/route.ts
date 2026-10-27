import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import {
  validateStudentRow,
  detectBatchDuplicates,
  calculateIntakeUtilization,
  isValidApaarFormat,
} from '@/lib/validation';
import { RowValidationResult, BatchValidationSummary } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(['INSTITUTION_ADMIN']);
    const body = await req.json();
    const rawRows: Record<string, any>[] = body.rows || [];

    if (!rawRows.length) {
      return NextResponse.json(
        { error: 'No data rows provided for validation.' },
        { status: 400 }
      );
    }

    if (rawRows.length > 2000) {
      return NextResponse.json(
        { error: 'Batch row limit exceeded. Maximum 2000 rows per batch.' },
        { status: 400 }
      );
    }

    const institutionId = user.institutionId!;
    const institution = await prisma.institution.findUnique({
      where: { id: institutionId },
    });

    const approvedIntake = institution?.approvedIntake || 0;
    const currentActiveEnrolment = await prisma.student.count({
      where: { institutionId, enrolmentStatus: 'ACTIVE' },
    });

    // 1. Validate each row independently
    const rowResults: RowValidationResult[] = rawRows.map((r, idx) =>
      validateStudentRow(r, idx + 1)
    );

    // 2. Intra-batch duplicate detection (within file)
    detectBatchDuplicates(rowResults);

    // 3. Check collisions against existing database records
    const apaarList = rowResults
      .map((r) => String(r.raw.apaarId || '').trim().replace(/[-\s]/g, ''))
      .filter((a) => isValidApaarFormat(a));

    const rollList = rowResults
      .map((r) => String(r.raw.studentRecordNumber || '').trim())
      .filter((roll) => Boolean(roll));

    const [existingApaarCollisions, existingRollCollisions] = await Promise.all([
      prisma.student.findMany({
        where: { apaarId: { in: apaarList } },
        include: { institution: { select: { name: true } } },
      }),
      prisma.student.findMany({
        where: {
          institutionId,
          studentRecordNumber: { in: rollList },
        },
        select: { studentRecordNumber: true },
      }),
    ]);

    const existingApaarMap = new Map<string, string>();
    existingApaarCollisions.forEach((s) => {
      existingApaarMap.set(s.apaarId, s.institution.name);
    });

    const existingRollSet = new Set(existingRollCollisions.map((s) => s.studentRecordNumber));

    // Apply database collision errors
    for (const row of rowResults) {
      const cleanApaar = String(row.raw.apaarId || '').trim().replace(/[-\s]/g, '');
      const roll = String(row.raw.studentRecordNumber || '').trim();

      if (existingApaarMap.has(cleanApaar)) {
        const instName = existingApaarMap.get(cleanApaar);
        row.isValid = false;
        row.errors.push({
          code: 'DUPLICATE_APAAR_EXISTING',
          field: 'apaarId',
          message: `APAAR ID collision: Already registered under "${instName}".`,
          severity: 'ERROR',
          suggestedResolution: 'Contact state AICTE coordinator if this is a transfer record.',
          rowNumber: row.rowNumber,
        });
      }

      if (existingRollSet.has(roll)) {
        row.isValid = false;
        row.errors.push({
          code: 'DUPLICATE_STUDENT_NUMBER',
          field: 'studentRecordNumber',
          message: `Student record number "${roll}" already exists in your institution database.`,
          severity: 'ERROR',
          suggestedResolution: 'Change or verify the institutional roll number.',
          rowNumber: row.rowNumber,
        });
      }
    }

    // 4. Calculate counts
    const totalRows = rowResults.length;
    const validRows = rowResults.filter((r) => r.isValid).length;
    const invalidRows = totalRows - validRows;
    const duplicateRows = rowResults.filter((r) =>
      r.errors.some(
        (e) =>
          e.code === 'DUPLICATE_APAAR_IN_BATCH' ||
          e.code === 'DUPLICATE_APAAR_EXISTING' ||
          e.code === 'DUPLICATE_STUDENT_NUMBER'
      )
    ).length;
    const warningRows = rowResults.filter((r) => r.hasWarnings).length;

    // 5. Intake utilization projection
    const projectedEnrolment = currentActiveEnrolment + validRows;
    const intakeStatus = calculateIntakeUtilization(projectedEnrolment, approvedIntake);

    // If batch additions would exceed intake, attach warning to summary
    if (intakeStatus.isExceeded) {
      for (const row of rowResults) {
        if (row.isValid) {
          row.errors.push({
            code: 'INTAKE_LIMIT_EXCEEDED',
            field: 'enrolmentStatus',
            message: `Intake capacity exceeded: Batch increases active count to ${projectedEnrolment}/${approvedIntake}.`,
            severity: 'WARNING',
            rowNumber: row.rowNumber,
          });
          row.hasWarnings = true;
        }
      }
    }

    const summary: BatchValidationSummary = {
      totalRows,
      validRows,
      invalidRows,
      duplicateRows,
      warningRows,
      rows: rowResults,
      intakeUtilizationPreview: {
        currentEnrolment: currentActiveEnrolment,
        batchAdditions: validRows,
        projectedEnrolment,
        approvedIntake,
        projectedUtilization: intakeStatus.utilizationPercentage,
        isOverLimit: intakeStatus.isExceeded,
      },
    };

    return NextResponse.json(summary);
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Validation route error:', err);
    return NextResponse.json({ error: 'Validation processing failed' }, { status: 500 });
  }
}
