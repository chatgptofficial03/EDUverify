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
  Sparkles,
  Award,
  Layers,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { ApaarCard3D } from '@/components/3d/ApaarCard3D';
import { VerificationSeal3D } from '@/components/3d/VerificationSeal3D';

export default function VerificationPortalPage() {
  const [query, setQuery] = useState('');
  const [purpose, setPurpose] = useState('Employer Academic Clearance');
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [show3dCard, setShow3dCard] = useState(true);

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
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Formal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gold-300/30 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/15 text-gold-900 border border-gold-400/40 text-[11px] font-serif font-bold mb-2 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-gold-700" />
            <span>AICTE Authorized Verification Directorate</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-oxford-950 tracking-tight">
            Academic Enrolment & Credential Verification
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-serif mt-1">
            Authenticate student records against AICTE-approved institutional registries with cryptographic certainty
          </p>
        </div>

        {/* SIH Tag */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-gold-300/50 shadow-3d-sm text-xs font-mono text-oxford-900">
          <Award className="w-4 h-4 text-gold-600" />
          <span>APAAR Ref: SIH26263</span>
        </div>
      </div>

      {/* Verification Query Card */}
      <Card
        title="Search Official Academic Registry"
        subtitle="Enter 12-digit APAAR ID or Institutional Student Record Number"
        pattern={true}
      >
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-serif font-bold text-oxford-900 mb-1.5">
                APAAR ID / Student Record / Roll Number *
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-gold-600" />
                <input
                  type="text"
                  required
                  placeholder="e.g. 900010000001 or DIT-2025-CS-101"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs font-mono bg-parchment-50 border border-gold-300/60 rounded-xl focus:ring-2 focus:ring-gold-400 focus:outline-none transition-all shadow-inner"
                />
              </div>
              <div className="mt-1.5 flex items-center gap-2 text-[10px] text-slate-500 font-sans">
                <span>Quick demo try:</span>
                <button
                  type="button"
                  onClick={() => setQuery('900010000001')}
                  className="text-gold-700 font-mono hover:underline font-semibold"
                >
                  900010000001
                </button>
                <span>or</span>
                <button
                  type="button"
                  onClick={() => setQuery('DIT-2025-CS-101')}
                  className="text-gold-700 font-mono hover:underline font-semibold"
                >
                  DIT-2025-CS-101
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-serif font-bold text-oxford-900 mb-1.5">
                Verification Purpose *
              </label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full py-2.5 px-3 text-xs bg-parchment-50 border border-gold-300/60 rounded-xl focus:ring-2 focus:ring-gold-400 focus:outline-none transition-all shadow-inner font-sans"
              >
                <option value="Employer Academic Clearance">Employer Background Clearance</option>
                <option value="Scholarship Verification">Scholarship Portal Verification</option>
                <option value="Higher Education Admission">Higher Education Admission</option>
                <option value="Regulatory Audit">Regulatory / AICTE Audit</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 border-t border-gold-200/40">
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-serif">
              <Lock className="w-3.5 h-3.5 text-gold-600" />
              <span>Full identity privacy masking enforced in accordance with AICTE zero-knowledge policy.</span>
            </div>

            <button
              type="submit"
              disabled={searching}
              className="px-6 py-2.5 bg-gradient-to-r from-gold-500 via-amber-400 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-oxford-950 rounded-xl text-xs font-serif font-bold shadow-3d-gold flex items-center gap-2 disabled:opacity-50 transition-all hover:-translate-y-0.5"
            >
              {searching ? (
                <div className="w-3.5 h-3.5 border-2 border-oxford-950/40 border-t-oxford-950 rounded-full animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-oxford-950" />
              )}
              <span>Query Official Registry</span>
            </button>
          </div>
        </form>
      </Card>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl text-rose-900 text-xs flex items-center gap-2.5 shadow-sm font-sans">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Query Result: Not Found */}
      {result && !result.found && (
        <Card className="text-center py-12 bg-white" pattern={true}>
          <XCircle className="w-14 h-14 text-rose-600 mx-auto mb-3" />
          <h3 className="text-lg font-serif font-bold text-oxford-950">Record Not Authenticated</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto font-sans">
            {result.message || 'No approved student record matched the provided APAAR ID or institutional roll number.'}
          </p>
        </Card>
      )}

      {/* Query Result: Authenticated */}
      {result && result.found && (
        <div className="space-y-6">
          {/* View Mode Toggle: Certificate vs 3D Credential Card */}
          <div className="flex items-center justify-between print:hidden">
            <div className="flex items-center gap-2">
              <span className="text-xs font-serif font-bold text-oxford-900">Credential Presentation:</span>
              <button
                type="button"
                onClick={() => setShow3dCard(!show3dCard)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-gold-300 text-gold-900 text-xs font-serif font-semibold shadow-xs hover:bg-gold-50"
              >
                <Layers className="w-3.5 h-3.5 text-gold-600" />
                <span>{show3dCard ? 'Hide 3D Smart Card' : 'Show 3D Smart Card'}</span>
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-oxford-950 hover:bg-oxford-900 text-gold-200 border border-gold-400/50 rounded-xl text-xs font-serif font-bold flex items-center gap-2 shadow-3d-sm transition-all hover:-translate-y-0.5"
            >
              <Printer className="w-4 h-4 text-gold-400" />
              <span>Print Official Attestation</span>
            </button>
          </div>

          {/* Interactive 3D APAAR Card Showcase (if toggled) */}
          {show3dCard && (
            <div className="p-6 bg-gradient-to-b from-oxford-950 to-oxford-900 rounded-3xl border border-gold-400/40 shadow-3d-lg print:hidden flex flex-col items-center">
              <div className="text-[11px] font-mono text-gold-300/90 mb-3 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                <span>3D DIGITAL APAAR CARD &bull; MOUSE TILT & CLICK TO FLIP CREDENTIAL</span>
              </div>
              <ApaarCard3D student={result.student} autoRotateInit={false} />
            </div>
          )}

          {/* Official Formal Parchment Certificate Receipt */}
          <div
            id="printable-receipt"
            className="bg-[#fcfbf8] border-2 border-gold-400/50 rounded-3xl p-8 sm:p-10 shadow-3d-lg print:border-none print:shadow-none space-y-8 relative overflow-hidden"
          >
            {/* Guilloche Certificate Security Pattern */}
            <div className="absolute inset-0 guilloche-pattern opacity-50 pointer-events-none" />

            {/* Top Ornamental Gold Header Bar */}
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-gold-600 via-amber-300 to-gold-600" />

            {/* Official 3D Seal Medallion in Top Right */}
            <div className="absolute top-6 right-6 sm:right-10 pointer-events-auto">
              <VerificationSeal3D size="md" stamped={true} withRibbon={true} />
            </div>

            {/* Certificate Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-gold-300/40 gap-4 relative z-10 max-w-[80%]">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 bg-oxford-950 text-gold-300 rounded-2xl flex items-center justify-center border border-gold-400/50 shadow-3d-gold shrink-0">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-[10px] font-serif uppercase tracking-widest text-gold-700 font-bold">
                    All India Council for Technical Education
                  </div>
                  <h3 className="font-display font-black text-oxford-950 text-xl tracking-tight leading-tight">
                    Official Academic Attestation Receipt
                  </h3>
                  <div className="text-xs text-slate-500 font-serif mt-0.5">
                    APAAR Digital Student Registry Clearance &bull; SIH26263
                  </div>
                </div>
              </div>
            </div>

            {/* Reference Numbers & Timestamp */}
            <div className="relative z-10 flex flex-wrap items-center justify-between bg-parchment-100/80 p-3.5 rounded-xl border border-gold-300/40 text-xs font-mono">
              <div>
                <span className="text-slate-500 font-serif text-[11px]">Audit Reference: </span>
                <strong className="text-oxford-950 font-bold tracking-wider">{result.verificationReference}</strong>
              </div>
              <div className="text-slate-600">
                Issued:{' '}
                <span className="font-semibold">{new Date(result.timestamp).toLocaleString()}</span>
              </div>
            </div>

            {/* Official Status Banner */}
            <div className="relative z-10 p-4 bg-emerald-50/80 border border-emerald-300 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-serif font-bold text-emerald-950 text-sm">
                    Record Authenticated, Verified & In Good Standing
                  </div>
                  <div className="text-xs text-emerald-800 font-sans mt-0.5">
                    Verified against authorized institutional seat intake and certified by AICTE central administration.
                  </div>
                </div>
              </div>
              <Badge variant="gold" size="md">
                OFFICIAL SIH RECORD
              </Badge>
            </div>

            {/* Student & Academic Attributes (Privacy Minimized) */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
              <div className="p-4 bg-white/90 rounded-2xl border border-gold-300/35 shadow-xs">
                <span className="text-slate-500 block font-serif font-semibold text-[11px] uppercase tracking-wider">
                  Candidate Full Name
                </span>
                <span className="font-serif font-bold text-oxford-950 text-base mt-0.5 block">
                  {result.student.fullName}
                </span>
              </div>

              <div className="p-4 bg-white/90 rounded-2xl border border-gold-300/35 shadow-xs">
                <span className="text-slate-500 block font-serif font-semibold text-[11px] uppercase tracking-wider">
                  Masked APAAR ID (12-Digit)
                </span>
                <span className="font-mono font-bold text-oxford-950 text-base mt-0.5 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gold-600" />
                  {result.student.maskedApaarId}
                </span>
              </div>

              <div className="p-4 bg-white/90 rounded-2xl border border-gold-300/35 shadow-xs">
                <span className="text-slate-500 block font-serif font-semibold text-[11px] uppercase tracking-wider">
                  Institutional Affiliation
                </span>
                <span className="font-serif font-bold text-oxford-950 block mt-0.5">
                  {result.student.institutionName}
                </span>
                <div className="text-[10px] text-slate-500 font-mono mt-1">
                  Code: {result.student.institutionCode} &bull; State: {result.student.institutionState}
                </div>
              </div>

              <div className="p-4 bg-white/90 rounded-2xl border border-gold-300/35 shadow-xs">
                <span className="text-slate-500 block font-serif font-semibold text-[11px] uppercase tracking-wider">
                  Institutional Roll / Record No
                </span>
                <span className="font-mono font-bold text-oxford-950 text-base mt-0.5 block">
                  {result.student.studentRecordNumber}
                </span>
              </div>

              <div className="p-4 bg-white/90 rounded-2xl border border-gold-300/35 shadow-xs">
                <span className="text-slate-500 block font-serif font-semibold text-[11px] uppercase tracking-wider">
                  Programme & Degree Level
                </span>
                <span className="font-serif font-bold text-oxford-950 block mt-0.5">
                  {result.student.programme}
                </span>
                <div className="text-[11px] text-slate-500 mt-0.5 font-sans">{result.student.course}</div>
              </div>

              <div className="p-4 bg-white/90 rounded-2xl border border-gold-300/35 shadow-xs">
                <span className="text-slate-500 block font-serif font-semibold text-[11px] uppercase tracking-wider">
                  Academic Year & Status
                </span>
                <div className="flex items-center gap-2.5 mt-1.5">
                  <span className="font-mono font-bold text-oxford-950">{result.student.academicYear}</span>
                  <StatusBadge status={result.student.enrolmentStatus} />
                </div>
              </div>
            </div>

            {/* Signature & Audit Footnote */}
            <div className="relative z-10 pt-6 border-t border-gold-300/40 flex flex-col sm:flex-row justify-between text-xs text-slate-600 font-serif gap-3">
              <div>
                <span>Attested By Verifier: </span>
                <strong className="text-oxford-950">{result.verifiedBy}</strong> ({result.verifiedByRole})
              </div>
              <div>
                <span>Purpose of Clearance: </span>
                <strong className="text-oxford-950">{result.purpose}</strong>
              </div>
            </div>

            {/* Official Disclaimer */}
            <div className="relative z-10 p-3.5 bg-parchment-100 rounded-xl text-[11px] text-slate-600 leading-relaxed text-justify border border-gold-200/50 font-serif">
              <strong>OFFICIAL SIH NOTICE:</strong> {result.disclaimer}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
