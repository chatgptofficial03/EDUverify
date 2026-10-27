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
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Branding */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/20 mb-4 ring-1 ring-white/20">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">EduVerify</h2>
        <p className="mt-1 text-sm text-blue-400 font-medium">
          Trusted Academic Records. Verified at Scale.
        </p>
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>SIH 2026 AICTE Problem SIH26263</span>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0">
        <div className="bg-slate-900/90 backdrop-blur-md py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-800">
          {error && (
            <div className="mb-6 p-3.5 bg-rose-950/40 border border-rose-800/80 rounded-xl flex items-center gap-2.5 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Institutional Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. institution@demo.edu"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Account Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="block w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts Selection for SIH Judges */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                SIH Judge Quick Access:
              </span>
              <span className="text-[10px] text-blue-400 font-mono">Pass: Demo@12345</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('institution@demo.edu')}
                className="p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-left transition-colors flex flex-col"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                  <Building2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Institution</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">Delhi Institute</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('aicte@demo.edu')}
                className="p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-left transition-colors flex flex-col"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                  <FileCheck2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>AICTE Admin</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">Central Reviewer</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('verifier@demo.edu')}
                className="p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-left transition-colors flex flex-col"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verifier</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">Verification Portal</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('observer@demo.edu')}
                className="p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-left transition-colors flex flex-col"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                  <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Observer</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">State Analytics</div>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-slate-500">
          Government-grade access control enforced server-side.
        </div>
      </div>
    </div>
  );
}
