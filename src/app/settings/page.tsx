'use client';
import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Building2,
  FileText,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function SettingsPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Demo settings states
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [apaarLength, setApaarLength] = useState(12);
  const [maxCsvRows, setMaxCsvRows] = useState(2000);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((d) => {
        setSession(d.user);
        setLoading(false);
      });
  }, []);

  const handleSaveDemoSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400 text-xs">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Platform Configuration & Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage institutional profile, academic cycles, and prototype validation rules
        </p>
      </div>

      {savedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Demo configuration updated successfully.</span>
        </div>
      )}

      {/* Profile Overview */}
      <Card title="Authenticated User Profile" subtitle="Active session and credentials">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block font-medium">Display Name</span>
            <span className="font-bold text-slate-900 text-sm">{session?.name}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block font-medium">Email Address</span>
            <span className="font-mono font-semibold text-slate-900">{session?.email}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block font-medium">System Role</span>
            <Badge variant="purple">{session?.role}</Badge>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block font-medium">Institution Scope</span>
            <span className="font-semibold text-slate-900">
              {session?.institutionName || 'AICTE Central Authority'}
            </span>
          </div>
        </div>
      </Card>

      {/* Configurable Prototype Settings */}
      <Card
        title="Configurable Validation Settings"
        subtitle="Tunable parameters for SIH 2026 demonstration scenario"
      >
        <form onSubmit={handleSaveDemoSettings} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Active Academic Year
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                APAAR ID Format Length (Digits)
              </label>
              <input
                type="number"
                value={apaarLength}
                onChange={(e) => setApaarLength(parseInt(e.target.value) || 12)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Maximum CSV Ingestion Rows
              </label>
              <input
                type="number"
                value={maxCsvRows}
                onChange={(e) => setMaxCsvRows(parseInt(e.target.value) || 2000)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs">
            <strong>Demonstration Boundary Notice:</strong> These settings represent prototype configuration parameters within the EduVerify MVP. They do not constitute official AICTE regulations or UIDAI identity specifications.
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
