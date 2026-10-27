import { describe, it, expect } from 'vitest';
import {
  isValidApaarFormat,
  isValidDate,
  maskApaarId,
  validateStudentRow,
  detectBatchDuplicates,
  calculateIntakeUtilization,
  normalizeStudentRecord,
} from '../../src/lib/validation';

describe('Core Validation Engine Tests', () => {
  describe('APAAR ID Format Validation', () => {
    it('should accept valid 12-digit numeric APAAR IDs', () => {
      expect(isValidApaarFormat('900012345678')).toBe(true);
      expect(isValidApaarFormat('1234-5678-9012')).toBe(true);
      expect(isValidApaarFormat(' 1234 5678 9012 ')).toBe(true);
    });

    it('should reject invalid APAAR formats', () => {
      expect(isValidApaarFormat('')).toBe(false);
      expect(isValidApaarFormat(null)).toBe(false);
      expect(isValidApaarFormat('12345')).toBe(false); // too short
      expect(isValidApaarFormat('1234567890123')).toBe(false); // 13 digits
      expect(isValidApaarFormat('9000ABCD5678')).toBe(false); // contains letters
    });
  });

  describe('Date Validation', () => {
    it('should accept valid YYYY-MM-DD dates within 1970-2030', () => {
      expect(isValidDate('2025-08-01')).toBe(true);
      expect(isValidDate('2004-12-31')).toBe(true);
    });

    it('should reject malformed dates', () => {
      expect(isValidDate('')).toBe(false);
      expect(isValidDate('01/08/2025')).toBe(false);
      expect(isValidDate('2025-14-45')).toBe(false); // invalid month/day
      expect(isValidDate('1940-01-01')).toBe(false); // out of bound
    });
  });

  describe('Identifier Masking', () => {
    it('should mask all except the last 4 digits of APAAR ID', () => {
      expect(maskApaarId('900012345678')).toBe('XXXXXXXX5678');
      expect(maskApaarId('1234')).toBe('XXXX1234');
      expect(maskApaarId('')).toBe('N/A');
    });
  });

  describe('Single Row Validation & Normalization', () => {
    it('should validate a clean student row successfully', () => {
      const row = {
        studentRecordNumber: 'DIT-2025-001',
        apaarId: '900012345678',
        fullName: 'Rahul Sharma',
        programme: 'B.Tech Computer Science & Engineering',
        academicYear: '2025-2026',
        admissionDate: '2025-08-01',
        enrolmentStatus: 'ACTIVE',
        seatCategory: 'General',
      };

      const result = validateStudentRow(row, 1);
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
      expect(result.normalized).toBeDefined();
      expect(result.normalized?.fullName).toBe('Rahul Sharma');
    });

    it('should collect errors for missing required fields and bad enums', () => {
      const row = {
        studentRecordNumber: '',
        apaarId: 'INVALID_APAAR',
        fullName: '',
        programme: 'B.Tech CSE',
        academicYear: '',
        admissionDate: 'not-a-date',
        enrolmentStatus: 'NOT_VALID_STATUS',
      };

      const result = validateStudentRow(row, 2);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.code === 'MISSING_REQUIRED_FIELD')).toBe(true);
      expect(result.errors.some((e) => e.code === 'INVALID_APAAR_FORMAT')).toBe(true);
      expect(result.errors.some((e) => e.code === 'INVALID_DATE')).toBe(true);
      expect(result.errors.some((e) => e.code === 'INVALID_ENUM')).toBe(true);
    });
  });

  describe('Intra-Batch Duplicate Detection', () => {
    it('should flag duplicate APAAR IDs and student record numbers in the batch', () => {
      const row1 = validateStudentRow(
        {
          studentRecordNumber: 'ROLL-01',
          apaarId: '900011112222',
          fullName: 'Student One',
          programme: 'CSE',
          academicYear: '2025-2026',
          admissionDate: '2025-08-01',
        },
        1
      );

      const row2 = validateStudentRow(
        {
          studentRecordNumber: 'ROLL-02',
          apaarId: '900011112222', // Duplicate APAAR
          fullName: 'Student Two',
          programme: 'CSE',
          academicYear: '2025-2026',
          admissionDate: '2025-08-01',
        },
        2
      );

      const row3 = validateStudentRow(
        {
          studentRecordNumber: 'ROLL-01', // Duplicate Roll Number
          apaarId: '900033334444',
          fullName: 'Student Three',
          programme: 'CSE',
          academicYear: '2025-2026',
          admissionDate: '2025-08-01',
        },
        3
      );

      const rows = [row1, row2, row3];
      detectBatchDuplicates(rows);

      expect(rows[0].isValid).toBe(true);
      expect(rows[1].isValid).toBe(false);
      expect(rows[1].errors.some((e) => e.code === 'DUPLICATE_APAAR_IN_BATCH')).toBe(true);
      expect(rows[2].isValid).toBe(false);
      expect(rows[2].errors.some((e) => e.code === 'DUPLICATE_STUDENT_NUMBER')).toBe(true);
    });
  });

  describe('Intake Utilization Calculations', () => {
    it('should calculate accurate percentage and status tiers', () => {
      // 75 out of 100 -> 75% NORMAL
      const res1 = calculateIntakeUtilization(75, 100);
      expect(res1.utilizationPercentage).toBe(75);
      expect(res1.statusTier).toBe('NORMAL');
      expect(res1.isWarning).toBe(false);

      // 88 out of 100 -> 88% APPROACHING
      const res2 = calculateIntakeUtilization(88, 100);
      expect(res2.utilizationPercentage).toBe(88);
      expect(res2.statusTier).toBe('APPROACHING');
      expect(res2.isWarning).toBe(true);

      // 100 out of 100 -> 100% AT_CAPACITY
      const res3 = calculateIntakeUtilization(100, 100);
      expect(res3.utilizationPercentage).toBe(100);
      expect(res3.statusTier).toBe('AT_CAPACITY');

      // 105 out of 100 -> 105% OVER_CAPACITY
      const res4 = calculateIntakeUtilization(105, 100);
      expect(res4.utilizationPercentage).toBe(105);
      expect(res4.statusTier).toBe('OVER_CAPACITY');
      expect(res4.overEnrolmentAmount).toBe(5);
    });

    it('should handle zero intake gracefully without division by zero', () => {
      const res = calculateIntakeUtilization(10, 0);
      expect(res.statusTier).toBe('OVER_CAPACITY');
      expect(res.overEnrolmentAmount).toBe(10);
      expect(res.utilizationPercentage).toBe(0);
    });
  });
});
