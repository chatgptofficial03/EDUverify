import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { generateSafeCsv } from '@/lib/export';
import { maskApaarId } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(['INSTITUTION_ADMIN', 'AICTE_ADMIN', 'OBSERVER']);
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'students';

    let csvContent = '';
    let filename = `eduverify_${type}_report_${Date.now()}.csv`;

    if (type === 'students') {
      const where: any = {};
      if (user.role === 'INSTITUTION_ADMIN') {
        where.institutionId = user.institutionId;
      }

      const students = await prisma.student.findMany({
        where,
        include: { institution: { select: { name: true, officialCode: true } } },
        orderBy: { studentRecordNumber: 'asc' },
      });

      const headers = [
        { key: 'studentRecordNumber', label: 'Student Record Number' },
        { key: 'apaarId', label: 'APAAR ID (Masked)' },
        { key: 'fullName', label: 'Full Name' },
        { key: 'programme', label: 'Programme' },
        { key: 'course', label: 'Course' },
        { key: 'academicYear', label: 'Academic Year' },
        { key: 'admissionDate', label: 'Admission Date' },
        { key: 'enrolmentStatus', label: 'Status' },
        { key: 'seatCategory', label: 'Seat Category' },
        { key: 'institutionName', label: 'Institution' },
      ];

      const formatted = students.map((s) => ({
        ...s,
        apaarId: maskApaarId(s.apaarId),
        institutionName: s.institution.name,
      }));

      csvContent = generateSafeCsv(formatted, headers);
    } else if (type === 'institutions') {
      if (user.role === 'INSTITUTION_ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const institutions = await prisma.institution.findMany({
        include: { _count: { select: { students: true } } },
        orderBy: { name: 'asc' },
      });

      const headers = [
        { key: 'officialCode', label: 'AICTE Code' },
        { key: 'name', label: 'Institution Name' },
        { key: 'state', label: 'State' },
        { key: 'district', label: 'District' },
        { key: 'approvalStatus', label: 'Approval Status' },
        { key: 'approvedIntake', label: 'Approved Intake' },
        { key: 'totalStudents', label: 'Total Enrolled' },
      ];

      const formatted = institutions.map((i) => ({
        ...i,
        totalStudents: i._count.students,
      }));

      csvContent = generateSafeCsv(formatted, headers);
    } else if (type === 'batches') {
      const where: any = {};
      if (user.role === 'INSTITUTION_ADMIN') {
        where.institutionId = user.institutionId;
      }

      const batches = await prisma.dataImportBatch.findMany({
        where,
        include: {
          institution: { select: { name: true } },
          uploader: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      const headers = [
        { key: 'id', label: 'Batch ID' },
        { key: 'filename', label: 'Filename' },
        { key: 'institution', label: 'Institution' },
        { key: 'totalRows', label: 'Total Rows' },
        { key: 'validRows', label: 'Valid Rows' },
        { key: 'invalidRows', label: 'Invalid Rows' },
        { key: 'status', label: 'Status' },
        { key: 'uploadedBy', label: 'Uploaded By' },
      ];

      const formatted = batches.map((b) => ({
        ...b,
        institution: b.institution.name,
        uploadedBy: b.uploader?.name || 'N/A',
      }));

      csvContent = generateSafeCsv(formatted, headers);
    }

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Export report error:', err);
    return NextResponse.json({ error: 'Failed to generate report export' }, { status: 500 });
  }
}
