import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import { NormalizedStudentRow, RowValidationResult } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(['INSTITUTION_ADMIN']);
    const body = await req.json();

    const {
      filename = 'upload.csv',
      validRows = [],
      allRows = [],
    }: {
      filename: string;
      validRows: NormalizedStudentRow[];
      allRows: RowValidationResult[];
    } = body;

    const institutionId = user.institutionId!;

    if (!validRows.length && !allRows.length) {
      return NextResponse.json(
        { error: 'No rows to commit.' },
        { status: 400 }
      );
    }

    const totalCount = allRows.length || validRows.length;
    const validCount = validRows.length;
    const invalidCount = totalCount - validCount;
    const duplicateCount = allRows.filter((r) =>
      r.errors?.some((e) => e.code.includes('DUPLICATE'))
    ).length;

    // Execute transactional import
    const batch = await prisma.$transaction(async (tx) => {
      // 1. Create the DataImportBatch
      const newBatch = await tx.dataImportBatch.create({
        data: {
          institutionId,
          uploadedBy: user.id,
          filename,
          totalRows: totalCount,
          validRows: validCount,
          invalidRows: invalidCount,
          duplicateRows: duplicateCount,
          status: 'VALIDATED',
        },
      });

      // 2. Insert ImportRow records for historical inspection & review
      if (allRows.length) {
        for (const row of allRows) {
          await tx.importRow.create({
            data: {
              batchId: newBatch.id,
              rowNumber: row.rowNumber,
              rawDataJson: JSON.stringify(row.raw),
              parsedDataJson: row.normalized ? JSON.stringify(row.normalized) : null,
              validationStatus: row.isValid ? (row.hasWarnings ? 'WARNING' : 'VALID') : 'INVALID',
              validationErrors: row.errors?.length ? JSON.stringify(row.errors) : null,
            },
          });
        }
      }

      // 3. Insert valid students into the Student table
      for (const s of validRows) {
        await tx.student.create({
          data: {
            institutionId,
            studentRecordNumber: s.studentRecordNumber,
            apaarId: s.apaarId,
            fullName: s.fullName,
            programme: s.programme,
            course: s.course,
            academicYear: s.academicYear,
            admissionDate: s.admissionDate,
            enrolmentStatus: s.enrolmentStatus,
            seatCategory: s.seatCategory,
            nriStatus: s.nriStatus,
            ociStatus: s.ociStatus,
            foreignNationalStatus: s.foreignNationalStatus,
          },
        });
      }

      return newBatch;
    });

    // Write audit event
    await logAuditEvent({
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      institutionId,
      action: 'BATCH_COMMIT',
      entityType: 'BATCH',
      entityId: batch.id,
      metadata: {
        filename,
        totalRows: totalCount,
        validRows: validCount,
        invalidRows: invalidCount,
      },
    });

    return NextResponse.json({
      success: true,
      batchId: batch.id,
      batch,
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Commit import error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to commit batch to database.' },
      { status: 500 }
    );
  }
}
