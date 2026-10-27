import {
  RowValidationResult,
  ValidationErrorItem,
  NormalizedStudentRow,
  EnrolmentStatus,
  BatchValidationSummary,
} from './types';

export const VALID_ENROLMENT_STATUSES: EnrolmentStatus[] = [
  'ACTIVE',
  'PROVISIONAL',
  'COMPLETED',
  'DISCONTINUED',
];

export const VALID_SEAT_CATEGORIES = [
  'General',
  'OBC',
  'SC',
  'ST',
  'EWS',
  'Management',
  'TFW',
];

/**
 * Validates 12-digit demonstration APAAR ID.
 * Documented as a prototype demonstration format check.
 */
export function isValidApaarFormat(apaarId: string | undefined | null): boolean {
  if (!apaarId) return false;
  const cleaned = String(apaarId).trim().replace(/[-\s]/g, '');
  return /^\d{12}$/.test(cleaned);
}

/**
 * Validates Date format (YYYY-MM-DD) and check if realistic
 */
export function isValidDate(dateStr: string | undefined | null): boolean {
  if (!dateStr) return false;
  const trimmed = String(dateStr).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return false;
  const d = new Date(trimmed);
  if (isNaN(d.getTime())) return false;
  const year = d.getFullYear();
  return year >= 1970 && year <= 2030;
}

/**
 * Masks APAAR ID by default for privacy (e.g. XXXXXXXX4589)
 */
export function maskApaarId(apaarId: string | undefined | null): string {
  if (!apaarId) return 'N/A';
  const clean = String(apaarId).trim();
  if (clean.length < 4) return 'XXXX';
  const last4 = clean.slice(-4);
  return 'X'.repeat(Math.max(4, clean.length - 4)) + last4;
}

/**
 * Normalizes boolean status flags (NRI, OCI, Foreign National)
 */
export function parseBoolFlag(val: any): boolean {
  if (typeof val === 'boolean') return val;
  if (!val) return false;
  const s = String(val).trim().toLowerCase();
  return s === 'true' || s === 'yes' || s === '1' || s === 'y';
}

/**
 * Sanitizes and normalizes a single student record
 */
export function normalizeStudentRecord(raw: Record<string, any>): NormalizedStudentRow {
  const cleanApaar = String(raw.apaarId || '').trim().replace(/[-\s]/g, '');
  let status: EnrolmentStatus = 'ACTIVE';
  const rawStatus = String(raw.enrolmentStatus || 'ACTIVE').trim().toUpperCase();
  if (VALID_ENROLMENT_STATUSES.includes(rawStatus as EnrolmentStatus)) {
    status = rawStatus as EnrolmentStatus;
  }

  return {
    studentRecordNumber: String(raw.studentRecordNumber || '').trim(),
    apaarId: cleanApaar,
    fullName: String(raw.fullName || '').trim(),
    programme: String(raw.programme || '').trim(),
    course: String(raw.course || 'Undergraduate').trim(),
    academicYear: String(raw.academicYear || '2025-2026').trim(),
    admissionDate: String(raw.admissionDate || '').trim(),
    enrolmentStatus: status,
    seatCategory: String(raw.seatCategory || 'General').trim(),
    nriStatus: parseBoolFlag(raw.nriStatus),
    ociStatus: parseBoolFlag(raw.ociStatus),
    foreignNationalStatus: parseBoolFlag(raw.foreignNationalStatus),
  };
}

/**
 * Validates a single student record row
 */
export function validateStudentRow(
  raw: Record<string, any>,
  rowNumber: number
): RowValidationResult {
  const errors: ValidationErrorItem[] = [];

  // Required Field: studentRecordNumber
  const studentRecordNumber = String(raw.studentRecordNumber || '').trim();
  if (!studentRecordNumber) {
    errors.push({
      code: 'MISSING_REQUIRED_FIELD',
      field: 'studentRecordNumber',
      message: 'Student record number is required.',
      severity: 'ERROR',
      suggestedResolution: 'Provide the institutional enrolment/roll number.',
      rowNumber,
    });
  }

  // Required Field: fullName
  const fullName = String(raw.fullName || '').trim();
  if (!fullName) {
    errors.push({
      code: 'MISSING_REQUIRED_FIELD',
      field: 'fullName',
      message: 'Student full name is required.',
      severity: 'ERROR',
      suggestedResolution: 'Enter the student’s official registered name.',
      rowNumber,
    });
  }

  // Required Field: programme
  const programme = String(raw.programme || '').trim();
  if (!programme) {
    errors.push({
      code: 'MISSING_REQUIRED_FIELD',
      field: 'programme',
      message: 'Academic programme is required.',
      severity: 'ERROR',
      suggestedResolution: 'Specify approved programme (e.g. B.Tech Computer Science).',
      rowNumber,
    });
  }

  // APAAR ID format validation
  const rawApaar = String(raw.apaarId || '').trim();
  if (!rawApaar) {
    errors.push({
      code: 'MISSING_REQUIRED_FIELD',
      field: 'apaarId',
      message: 'APAAR ID is required.',
      severity: 'ERROR',
      suggestedResolution: 'Enter a valid 12-digit APAAR identifier.',
      rowNumber,
    });
  } else if (!isValidApaarFormat(rawApaar)) {
    errors.push({
      code: 'INVALID_APAAR_FORMAT',
      field: 'apaarId',
      message: `Invalid APAAR ID "${rawApaar}". Must be exactly 12 numeric digits.`,
      severity: 'ERROR',
      suggestedResolution: 'Verify student APAAR registration card and enter 12 digits.',
      rowNumber,
    });
  }

  // Date of admission validation
  const admissionDate = String(raw.admissionDate || '').trim();
  if (!admissionDate) {
    errors.push({
      code: 'MISSING_REQUIRED_FIELD',
      field: 'admissionDate',
      message: 'Admission date is required.',
      severity: 'ERROR',
      suggestedResolution: 'Provide admission date in YYYY-MM-DD format.',
      rowNumber,
    });
  } else if (!isValidDate(admissionDate)) {
    errors.push({
      code: 'INVALID_DATE',
      field: 'admissionDate',
      message: `Invalid admission date "${admissionDate}". Must be YYYY-MM-DD.`,
      severity: 'ERROR',
      suggestedResolution: 'Reformat date to YYYY-MM-DD (e.g., 2025-08-01).',
      rowNumber,
    });
  }

  // Enrolment Status validation
  if (raw.enrolmentStatus) {
    const rawStatus = String(raw.enrolmentStatus).trim().toUpperCase();
    if (!VALID_ENROLMENT_STATUSES.includes(rawStatus as EnrolmentStatus)) {
      errors.push({
        code: 'INVALID_ENUM',
        field: 'enrolmentStatus',
        message: `Invalid enrolment status "${raw.enrolmentStatus}". Must be one of: ${VALID_ENROLMENT_STATUSES.join(', ')}.`,
        severity: 'ERROR',
        suggestedResolution: 'Select ACTIVE, PROVISIONAL, COMPLETED, or DISCONTINUED.',
        rowNumber,
      });
    }
  }

  // Academic Year validation
  const academicYear = String(raw.academicYear || '').trim();
  if (!academicYear) {
    errors.push({
      code: 'MISSING_REQUIRED_FIELD',
      field: 'academicYear',
      message: 'Academic year is required.',
      severity: 'ERROR',
      suggestedResolution: 'Provide academic year, e.g., 2025-2026.',
      rowNumber,
    });
  }

  const hasErrors = errors.some((e) => e.severity === 'ERROR');
  const hasWarnings = errors.some((e) => e.severity === 'WARNING');

  return {
    rowNumber,
    raw,
    normalized: hasErrors ? undefined : normalizeStudentRecord(raw),
    isValid: !hasErrors,
    hasWarnings,
    errors,
  };
}

/**
 * Detects intra-batch duplicates across APAAR ID and Student Record Number
 */
export function detectBatchDuplicates(rows: RowValidationResult[]): void {
  const apaarSeen = new Map<string, number>(); // apaarId -> first rowNumber
  const studentNumSeen = new Map<string, number>(); // studentRecordNumber -> first rowNumber

  for (const row of rows) {
    const apaar = String(row.raw.apaarId || '').trim().replace(/[-\s]/g, '');
    const studentNum = String(row.raw.studentRecordNumber || '').trim();

    if (apaar && isValidApaarFormat(apaar)) {
      if (apaarSeen.has(apaar)) {
        const firstRow = apaarSeen.get(apaar)!;
        row.isValid = false;
        row.errors.push({
          code: 'DUPLICATE_APAAR_IN_BATCH',
          field: 'apaarId',
          message: `Duplicate APAAR ID within this uploaded batch (collides with row ${firstRow}).`,
          severity: 'ERROR',
          suggestedResolution: 'Ensure each student has a unique APAAR ID in the upload file.',
          rowNumber: row.rowNumber,
        });
      } else {
        apaarSeen.set(apaar, row.rowNumber);
      }
    }

    if (studentNum) {
      if (studentNumSeen.has(studentNum)) {
        const firstRow = studentNumSeen.get(studentNum)!;
        row.isValid = false;
        row.errors.push({
          code: 'DUPLICATE_STUDENT_NUMBER',
          field: 'studentRecordNumber',
          message: `Duplicate Student Record Number within this batch (collides with row ${firstRow}).`,
          severity: 'ERROR',
          suggestedResolution: 'Verify roll/record numbers are unique per student.',
          rowNumber: row.rowNumber,
        });
      } else {
        studentNumSeen.set(studentNum, row.rowNumber);
      }
    }
  }
}

/**
 * Calculates intake utilization percentage and thresholds
 */
export function calculateIntakeUtilization(currentEnrolment: number, approvedIntake: number) {
  if (approvedIntake <= 0) {
    return {
      currentEnrolment,
      approvedIntake: 0,
      remainingSeats: 0,
      utilizationPercentage: 0,
      overEnrolmentAmount: currentEnrolment,
      statusTier: 'OVER_CAPACITY' as const,
      isWarning: true,
      isExceeded: currentEnrolment > 0,
    };
  }

  const utilizationPercentage = Number(((currentEnrolment / approvedIntake) * 100).toFixed(2));
  const remainingSeats = Math.max(0, approvedIntake - currentEnrolment);
  const overEnrolmentAmount = Math.max(0, currentEnrolment - approvedIntake);

  let statusTier: 'NORMAL' | 'APPROACHING' | 'AT_CAPACITY' | 'OVER_CAPACITY' = 'NORMAL';
  if (utilizationPercentage > 100) {
    statusTier = 'OVER_CAPACITY';
  } else if (utilizationPercentage === 100) {
    statusTier = 'AT_CAPACITY';
  } else if (utilizationPercentage >= 80) {
    statusTier = 'APPROACHING';
  }

  return {
    currentEnrolment,
    approvedIntake,
    remainingSeats,
    utilizationPercentage,
    overEnrolmentAmount,
    statusTier,
    isWarning: statusTier === 'APPROACHING',
    isExceeded: statusTier === 'OVER_CAPACITY',
  };
}
