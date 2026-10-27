'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  ShieldCheck,
  Building2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  FileCheck2,
  Sparkles,
  Award,
  RotateCw,
} from 'lucide-react';
import { ApaarCard3D } from '@/components/3d/ApaarCard3D';
import { AcademicGlobe3D } from '@/components/3d/AcademicGlobe3D';
import { VerificationSeal3D } from '@/components/3d/VerificationSeal3D';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [active3dTab, setActive3dTab] = useState<'card' | 'globe'>('card');

  // Sample student for interactive 3D credential demonstration
  const sampleStudent = {
    fullName: 'Aarav Rajesh Sharma',
    apaarId: '900010000001',
    maskedApaarId: '9000 •••• 0001',
    studentRecordNumber: 'DIT-2025-CS-101',
    programme: 'B.Tech Computer Science & Engineering',
    course: 'Undergraduate',
    academicYear: '2025-2026',
    institutionName: 'Delhi Institute of Technology',
    institutionCode: 'AICTE-DL-001',
    enrolmentStatus: 'ACTIVE',
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both institutional email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Authentication failed. Please check credentials.');
        setLoading(false);
        return;
      }

      // Successful login
      router.push(data.redirectPath || '/dashboard/institution');
    } catch (err) {
      setError('Connection failed. Please check local server.');
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Demo@12345');
    setError('');
  };

  return (
    <div className="min-h-screen bg-oxford-950 text-white flex flex-col justify-between relative overflow-hidden selection:bg-gold-500/20 selection:text-gold-200">
      {/* Background Guilloche and Ambient 3D Gold Lights */}
      <div className="absolute inset-0 dark-guilloche-pattern opacity-60 pointer-events-none" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-gold-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-oxford-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Sovereign Navigation Strip */}
      <header className="relative z-20 border-b border-gold-500/20 bg-oxford-950/70 backdrop-blur-md px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-gold-600 via-gold-400 to-amber-200 p-[1.5px] shadow-3d-gold">
              <div className="w-full h-full bg-oxford-950 rounded-[10px] flex items-center justify-center text-gold-300">
                <GraduationCap className="w-5 h-5 drop-shadow-[0_2px_4px_rgba(197,155,72,0.4)]" />
              </div>
            </div>
            <div>
              <div className="font-display font-black tracking-wider text-lg text-white">
                EduVerify <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-gold-500/20 text-gold-300">3D</span>
              </div>
              <div className="text-[9px] font-serif uppercase tracking-widest text-gold-400">
                Ministry of Education &bull; AICTE
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-oxford-900 border border-gold-500/30 text-gold-200 shadow-sm">
              <Award className="w-3.5 h-3.5 text-gold-400" />
              <span>SIH 2026 AICTE Ref: SIH26263</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Hero & Split Layout */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left Column: 3D Academic Showcase & Credential Visualizer */}
        <div className="flex-1 w-full flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-gold-500/20 via-gold-400/10 to-transparent border border-gold-400/40 text-gold-300 text-xs font-serif tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span className="uppercase font-semibold">National Academic Registry Platform</span>
          </div>

          <div className="space-y-3 max-w-xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-white leading-tight">
              One Nation.{' '}
              <span className="bg-gradient-to-r from-gold-300 via-amber-200 to-gold-500 bg-clip-text text-transparent">
                One Student ID.
              </span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base font-serif leading-relaxed">
              Cryptographically verified APAAR academic credentials backed by AICTE regulatory intake compliance and zero-knowledge privacy protection.
            </p>
          </div>

          {/* 3D Interactive Selector Tabs */}
          <div className="w-full max-w-md pt-2">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
              <button
                type="button"
                onClick={() => setActive3dTab('card')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-serif font-bold transition-all ${
                  active3dTab === 'card'
                    ? 'bg-gold-500 text-oxford-950 shadow-3d-gold'
                    : 'bg-oxford-900/80 text-gold-300 border border-gold-500/30 hover:bg-oxford-850'
                }`}
              >
                3D APAAR Smart Card
              </button>
              <button
                type="button"
                onClick={() => setActive3dTab('globe')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-serif font-bold transition-all ${
                  active3dTab === 'globe'
                    ? 'bg-gold-500 text-oxford-950 shadow-3d-gold'
                    : 'bg-oxford-900/80 text-gold-300 border border-gold-500/30 hover:bg-oxford-850'
                }`}
              >
                3D Institutional Armillary
              </button>
            </div>

            {/* Render 3D Canvas / Card Showcase */}
            <div className="bg-gradient-to-b from-oxford-900/60 to-oxford-950/80 border border-gold-400/30 rounded-2xl p-6 shadow-3d-lg relative backdrop-blur-sm flex flex-col items-center">
              {active3dTab === 'card' ? (
                <>
                  <div className="text-[11px] font-mono text-gold-400/90 mb-3 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>INTERACTIVE 3D PERSPECTIVE: MOVE MOUSE TO TILT & FLIP</span>
                  </div>
                  <ApaarCard3D student={sampleStudent} autoRotateInit={true} />
                </>
              ) : (
                <>
                  <div className="text-[11px] font-mono text-gold-400/90 mb-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
                    <span>AICTE CONNECTED INSTITUTION NODES & CELESTIAL MESH</span>
                  </div>
                  <AcademicGlobe3D size={320} interactive={true} />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Formal Sovereign Login Card */}
        <div className="w-full max-w-md shrink-0">
          <div className="bg-gradient-to-b from-oxford-900/95 to-oxford-950/95 backdrop-blur-xl py-8 px-6 sm:px-9 shadow-3d-dark rounded-3xl border border-gold-400/35 relative">
            {/* Top Gold Corner Ornament */}
            <div className="absolute top-0 right-8 -translate-y-1/2">
              <VerificationSeal3D size="sm" withRibbon={false} />
            </div>

            <div className="text-left mb-6">
              <div className="text-[10px] font-serif font-bold uppercase tracking-widest text-gold-400">
                Official Access Portal
              </div>
              <h2 className="text-2xl font-bold font-serif text-white tracking-tight mt-0.5">
                Institutional Sign In
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-sans">
                Sign in using your AICTE-registered institutional credentials
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-rose-950/50 border border-rose-700/80 rounded-xl flex items-center gap-2.5 text-rose-200 text-xs shadow-inner">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-serif font-semibold text-gold-200 mb-1.5">
                  Institutional Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gold-400/60">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. institution@demo.edu"
                    required
                    className="block w-full pl-10 pr-3 py-2.5 bg-oxford-950/90 border border-gold-500/30 rounded-xl text-white placeholder-slate-500 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-serif font-semibold text-gold-200 mb-1.5">
                  Registry Security Key / Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gold-400/60">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter security key"
                    required
                    className="block w-full pl-10 pr-10 py-2.5 bg-oxford-950/90 border border-gold-500/30 rounded-xl text-white placeholder-slate-500 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-gold-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-gold-400" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-xs font-serif font-bold text-oxford-950 bg-gradient-to-r from-gold-400 via-amber-300 to-gold-500 hover:from-gold-300 hover:to-gold-400 shadow-3d-gold transition-all duration-150 hover:-translate-y-0.5 disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-oxford-950/30 border-t-oxford-950 rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Authenticate & Access Registry</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Access for SIH Judges */}
            <div className="mt-6 pt-5 border-t border-gold-500/20">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-serif font-bold text-gold-300 uppercase tracking-widest flex items-center gap-1.5">
                  <Award className="w-3 h-3 text-gold-400" />
                  SIH Judge Fast Roles:
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Pass: Demo@12345</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillDemoAccount('institution@demo.edu')}
                  className="p-2.5 rounded-xl bg-oxford-950/80 hover:bg-gold-500/10 border border-gold-500/30 text-left transition-all hover:border-gold-400 flex flex-col group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-white group-hover:text-gold-300">
                    <Building2 className="w-3.5 h-3.5 text-gold-400" />
                    <span>Institution</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate font-sans">Delhi Institute</div>
                </button>

                <button
                  type="button"
                  onClick={() => fillDemoAccount('aicte@demo.edu')}
                  className="p-2.5 rounded-xl bg-oxford-950/80 hover:bg-gold-500/10 border border-gold-500/30 text-left transition-all hover:border-gold-400 flex flex-col group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-white group-hover:text-gold-300">
                    <FileCheck2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>AICTE Admin</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate font-sans">Central Reviewer</div>
                </button>

                <button
                  type="button"
                  onClick={() => fillDemoAccount('verifier@demo.edu')}
                  className="p-2.5 rounded-xl bg-oxford-950/80 hover:bg-gold-500/10 border border-gold-500/30 text-left transition-all hover:border-gold-400 flex flex-col group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-white group-hover:text-gold-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Verifier</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate font-sans">Verification Portal</div>
                </button>

                <button
                  type="button"
                  onClick={() => fillDemoAccount('observer@demo.edu')}
                  className="p-2.5 rounded-xl bg-oxford-950/80 hover:bg-gold-500/10 border border-gold-500/30 text-left transition-all hover:border-gold-400 flex flex-col group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-white group-hover:text-gold-300">
                    <GraduationCap className="w-3.5 h-3.5 text-gold-300" />
                    <span>Observer</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate font-sans">State Analytics</div>
                </button>
              </div>
            </div>

            <div className="mt-4 text-center text-[10px] text-slate-500 font-mono">
              256-Bit Cryptographic Security &bull; AICTE Verified Node
            </div>
          </div>
        </div>
      </main>

      {/* Sovereign Bottom Footer */}
      <footer className="relative z-10 border-t border-gold-500/20 bg-oxford-950/80 px-6 py-4 text-center text-[11px] text-slate-400 font-serif">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; 2026 All India Council for Technical Education (AICTE). APAAR National Registry.</span>
          <span className="font-mono text-gold-400/80">SIH 2026 Problem SIH26263 Prototype</span>
        </div>
      </footer>
    </div>
  );
}
