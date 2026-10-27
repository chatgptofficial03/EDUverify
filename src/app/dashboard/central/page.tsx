'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Users,
  FileCheck2,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  MapPin,
  ArrowRight,
  Clock,
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

export default function CentralDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCentralData() {
      try {
        const [analyticsRes, instRes] = await Promise.all([
          fetch('/api/analytics'),
          fetch('/api/institutions'),
        ]);

        const analyticsJson = await analyticsRes.json();
        const instJson = await instRes.json();

        setData(analyticsJson);
        setInstitutions(instJson.institutions || []);
      } catch (err) {
        console.error('Failed to load central data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCentralData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
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
  const audits = data?.recentAudits || [];

  const COLORS = ['#2563eb', '#4f46e5', '#7c3aed', '#0891b2', '#059669'];

  // Institutions exceeding or approaching capacity
  const alertInstitutions = institutions.filter(
    (i) => i.intakeStatus?.isWarning || i.intakeStatus?.isExceeded
  );

  return (
    <div className="space-y-8">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-semibold mb-1">
            <span>AICTE Central Administration Oversight</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Central Authority Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            National aggregate monitoring of student records, intake compliance, and batch clearances
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <a
            href="/api/reports/export?type=institutions"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Export Institutions
          </a>
          <Link
            href="/submissions"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 shadow-sm shadow-blue-600/30"
          >
            <FileCheck2 className="w-4 h-4" />
            Review Queue ({metrics.pendingBatches || 0})
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Affiliated Institutions"
          value={metrics.totalInstitutions || 0}
          subtitle="AICTE Approved Platforms"
          icon={<Building2 className="w-5 h-5 text-blue-600" />}
        />

        <MetricCard
          title="Total Registered Students"
          value={metrics.totalStudents || 0}
          subtitle={`${metrics.activeEnrolments || 0} Active Enrolments`}
          icon={<Users className="w-5 h-5 text-indigo-600" />}
        />

        <MetricCard
          title="Pending Review Batches"
          value={metrics.pendingBatches || 0}
          subtitle="Awaiting AICTE clearance"
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          badge={
            metrics.pendingBatches > 0 ? (
              <Badge variant="warning">Action Needed</Badge>
            ) : (
              <Badge variant="success">All Clear</Badge>
            )
          }
        />

        <MetricCard
          title="Intake Seat Utilization"
          value={`${metrics.utilizationPercentage || 0}%`}
          subtitle={`Total Intake: ${metrics.totalApprovedIntake || 0}`}
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
        />
      </div>

      {/* Over-Enrolment / Anomaly Notification Banner if any */}
      {alertInstitutions.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-semibold">Capacity Warning Detected: </span>
            {alertInstitutions.length} institution(s) are approaching or have exceeded their approved AICTE intake allocation.
            <div className="mt-1 flex gap-2">
              <Link href="/institutions" className="font-semibold underline hover:text-amber-950">
                View affected institutions in Institution Management &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* State Distribution */}
        <Card title="State-Wise Distribution" subtitle="Institutions by State / UT">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={charts.stateDistribution || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <XAxis dataKey="state" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`${val} Institutions`, 'Institutions']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="institutions" radius={[4, 4, 0, 0]}>
                  {(charts.stateDistribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Programme Enrolments */}
        <Card title="Academic Disciplines" subtitle="Enrolment distribution by programme">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={charts.programmeDistribution || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`${val} Students`, 'Total Enrolled']}
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
      </div>

      {/* Institutions Table Summary */}
      <Card
        title="Institutional Status Matrix"
        subtitle="Intake monitoring and compliance status"
        action={
          <Link href="/institutions" className="text-xs text-blue-600 hover:underline font-medium">
            Manage all institutions &rarr;
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-4 font-semibold">AICTE Code</th>
                <th className="py-2.5 px-4 font-semibold">Institution Name</th>
                <th className="py-2.5 px-4 font-semibold">State</th>
                <th className="py-2.5 px-4 font-semibold text-right">Approved Intake</th>
                <th className="py-2.5 px-4 font-semibold text-right">Enrolled</th>
                <th className="py-2.5 px-4 font-semibold text-center">Utilization</th>
                <th className="py-2.5 px-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {institutions.slice(0, 5).map((inst) => (
                <tr key={inst.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-mono font-medium text-slate-800">{inst.officialCode}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{inst.name}</td>
                  <td className="py-3 px-4 text-slate-600">{inst.state}</td>
                  <td className="py-3 px-4 text-right font-medium">{inst.approvedIntake}</td>
                  <td className="py-3 px-4 text-right font-medium">{inst.activeEnrolment}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`font-semibold ${
                        inst.intakeStatus?.isExceeded
                          ? 'text-rose-600'
                          : inst.intakeStatus?.isWarning
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {inst.intakeStatus?.utilizationPercentage}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <StatusBadge status={inst.approvalStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
