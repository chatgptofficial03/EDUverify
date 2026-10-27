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
        <div className="h-8 bg-parchment-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-parchment-200 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const charts = data?.charts || {};
  const audits = data?.recentAudits || [];

  const COLORS = ['#c59b48', '#486694', '#dfb76c', '#1d304e', '#aa7e37', '#709cc5'];

  // Institutions exceeding or approaching capacity
  const alertInstitutions = institutions.filter(
    (i) => i.intakeStatus?.isWarning || i.intakeStatus?.isExceeded
  );

  return (
    <div className="space-y-8">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gold-300/30 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/15 text-gold-900 border border-gold-400/40 text-[11px] font-serif font-bold mb-1 shadow-xs">
            <Award className="w-3.5 h-3.5 text-gold-700" />
            <span>AICTE Central Directorate Oversight</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-oxford-950 tracking-tight">
            Central Regulatory Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-serif mt-0.5">
            National aggregate monitoring of student records, intake compliance, and batch clearances
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/api/reports/export?type=institutions"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-serif font-bold text-oxford-900 bg-white border border-gold-300/60 rounded-xl hover:bg-gold-50 shadow-3d-sm transition-all hover:-translate-y-0.5"
          >
            <Download className="w-3.5 h-3.5 text-gold-600" />
            <span>Export Institutions</span>
          </a>
          <Link
            href="/submissions"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-serif font-bold text-oxford-950 bg-gradient-to-r from-gold-400 via-amber-300 to-gold-500 hover:from-gold-300 hover:to-gold-400 rounded-xl shadow-3d-gold transition-all hover:-translate-y-0.5"
          >
            <FileCheck2 className="w-4 h-4 text-oxford-950" />
            <span>Review Queue ({metrics.pendingBatches || 0})</span>
          </Link>
        </div>
      </div>

      {/* 3D KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard3D
          title="Affiliated Institutions"
          value={metrics.totalInstitutions || 0}
          subtitle="AICTE Approved Registries"
          icon={<Building2 className="w-5 h-5" />}
        />

        <MetricCard3D
          title="Total Registered Students"
          value={metrics.totalStudents || 0}
          subtitle={`${metrics.activeEnrolments || 0} Active Enrolments`}
          icon={<Users className="w-5 h-5" />}
        />

        <MetricCard3D
          title="Pending Review Batches"
          value={metrics.pendingBatches || 0}
          subtitle="Awaiting AICTE clearance"
          icon={<Clock className="w-5 h-5" />}
          badge={
            metrics.pendingBatches > 0 ? (
              <Badge variant="warning">Action Needed</Badge>
            ) : (
              <Badge variant="gold">All Clear</Badge>
            )
          }
        />

        <MetricCard3D
          title="Intake Seat Utilization"
          value={`${metrics.utilizationPercentage || 0}%`}
          subtitle={`National Sanctioned: ${metrics.totalApprovedIntake || 0}`}
          icon={<TrendingUp className="w-5 h-5" />}
        />
      </div>

      {/* Over-Enrolment / Anomaly Notification Banner if any */}
      {alertInstitutions.length > 0 && (
        <div className="p-4 bg-amber-50/90 border border-amber-300/80 rounded-2xl flex items-start gap-3 text-amber-950 shadow-sm font-sans">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-serif font-bold text-sm">Capacity Warning Flag: </span>
            {alertInstitutions.length} affiliated institution(s) are approaching or have exceeded their approved AICTE statutory allocation.
            <div className="mt-1 flex gap-2">
              <Link href="/institutions" className="font-serif font-bold text-gold-900 underline hover:text-oxford-950">
                View affected institutions in Institution Directorate &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* State Distribution */}
        <Card title="State-Wise Academic Distribution" subtitle="Institutions registered by State / UT">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={charts.stateDistribution || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <XAxis dataKey="state" tick={{ fontSize: 10, fill: '#324463', fontFamily: 'serif' }} />
                <YAxis tick={{ fontSize: 10, fill: '#324463' }} />
                <Tooltip
                  formatter={(val: any) => [`${val} Institutions`, 'Institutions']}
                  contentStyle={{
                    backgroundColor: '#0a0f18',
                    borderColor: '#c59b48',
                    color: '#f6f0dd',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontFamily: 'serif',
                  }}
                />
                <Bar dataKey="institutions" radius={[6, 6, 0, 0]}>
                  {(charts.stateDistribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Programme Enrolments */}
        <Card title="National Academic Disciplines" subtitle="Enrolment distribution across technical streams">
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
                  formatter={(val: any) => [`${val} Students`, 'Total Enrolled']}
                  contentStyle={{
                    backgroundColor: '#0a0f18',
                    borderColor: '#c59b48',
                    color: '#f6f0dd',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontFamily: 'serif',
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
      </div>

      {/* Institutions Table Summary */}
      <Card
        title="Institutional Regulatory Compliance Ledger"
        subtitle="Live seat matrix monitoring and AICTE audit standing"
        action={
          <Link href="/institutions" className="text-xs text-gold-700 hover:text-gold-900 font-serif font-bold hover:underline">
            Manage all institutions &rarr;
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left font-sans">
            <thead className="bg-parchment-100 text-oxford-800 uppercase border-y border-gold-300/40 font-serif font-semibold">
              <tr>
                <th className="py-2.5 px-4">AICTE Code</th>
                <th className="py-2.5 px-4">Institution Name</th>
                <th className="py-2.5 px-4">State</th>
                <th className="py-2.5 px-4 text-right">Sanctioned Intake</th>
                <th className="py-2.5 px-4 text-right">Enrolled</th>
                <th className="py-2.5 px-4 text-center">Utilization</th>
                <th className="py-2.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {institutions.slice(0, 5).map((inst) => (
                <tr key={inst.id} className="hover:bg-gold-50/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-oxford-900">{inst.officialCode}</td>
                  <td className="py-3 px-4 font-serif font-bold text-oxford-950">{inst.name}</td>
                  <td className="py-3 px-4 text-slate-600">{inst.state}</td>
                  <td className="py-3 px-4 text-right font-mono font-medium">{inst.approvedIntake}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-oxford-900">{inst.activeEnrolment}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold">
                    {inst.intakeStatus?.percentage || 0}%
                  </td>
                  <td className="py-3 px-4 text-center">
                    <StatusBadge status={inst.intakeStatus?.status || 'NORMAL'} />
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
