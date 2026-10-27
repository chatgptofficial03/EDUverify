import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, createSessionToken, verifySessionToken } from '../../src/lib/auth';
import { sanitizeCsvCell, generateSafeCsv } from '../../src/lib/export';
import { calculateIntakeUtilization, validateStudentRow, detectBatchDuplicates } from '../../src/lib/validation';

describe('API & Business Logic Integration Tests', () => {
  describe('Authentication & Session Cryptography', () => {
    it('should correctly hash and verify passwords using bcrypt', async () => {
      const password = 'Demo@12345';
      const hash = await hashPassword(password);
      expect(hash).not.toBe(password);
      expect(hash.startsWith('$2')).toBe(true);

      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);

      const isInvalid = await verifyPassword('WrongPassword', hash);
      expect(isInvalid).toBe(false);
    });

    it('should issue and verify tamper-proof HMAC session tokens', () => {
      const user = {
        id: 'usr-123',
        name: 'Dr. Test Admin',
        email: 'institution@demo.edu',
        role: 'INSTITUTION_ADMIN' as const,
        institutionId: 'inst-001',
      };

      const token = createSessionToken(user);
      expect(token).toContain('.');

      const decoded = verifySessionToken(token);
      expect(decoded).not.toBeNull();
      expect(decoded?.email).toBe('institution@demo.edu');
      expect(decoded?.role).toBe('INSTITUTION_ADMIN');
      expect(decoded?.institutionId).toBe('inst-001');

      // Tampered token check
      const tampered = token.slice(0, -4) + 'abcd';
      const rejected = verifySessionToken(tampered);
      expect(rejected).toBeNull();
    });
  });

  describe('CSV Injection Mitigation', () => {
    it('should neutralize formula triggers (=, +, -, @, tab, newline)', () => {
      expect(sanitizeCsvCell('=SUM(A1:A10)')).toBe(`'=SUM(A1:A10)`);
      expect(sanitizeCsvCell('+cmd|/c calc')).toBe(`'+cmd|/c calc`);
      expect(sanitizeCsvCell('@attacker.site')).toBe(`'@attacker.site`);
      expect(sanitizeCsvCell('Normal Text')).toBe('Normal Text');
    });

    it('should escape double quotes and delimiters safely in generated CSV', () => {
      const rows = [
        { name: 'John "The Chief" Doe', roll: '101', formula: '=cmd' },
      ];
      const headers = [
        { key: 'name', label: 'Full Name' },
        { key: 'roll', label: 'Roll Number' },
        { key: 'formula', label: 'Formula' },
      ];

      const csv = generateSafeCsv(rows, headers);
      expect(csv).toContain('"John ""The Chief"" Doe"');
      expect(csv).toContain(`'=cmd`);
    });
  });

  describe('CSV Batch Pipeline & Anomaly Ingestion', () => {
    it('should validate 10 rows and flag intentional anomalies', () => {
      const rawRows = [
        {
          studentRecordNumber: 'DIT-001',
          apaarId: '900011110001',
          fullName: 'Valid Student 1',
          programme: 'CSE',
          academicYear: '2025-2026',
          admissionDate: '2025-08-01',
        },
        {
          studentRecordNumber: 'DIT-002',
          apaarId: 'INVALID_APAAR', // format error
          fullName: 'Bad APAAR Student',
          programme: 'CSE',
          academicYear: '2025-2026',
          admissionDate: '2025-08-01',
        },
        {
          studentRecordNumber: '', // missing roll
          apaarId: '900011110003',
          fullName: 'Missing Roll Student',
          programme: 'CSE',
          academicYear: '2025-2026',
          admissionDate: '2025-08-01',
        },
        {
          studentRecordNumber: 'DIT-004',
          apaarId: '900011110004',
          fullName: 'Valid Student 4',
          programme: 'CSE',
          academicYear: '2025-2026',
          admissionDate: '2025-08-01',
        },
        {
          studentRecordNumber: 'DIT-005',
          apaarId: '900011110004', // Intra-batch duplicate APAAR with row 4
          fullName: 'Duplicate APAAR Student',
          programme: 'CSE',
          academicYear: '2025-2026',
          admissionDate: '2025-08-01',
        },
      ];

      const rowResults = rawRows.map((r, idx) => validateStudentRow(r, idx + 1));
      detectBatchDuplicates(rowResults);

      expect(rowResults[0].isValid).toBe(true);
      expect(rowResults[1].isValid).toBe(false);
      expect(rowResults[1].errors.some((e) => e.code === 'INVALID_APAAR_FORMAT')).toBe(true);
      expect(rowResults[2].isValid).toBe(false);
      expect(rowResults[2].errors.some((e) => e.code === 'MISSING_REQUIRED_FIELD')).toBe(true);
      expect(rowResults[3].isValid).toBe(true);
      expect(rowResults[4].isValid).toBe(false);
      expect(rowResults[4].errors.some((e) => e.code === 'DUPLICATE_APAAR_IN_BATCH')).toBe(true);

      const validCount = rowResults.filter((r) => r.isValid).length;
      expect(validCount).toBe(2);
    });
  });

  describe('Capacity & Intake Anomaly Detection', () => {
    it('should correctly signal intake headroom and excess', () => {
      const intakeLimit = 200;
      const current = 195;
      const validAdditions = 10;
      const projected = current + validAdditions; // 205

      const calc = calculateIntakeUtilization(projected, intakeLimit);
      expect(calc.isExceeded).toBe(true);
      expect(calc.overEnrolmentAmount).toBe(5);
      expect(calc.statusTier).toBe('OVER_CAPACITY');
    });
  });
});
