'use client';
import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  Printer,
  Lock,
  Building2,
  GraduationCap,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';

export default function VerificationPortalPage() {
  const [query, setQuery] = useState('');
  const [purpose, setPurpose] = useState('Employer Academic Clearance');
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/verifications/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), purpose }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Verification query failed.');
        setSearching(false);
        return;
      }

      setResult(data);
    } catch (err) {
      setError('Connection failure while contacting verification registry.');
    } finally {
      setSearching(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold mb-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Authorized Verification Gateway</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Record Verification</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Verify academic enrolments against AICTE-approved institutional registries with privacy minimization
        </p>
      </div>

      {/* Verification Query Card */}
      <Card title="Search Academic Registry" subtitle="Enter student record number or 12-digit APAAR ID">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student Record Number / APAAR ID / Ref # *
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. 900010000001 or DIT-2025-CS-101"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Verification Purpose *
              </label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Employer Academic Clearance">Employer Background Clearance</option>
                <option value="Scholarship Verification">Scholarship Portal Verification</option>
                <option value="Higher Education Admission">Higher Education Admission</option>
                <option value="Regulatory Audit">Regulatory / AICTE Audit</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <div className="text-[11px] text-slate-500 flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Full APAAR and date of birth are automatically masked for privacy.</span>
            </div>

            <button
              type="submit"
              disabled={searching}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              {searching ? (
                <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              <span>Verify Record</span>
            </button>
          </div>
        </form>
      </Card>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Query Result View */}
      {result && !result.found && (
        <Card className="text-center py-10 bg-slate-50">
          <XCircle className="w-12 h-12 text-rose-500 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">Record Not Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {result.message || 'No approved student record matched the provided identifier.'}
          </p>
        </Card>
      )}

      {result && result.found && (
        <div className="space-y-4">
          {/* Printable Verification Receipt Container */}
          <div
            id="printable-receipt"
            className="bg-white border-2 border-slate-300 rounded-2xl p-6 sm:p-8 shadow-sm print:border-none print:shadow-none space-y-6"
          >
            {/* Receipt Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-900 text-white rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg tracking-tight">EduVerify</h3>
                  <div className="text-[11px] text-blue-700 font-semibold tracking-wide">
                    ACADEMIC ENROLMENT VERIFICATION RECEIPT
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right text-xs">
                <div className="font-mono font-bold text-slate-900">{result.verificationReference}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Issued: {new Date(result.timestamp).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Verification Status Banner */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-emerald-900 text-sm">Record Authenticated & Active</div>
                  <div className="text-[11px] text-emerald-700">
                    Linked to valid institutional intake and cleared by AICTE central administration.
                  </div>
                </div>
              </div>
              <Badge variant="success">OFFICIAL DEMO VERIFIED</Badge>
            </div>

            {/* Student & Academic Attributes (Privacy Minimized) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block font-medium">Candidate Name</span>
                <span className="font-bold text-slate-900 text-sm">{result.student.fullName}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block font-medium">Masked APAAR ID</span>
                <span className="font-mono font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  {result.student.maskedApaarId}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block font-medium">Institution Name</span>
                <span className="font-semibold text-slate-900">{result.student.institutionName}</span>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Code: {result.student.institutionCode} &bull; State: {result.student.institutionState}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block font-medium">Institutional Roll / Record No</span>
                <span className="font-mono font-bold text-slate-900">{result.student.studentRecordNumber}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block font-medium">Programme & Course</span>
                <span className="font-semibold text-slate-900">{result.student.programme}</span>
                <div className="text-[10px] text-slate-500">{result.student.course}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block font-medium">Academic Year & Status</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono font-medium">{result.student.academicYear}</span>
                  <StatusBadge status={result.student.enrolmentStatus} />
                </div>
              </div>
            </div>

            {/* Audit & Verified By Signature Block */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between text-[11px] text-slate-500 gap-2">
              <div>
                <span>Verified By: </span>
                <strong className="text-slate-800">{result.verifiedBy}</strong> ({result.verifiedByRole})
              </div>
              <div>
                <span>Purpose: </span>
                <strong className="text-slate-800">{result.purpose}</strong>
              </div>
            </div>

            {/* Mandatory Demonstration Disclaimer */}
            <div className="p-3 bg-slate-100 rounded-lg text-[10px] text-slate-500 leading-relaxed text-justify border border-slate-200">
              <strong>DEMONSTRATION DISCLAIMER:</strong> {result.disclaimer}
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex justify-end gap-3 print:hidden">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Receipt</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
