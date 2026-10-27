export type Role = 'INSTITUTION_ADMIN' | 'AICTE_ADMIN' | 'VERIFIER' | 'OBSERVER';

export type EnrolmentStatus = 'ACTIVE' | 'PROVISIONAL' | 'COMPLETED' | 'DISCONTINUED';

export type BatchStatus =
  | 'DRAFT'
  | 'VALIDATING'
  | 'VALIDATED'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export type ValidationSeverity = 'ERROR' | 'WARNING';

export type ValidationErrorCode =
  | 'MISSING_REQUIRED_FIELD'
  | 'INVALID_APAAR_FORMAT'
  | 'DUPLICATE_APAAR_IN_BATCH'
  | 'DUPLICATE_APAAR_EXISTING'
  | 'DUPLICATE_STUDENT_NUMBER'
  | 'INVALID_DATE'
  | 'INVALID_ENUM'
  | 'INTAKE_LIMIT_WARNING'
  | 'INTAKE_LIMIT_EXCEEDED'
  | 'CONFLICTING_STUDENT_DATA';

export interface ValidationErrorItem {
  code: ValidationErrorCode;
  message: string;
  field: string;
  severity: ValidationSeverity;
  suggestedResolution?: string;
  rowNumber?: number;
}

export interface StudentInputRow {
  studentRecordNumber: string;
  apaarId: string;
  fullName: string;
  programme: string;
  course?: string;
  academicYear: string;
  admissionDate: string;
  enrolmentStatus?: string;
  seatCategory?: string;
  nriStatus?: string | boolean;
  ociStatus?: string | boolean;
  foreignNationalStatus?: string | boolean;
}

export interface NormalizedStudentRow {
  studentRecordNumber: string;
  apaarId: string;
  fullName: string;
  programme: string;
  course: string;
  academicYear: string;
  admissionDate: string;
  enrolmentStatus: EnrolmentStatus;
  seatCategory: string;
  nriStatus: boolean;
  ociStatus: boolean;
  foreignNationalStatus: boolean;
}

export interface RowValidationResult {
  rowNumber: number;
  raw: Record<string, string>;
  normalized?: NormalizedStudentRow;
  isValid: boolean;
  hasWarnings: boolean;
  errors: ValidationErrorItem[];
}

export interface BatchValidationSummary {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicateRows: number;
  warningRows: number;
  rows: RowValidationResult[];
  intakeUtilizationPreview: {
    currentEnrolment: number;
    batchAdditions: number;
    projectedEnrolment: number;
    approvedIntake: number;
    projectedUtilization: number;
    isOverLimit: boolean;
  };
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  institutionId?: string | null;
  institutionName?: string | null;
  institutionCode?: string | null;
}
