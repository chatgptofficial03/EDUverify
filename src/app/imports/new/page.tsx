'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Papa from 'papaparse';
import {
  UploadCloud,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Download,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Send,
  Eye,
  ShieldAlert,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { BatchValidationSummary, RowValidationResult } from '@/lib/types';

export default function BulkUploadWizardPage() {
  const router = useRouter();

  // Wizard Steps: 1: SELECT, 2: MAP, 3: VALIDATE, 4: REVIEW, 5: COMMIT, 6: SUBMIT
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: File state
  const [file, setFile] = useState<File | null>(null);
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [rawParsedRows, setRawParsedRows] = useState<Record<string, any>[]>([]);
  const [parsing, setParsing] = useState(false);

  // Step 2: Column mapping
  const expectedColumns = [
    { key: 'studentRecordNumber', label: 'Student Record / Roll No', required: true },
    { key: 'apaarId', label: '12-Digit APAAR ID', required: true },
    { key: 'fullName', label: 'Full Student Name', required: true },
    { key: 'programme', label: 'Academic Programme', required: true },
    { key: 'academicYear', label: 'Academic Year', required: true },
    { key: 'admissionDate', label: 'Admission Date (YYYY-MM-DD)', required: true },
    { key: 'enrolmentStatus', label: 'Enrolment Status', required: false },
    { key: 'seatCategory', label: 'Seat Category', required: false },
    { key: 'nriStatus', label: 'NRI Status (true/false)', required: false },
    { key: 'ociStatus', label: 'OCI Status (true/false)', required: false },
    { key: 'foreignNationalStatus', label: 'Foreign National (true/false)', required: false },
  ];
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});

  // Step 3 & 4: Validation Summary
  const [validating, setValidating] = useState(false);
  const [validationSummary, setValidationSummary] = useState<BatchValidationSummary | null>(null);
  const [filterMode, setFilterMode] = useState<'ALL' | 'INVALID' | 'WARNING' | 'VALID'>('ALL');

  // Step 5: Commit state
  const [committing, setCommitting] = useState(false);
  const [committedBatch, setCommittedBatch] = useState<any>(null);

  // Step 6: Submission state
  const [submittingToAicte, setSubmittingToAicte] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Handle CSV file selection
  const handleFileChange = (selectedFile: File) => {
    setFile(selectedFile);
    setParsing(true);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        setParsedHeaders(headers);
        setRawParsedRows(results.data as Record<string, any>[]);

        // Auto map recognized headers
        const initialMap: Record<string, string> = {};
        expectedColumns.forEach((col) => {
          const match = headers.find(
            (h) =>
              h.toLowerCase().replace(/[^a-z0-9]/g, '') ===
              col.key.toLowerCase().replace(/[^a-z0-9]/g, '')
          );
          if (match) initialMap[col.key] = match;
        });
        setColumnMapping(initialMap);
        setParsing(false);
        setCurrentStep(2);
      },
      error: (err) => {
        alert('Failed to parse CSV: ' + err.message);
        setParsing(false);
      },
    });
  };

  // Run Server Validation
  const handleRunValidation = async () => {
    setValidating(true);
    setCurrentStep(3);

    // Transform raw rows according to column mapping
    const mappedRows = rawParsedRows.map((raw) => {
      const rowObj: Record<string, any> = {};
      expectedColumns.forEach((col) => {
        const sourceHeader = columnMapping[col.key];
        rowObj[col.key] = sourceHeader ? raw[sourceHeader] : raw[col.key] || '';
      });
      return rowObj;
    });

    try {
      const res = await fetch('/api/imports/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: mappedRows }),
      });

      const summary: BatchValidationSummary = await res.json();
      if (!res.ok) {
        alert((summary as any).error || 'Validation failed.');
        setCurrentStep(2);
        return;
      }

      setValidationSummary(summary);
      setCurrentStep(4);
    } catch (err) {
      alert('Network error while validating batch.');
      setCurrentStep(2);
    } finally {
      setValidating(false);
    }
  };

  // Commit valid rows to database
  const handleCommitImport = async () => {
    if (!validationSummary) return;
    setCommitting(true);

    const validRows = validationSummary.rows
      .filter((r) => r.isValid)
      .map((r) => r.normalized!);

    try {
      const res = await fetch('/api/imports/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file?.name || 'batch_upload.csv',
          validRows,
          allRows: validationSummary.rows,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to commit import.');
        setCommitting(false);
        return;
      }

      setCommittedBatch(data.batch);
      setCurrentStep(5);
    } catch (err) {
      alert('Error committing batch to database.');
    } finally {
      setCommitting(false);
    }
  };

  // Submit batch to AICTE central review
  const handleSubmitBatchToAicte = async () => {
    if (!committedBatch) return;
    setSubmittingToAicte(true);

    try {
      const res = await fetch(`/api/imports/${committedBatch.id}/submit`, {
        method: 'POST',
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to submit batch to AICTE.');
        setSubmittingToAicte(false);
        return;
      }

      setSubmittedSuccess(true);
      setCurrentStep(6);
    } catch (err) {
      alert('Network error submitting batch.');
    } finally {
      setSubmittingToAicte(false);
    }
  };

  // Filter rows for review table
  const displayedRows = (validationSummary?.rows || []).filter((r) => {
    if (filterMode === 'INVALID') return !r.isValid;
    if (filterMode === 'WARNING') return r.hasWarnings;
    if (filterMode === 'VALID') return r.isValid;
    return true;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">CSV Bulk Upload Wizard</h1>
        <p className="text-xs text-slate-500 mt-1">
          Ingest institutional student records, validate 12-digit APAAR IDs, detect duplicate collisions, and submit for clearance.
        </p>
      </div>

      {/* Stepper Progress Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="grid grid-cols-6 gap-2 text-center text-xs">
          {[
            { step: 1, label: '1. Select File' },
            { step: 2, label: '2. Map Columns' },
            { step: 3, label: '3. Validating' },
            { step: 4, label: '4. Review Errors' },
            { step: 5, label: '5. Commit' },
            { step: 6, label: '6. AICTE Submit' },
          ].map((s) => (
            <div
              key={s.step}
              className={`py-2 px-1 rounded-lg font-semibold transition-all ${
                currentStep === s.step
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : currentStep > s.step
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'text-slate-400 bg-slate-50'
              }`}
            >
              {s.label}
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: SELECT FILE */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <Card title="Upload Student Enrolment CSV">
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center hover:border-blue-400 transition-colors bg-slate-50/50">
              <UploadCloud className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-sm">Drag and drop your CSV file here</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Supported format: CSV (.csv), up to 2,000 student records per batch
              </p>

              <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg cursor-pointer shadow-sm">
                <span>Browse Local Computer</span>
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileChange(e.target.files[0]);
                  }}
                />
              </label>
            </div>
          </Card>

          {/* Downloadable Demonstration Templates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/student_upload_template.csv"
              download
              className="p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-xs transition-all flex items-start gap-3 text-left"
            >
              <FileText className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-xs text-slate-800">CSV Header Template</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Empty headers template with accepted fields</div>
                <div className="text-[10px] text-blue-600 font-semibold mt-2 flex items-center gap-1">
                  <Download className="w-3 h-3" /> Download Template
                </div>
              </div>
            </a>

            <a
              href="/sample_students_valid.csv"
              download
              className="p-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-300 hover:shadow-xs transition-all flex items-start gap-3 text-left"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-xs text-slate-800">Clean Sample CSV</div>
                <div className="text-[11px] text-slate-500 mt-0.5">10 valid synthetic student records ready to test</div>
                <div className="text-[10px] text-emerald-600 font-semibold mt-2 flex items-center gap-1">
                  <Download className="w-3 h-3" /> Download Clean Sample
                </div>
              </div>
            </a>

            <a
              href="/sample_students_with_errors.csv"
              download
              className="p-4 bg-white border border-slate-200 rounded-xl hover:border-amber-300 hover:shadow-xs transition-all flex items-start gap-3 text-left"
            >
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-xs text-slate-800">Sample With Errors & Duplicates</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Intentional bad APAARs, missing fields, duplicates</div>
                <div className="text-[10px] text-amber-600 font-semibold mt-2 flex items-center gap-1">
                  <Download className="w-3 h-3" /> Download Error Sample
                </div>
              </div>
            </a>
          </div>
        </div>
      )}

      {/* STEP 2: MAP COLUMNS */}
      {currentStep === 2 && (
        <Card
          title="Map CSV Columns"
          subtitle={`File: ${file?.name} (${rawParsedRows.length} rows detected)`}
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Confirm that the columns in your uploaded file correspond to the standard EduVerify institutional data fields.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              {expectedColumns.map((col) => (
                <div key={col.key} className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-800">
                    {col.label} {col.required && <span className="text-rose-600">*</span>}
                  </label>
                  <select
                    value={columnMapping[col.key] || ''}
                    onChange={(e) =>
                      setColumnMapping({ ...columnMapping, [col.key]: e.target.value })
                    }
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">-- Select Matching CSV Column --</option>
                    {parsedHeaders.map((header) => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                type="button"
                onClick={handleRunValidation}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-500 shadow-sm shadow-blue-500/20 flex items-center gap-1.5"
              >
                <span>Run Validation Engine</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 3: VALIDATING ANIMATION */}
      {currentStep === 3 && (
        <Card className="text-center py-16">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h3 className="font-bold text-slate-800 text-base">Running Core Validation Engine...</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Checking 12-digit APAAR formats, scanning for intra-batch duplicate collisions, comparing against institutional database, and calculating intake capacity.
          </p>
        </Card>
      )}

      {/* STEP 4: REVIEW RESULTS */}
      {currentStep === 4 && validationSummary && (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <span className="text-xs font-medium text-slate-500 uppercase">Total Rows</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">{validationSummary.totalRows}</div>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl shadow-xs">
              <span className="text-xs font-medium text-emerald-700 uppercase">Valid Records</span>
              <div className="text-2xl font-bold text-emerald-800 mt-1">{validationSummary.validRows}</div>
            </div>

            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl shadow-xs">
              <span className="text-xs font-medium text-rose-700 uppercase">Invalid Rows</span>
              <div className="text-2xl font-bold text-rose-800 mt-1">{validationSummary.invalidRows}</div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl shadow-xs">
              <span className="text-xs font-medium text-amber-700 uppercase">Duplicate Collisions</span>
              <div className="text-2xl font-bold text-amber-800 mt-1">{validationSummary.duplicateRows}</div>
            </div>
          </div>

          {/* Intake Capacity Impact Preview */}
          <Card className="bg-slate-900 text-white border-0">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                  Intake Capacity Impact Projection
                </div>
                <div className="text-sm font-bold mt-1">
                  Enrolment: {validationSummary.intakeUtilizationPreview.currentEnrolment} +{' '}
                  {validationSummary.intakeUtilizationPreview.batchAdditions} Valid Additions ={' '}
                  <span className="text-blue-300">
                    {validationSummary.intakeUtilizationPreview.projectedEnrolment} /{' '}
                    {validationSummary.intakeUtilizationPreview.approvedIntake} Approved Seats
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-emerald-400">
                  {validationSummary.intakeUtilizationPreview.projectedUtilization}%
                </div>
                <div className="text-xs text-slate-400">Projected Intake Utilization</div>
              </div>
            </div>
          </Card>

          {/* Issue Breakdown Grid */}
          <Card
            title="Row Validation Inspector"
            subtitle="Filter rows to inspect validation errors and duplicate collisions"
            action={
              <div className="flex items-center gap-1.5">
                {(['ALL', 'INVALID', 'WARNING', 'VALID'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setFilterMode(mode)}
                    className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-colors ${
                      filterMode === mode
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            }
          >
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Row #</th>
                    <th className="py-2.5 px-3">Roll No</th>
                    <th className="py-2.5 px-3">APAAR ID</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3">Validation Issues / Resolutions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No rows in this filter category.
                      </td>
                    </tr>
                  ) : (
                    displayedRows.map((r) => (
                      <tr
                        key={r.rowNumber}
                        className={!r.isValid ? 'bg-rose-50/40 hover:bg-rose-50/60' : 'hover:bg-slate-50'}
                      >
                        <td className="py-2.5 px-3 font-mono font-medium">{r.rowNumber}</td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">
                          {r.raw.studentRecordNumber || <span className="text-rose-500 italic">Missing</span>}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-800">
                          {r.raw.apaarId || <span className="text-rose-500 italic">Missing</span>}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-900">
                          {r.raw.fullName || <span className="text-rose-500 italic">Missing</span>}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {r.isValid ? (
                            <Badge variant={r.hasWarnings ? 'warning' : 'success'}>
                              {r.hasWarnings ? 'WARNING' : 'VALID'}
                            </Badge>
                          ) : (
                            <Badge variant="danger">INVALID</Badge>
                          )}
                        </td>
                        <td className="py-2.5 px-3 space-y-1">
                          {r.errors.length === 0 ? (
                            <span className="text-emerald-700 font-medium">Passed all checks</span>
                          ) : (
                            r.errors.map((e, idx) => (
                              <div
                                key={idx}
                                className={`text-[11px] p-1 rounded font-medium ${
                                  e.severity === 'ERROR'
                                    ? 'bg-rose-100/70 text-rose-800'
                                    : 'bg-amber-100/70 text-amber-800'
                                }`}
                              >
                                <strong>[{e.code}]</strong> {e.message}
                                {e.suggestedResolution && (
                                  <div className="text-[10px] text-slate-600 mt-0.5 font-normal">
                                    💡 <em>{e.suggestedResolution}</em>
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Actions Footer */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Back to Mapping
              </button>

              <button
                type="button"
                onClick={handleCommitImport}
                disabled={committing || validationSummary.validRows === 0}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                {committing ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>Commit {validationSummary.validRows} Valid Records to Database</span>
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* STEP 5: COMMIT SUCCESS */}
      {currentStep === 5 && committedBatch && (
        <Card className="text-center py-10 space-y-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Batch Imported Successfully!</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Batch <strong className="font-mono text-slate-800">{committedBatch.filename}</strong> has been committed to the database. {committedBatch.validRows} student records are now active.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 max-w-md mx-auto text-xs space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-slate-500">Batch Identifier:</span>
              <span className="font-mono font-semibold text-slate-900">{committedBatch.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Current Status:</span>
              <StatusBadge status={committedBatch.status} />
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Committed Valid Records:</span>
              <span className="font-bold text-emerald-700">{committedBatch.validRows}</span>
            </div>
          </div>

          <div className="pt-4 flex justify-center gap-3">
            <button
              onClick={() => router.push('/students')}
              className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg text-xs font-medium hover:bg-slate-300"
            >
              View in Student Directory
            </button>
            <button
              onClick={handleSubmitBatchToAicte}
              disabled={submittingToAicte}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-2"
            >
              {submittingToAicte && (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              )}
              <Send className="w-4 h-4" />
              <span>Submit Batch to AICTE for Central Clearance</span>
            </button>
          </div>
        </Card>
      )}

      {/* STEP 6: AICTE SUBMISSION SUCCESS */}
      {currentStep === 6 && (
        <Card className="text-center py-12 space-y-4">
          <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
            <Send className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Submitted for AICTE Clearance!</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Your batch has been submitted to the AICTE Central Review Queue. The status is now{' '}
              <strong className="text-blue-600">SUBMITTED</strong>. A notification has been sent to AICTE officers.
            </p>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg max-w-md mx-auto text-xs text-blue-900">
            <strong>Security Notice:</strong> In accordance with SIH problem guidelines, institution users cannot approve their own submissions. Approval requires authorized AICTE central administrator clearance.
          </div>

          <div className="pt-4 flex justify-center gap-3">
            <button
              onClick={() => router.push('/imports')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
            >
              Go to Import History
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
