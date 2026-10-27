'use client';
import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Filter,
  PieChart as PieIcon,
  TrendingUp,
  Building2,
  Users,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Card, MetricCard } from '@/components/ui/Card';
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
  Legend,
} from 'recharts';

export default function AnalyticsReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await fetch('/api/analytics');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
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
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const charts = data?.charts || {};

  const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#818cf8', '#a78bfa'];

  return (
    <div className="space-y-8">
      {/* Title & CSV Export toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics & Reports</h1>
          <p className="text-xs text-slate-500 mt-1">
            Aggregated enrolment metrics, approved intake utilization, and compliance distributions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/api/reports/export?type=students"
            className="px-3 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Students CSV
          </a>
          <a
            href="/api/reports/export?type=institutions"
            className="px-3 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Institutions CSV
          </a>
          <a
            href="/api/reports/export?type=batches"
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Batches CSV
          </a>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Students"
          value={metrics.totalStudents || 0}
          subtitle={`${metrics.activeEnrolments || 0} Active Status`}
          icon={<Users className="w-5 h-5 text-blue-600" />}
        />

        <MetricCard
          title="Intake Utilization"
          value={`${metrics.utilizationPercentage || 0}%`}
          subtitle={`Capacity: ${metrics.totalApprovedIntake || 0}`}
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
          badge={<StatusBadge status={metrics.statusTier} />}
        />

        <MetricCard
          title="Cleared Batches"
          value={metrics.approvedBatches || 0}
          subtitle={`${metrics.pendingBatches || 0} under review`}
          icon={<CheckCircle2 className="w-5 h-5 text-indigo-600" />}
        />

        <MetricCard
          title="Affiliated Institutions"
          value={metrics.totalInstitutions || 0}
          subtitle="AICTE Enrolment Portals"
          icon={<Building2 className="w-5 h-5 text-purple-600" />}
        />
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Programme Distribution */}
        <Card title="Programme Distribution" subtitle="Active enrolments by academic stream">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={charts.programmeDistribution || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`${val} Enrolled`, 'Students']}
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

        {/* Enrolment Status Breakdown */}
        <Card title="Student Status Breakdown" subtitle="Ratio of active to provisional / completed">
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.statusDistribution || []}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                >
                  {(charts.statusDistribution || []).map((entry: any, index: number) => (
                    <Cell key={`pie-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
