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
} from 'lucide-react';
import { MetricCard, Card } from '@/components/ui/Card';
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
        <div className="h-8 bg-slate-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-200 rounded-xl"></div>
          <div className="h-80 bg-slate-200 rounded-xl"></div>
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

  const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

  return (
    <div className="space-y-8">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institution Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time enrolment monitoring and APAAR-linked student registry status
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <a
            href="/api/reports/export?type=students"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Export Records
          </a>
          <Link
            href="/imports/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 shadow-sm shadow-blue-600/30"
          >
            <UploadCloud className="w-4 h-4" />
            Upload Student CSV
          </Link>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Student Records"
          value={metrics.totalStudents || 0}
          subtitle="Enrolled in Academic Year"
          icon={<Users className="w-5 h-5 text-blue-600" />}
        />

        <MetricCard
          title="Active Enrolments"
          value={activeEnrolment}
          subtitle={`Approved Intake: ${approvedIntake}`}
          icon={<GraduationCap className="w-5 h-5 text-indigo-600" />}
          badge={<StatusBadge status="ACTIVE" />}
        />

        <MetricCard
          title="Intake Utilization"
          value={`${utilization}%`}
          subtitle={`${metrics.remainingSeats || 0} seats remaining`}
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
          badge={
            <Badge
              variant={
                metrics.statusTier === 'OVER_CAPACITY'
                  ? 'danger'
                  : metrics.statusTier === 'APPROACHING'
                  ? 'warning'
                  : 'success'
              }
            >
              {metrics.statusTier?.replace('_', ' ') || 'NORMAL'}
            </Badge>
          }
        />

        <MetricCard
          title="Batch Clearance"
          value={metrics.approvedBatches || 0}
          subtitle={`${metrics.pendingBatches || 0} awaiting central review`}
          icon={<FileCheck2 className="w-5 h-5 text-purple-600" />}
        />
      </div>

      {/* Intake Capacity Alert Bar */}
      <Card className="bg-gradient-to-r from-blue-900 to-slate-900 text-white border-0">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-800/80 text-blue-200 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-300" />
              <span>AICTE Seat Matrix Monitoring</span>
            </div>
            <h3 className="text-lg font-bold">Approved Institutional Capacity: {approvedIntake} Seats</h3>
            <p className="text-xs text-slate-300 max-w-xl">
              Currently, {activeEnrolment} active students are mapped to verified APAAR IDs. {approvedIntake - activeEnrolment} seats remain available under official AICTE guidelines.
            </p>
          </div>
          <div className="w-full md:w-64 space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span>Capacity Utilized</span>
              <span className="font-bold text-blue-300">{utilization}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  utilization > 100
                    ? 'bg-rose-500'
                    : utilization >= 80
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(utilization, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Programme Distribution */}
        <Card title="Programme-Wise Enrolment" subtitle="Active distribution across departments">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={charts.programmeDistribution || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`${val} Students`, 'Enrolled']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
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
          subtitle="Recent verified actions recorded"
          action={
            <Link href="/audit" className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium">
              <span>View full log</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          }
        >
          <div className="space-y-3.5 max-h-64 overflow-y-auto divide-y divide-slate-100">
            {audits.length === 0 ? (
              <div className="text-xs text-slate-400 text-center py-8">No recent events.</div>
            ) : (
              audits.map((item: any) => (
                <div key={item.id} className="pt-3 first:pt-0 flex items-start justify-between gap-4 text-xs">
                  <div>
                    <div className="font-semibold text-slate-800 flex items-center gap-2">
                      <span className="font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[11px]">
                        {item.action}
                      </span>
                      <span className="text-slate-600 font-normal">{item.entityType}</span>
                    </div>
                    <div className="text-slate-400 text-[11px] mt-1">By {item.actorEmail}</div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Quick Launchpad to Student Directory & Upload */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/students"
          className="p-5 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-sm transition-all flex items-center justify-between group"
        >
          <div>
            <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
              Student Directory
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Browse, filter, and edit institutional student records with masked APAAR identifiers.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/imports/new"
          className="p-5 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-sm transition-all flex items-center justify-between group"
        >
          <div>
            <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
              CSV Bulk Upload Wizard
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Validate enrolment files, resolve duplicates, and submit batches for AICTE review.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
}
