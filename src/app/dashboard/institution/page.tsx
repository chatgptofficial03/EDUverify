'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  FileCheck2,
  TrendingUp,
  History,
  ArrowRight,
  ShieldAlert,
  GraduationCap,
  Download,
  Sparkles,
  Award,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { MetricCard3D } from '@/components/3d/MetricCard3D';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

export default function InstitutionDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch('/api/analytics');
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error('Failed to load institution analytics:', e);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-parchment-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-parchment-200 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-parchment-200 rounded-2xl"></div>
          <div className="h-80 bg-parchment-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const charts = data?.charts || {};
  const audits = data?.recentAudits || [];

  const utilization = metrics.utilizationPercentage || 0;
  const approvedIntake = metrics.totalApprovedIntake || 200;
  const activeEnrolment = metrics.activeEnrolments || 0;

  const COLORS = ['#c59b48', '#486694', '#dfb76c', '#1d304e', '#aa7e37', '#709cc5'];

  return (
    <div className="space-y-8">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gold-300/30 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-gold-700 font-bold bg-gold-500/15 px-2.5 py-0.5 rounded-full border border-gold-400/40">
              Institutional Intelligence Node
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-oxford-950 tracking-tight">
            Institutional Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-serif mt-0.5">
            Real-time enrolment monitoring, APAAR student registry synchronization, and capacity compliance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/api/reports/export?type=students"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-serif font-bold text-oxford-900 bg-white border border-gold-300/60 rounded-xl hover:bg-gold-50 shadow-3d-sm transition-all hover:-translate-y-0.5"
          >
            <Download className="w-3.5 h-3.5 text-gold-600" />
            <span>Export Official Records</span>
          </a>
          <Link
            href="/imports/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-serif font-bold text-oxford-950 bg-gradient-to-r from-gold-400 via-amber-300 to-gold-500 hover:from-gold-300 hover:to-gold-400 rounded-xl shadow-3d-gold transition-all hover:-translate-y-0.5"
          >
            <UploadCloud className="w-4 h-4 text-oxford-950" />
            <span>Upload Student CSV</span>
          </Link>
        </div>
      </div>

      {/* 3D Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard3D
          title="Total Student Records"
          value={metrics.totalStudents || 0}
          subtitle="Enrolled in Academic Cycle"
          icon={<Users className="w-5 h-5" />}
        />

        <MetricCard3D
          title="Active Enrolments"
          value={activeEnrolment}
          subtitle={`AICTE Approved Intake: ${approvedIntake}`}
          icon={<GraduationCap className="w-5 h-5" />}
          badge={<StatusBadge status="ACTIVE" />}
        />

        <MetricCard3D
          title="Intake Utilization"
          value={`${utilization}%`}
          subtitle={`${metrics.remainingSeats || 0} approved seats remaining`}
          icon={<TrendingUp className="w-5 h-5" />}
          badge={
            <Badge
              variant={
                metrics.statusTier === 'OVER_CAPACITY'
                  ? 'danger'
                  : metrics.statusTier === 'APPROACHING'
                  ? 'warning'
                  : 'gold'
              }
            >
              {metrics.statusTier?.replace('_', ' ') || 'NORMAL'}
            </Badge>
          }
        />

        <MetricCard3D
          title="Batch Clearance"
          value={metrics.approvedBatches || 0}
          subtitle={`${metrics.pendingBatches || 0} awaiting central AICTE clearance`}
          icon={<FileCheck2 className="w-5 h-5" />}
        />
      </div>

      {/* AICTE Capacity & Regulatory Compliance Banner (Classic Sovereign Dark) */}
      <div className="bg-gradient-to-r from-oxford-950 via-oxford-900 to-oxford-950 text-white rounded-3xl p-6 sm:p-8 border border-gold-400/40 shadow-3d-dark relative overflow-hidden">
        {/* Guilloche Dark Security Pattern */}
        <div className="absolute inset-0 dark-guilloche-pattern opacity-40 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 border border-gold-400/40 text-xs font-serif font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>AICTE Seat Matrix Regulatory Assurance</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-display font-extrabold text-white tracking-tight">
              Approved Institutional Capacity: {approvedIntake} Seats
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-serif leading-relaxed">
              Currently, {activeEnrolment} active students are mapped to verified APAAR IDs. {approvedIntake - activeEnrolment} seats remain available under official AICTE statutory limits.
            </p>
          </div>

          <div className="w-full md:w-72 space-y-2.5 bg-black/40 p-4 rounded-2xl border border-gold-500/30 backdrop-blur-xs">
            <div className="flex justify-between text-xs font-serif">
              <span className="text-slate-300">Regulatory Capacity Used:</span>
              <span className="font-bold font-mono text-gold-300">{utilization}%</span>
            </div>
            <div className="w-full bg-oxford-950 rounded-full h-3.5 overflow-hidden p-0.5 border border-gold-500/30">
              <div
                className={`h-full rounded-full transition-all duration-700 shadow-sm ${
                  utilization > 100
                    ? 'bg-rose-500'
                    : utilization >= 80
                    ? 'bg-amber-400'
                    : 'bg-gradient-to-r from-emerald-500 to-gold-400'
                }`}
                style={{ width: `${Math.min(utilization, 100)}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 text-right font-mono">
              Status: {metrics.statusTier || 'NOMINAL'}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Programme Distribution */}
        <Card title="Departmental Enrolment Distribution" subtitle="Active registered students across sanctioned disciplines">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={charts.programmeDistribution || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#324463', fontFamily: 'serif' }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 10, fill: '#324463' }} />
                <Tooltip
                  formatter={(val: any) => [`${val} Students`, 'Enrolled']}
                  contentStyle={{
                    backgroundColor: '#0a0f18',
                    borderColor: '#c59b48',
                    color: '#f6f0dd',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontFamily: 'serif',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {(charts.programmeDistribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Audit Activity */}
        <Card
          title="Institutional Audit Trail"
          subtitle="Cryptographically verified administrative logs"
          action={
            <Link
              href="/audit"
              className="text-xs text-gold-700 hover:text-gold-900 flex items-center gap-1 font-serif font-bold hover:underline"
            >
              <span>View full ledger</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          }
        >
          <div className="divide-y divide-slate-100">
            {audits.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 font-serif">
                No recent transactions recorded.
              </div>
            ) : (
              audits.slice(0, 5).map((log: any) => (
                <div key={log.id} className="py-3 flex items-center justify-between text-xs font-sans">
                  <div>
                    <div className="font-serif font-bold text-oxford-900">{log.action?.replace(/_/g, ' ')}</div>
                    <div className="text-[11px] text-slate-500">{log.details || log.targetType}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-[10px] text-slate-400">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
