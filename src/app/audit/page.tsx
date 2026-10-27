'use client';
import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  Shield,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  Lock,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  async function loadAuditLogs() {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        action: actionFilter,
      });

      const res = await fetch(`/api/audit-logs?${queryParams}`);
      const data = await res.json();
      if (res.ok) {
        setLogs(data.logs || []);
        setTotal(data.pagination?.total || 0);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAuditLogs();
  }, [page, actionFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadAuditLogs();
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 text-[11px] font-semibold mb-1">
            <Lock className="w-3 h-3 text-slate-600" />
            <span>Immutable Server Audit Trail</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Audit Logs</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically timestamped record of administrative mutations, batch approvals, and student queries
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by actor email, action, or entity..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Actions</option>
            <option value="LOGIN">LOGIN</option>
            <option value="CREATE_STUDENT">CREATE_STUDENT</option>
            <option value="UPDATE_STUDENT">UPDATE_STUDENT</option>
            <option value="BATCH_UPLOAD">BATCH_UPLOAD</option>
            <option value="BATCH_COMMIT">BATCH_COMMIT</option>
            <option value="BATCH_SUBMIT">BATCH_SUBMIT</option>
            <option value="BATCH_APPROVE">BATCH_APPROVE</option>
            <option value="BATCH_REJECT">BATCH_REJECT</option>
            <option value="VERIFICATION_QUERY_SUCCESS">VERIFICATION_QUERY_SUCCESS</option>
            <option value="UPDATE_INSTITUTION">UPDATE_INSTITUTION</option>
          </select>
        </form>
      </Card>

      {/* Audit Log Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">Action</th>
                <th className="py-3 px-4 font-semibold">Actor</th>
                <th className="py-3 px-4 font-semibold">Role</th>
                <th className="py-3 px-4 font-semibold">Entity</th>
                <th className="py-3 px-4 font-semibold">Safe Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-sans">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span>Loading audit entries...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-sans">
                    No audit log records found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-blue-700">
                      <span className="bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded text-[11px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-800 font-sans font-medium">
                      {log.actorEmail}
                    </td>
                    <td className="py-2.5 px-4 font-sans">
                      <Badge variant="neutral">{log.actorRole}</Badge>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 font-sans">
                      {log.entityType} {log.entityId && `(${log.entityId.slice(0, 8)}...)`}
                    </td>
                    <td className="py-2.5 px-4 text-slate-500 text-[11px] truncate max-w-xs font-mono">
                      {log.metadataJson || '{}'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 font-sans">
          <div>
            Showing Page <span className="font-semibold text-slate-900">{page}</span> of{' '}
            <span className="font-semibold text-slate-900">{totalPages}</span> ({total} audit events)
          </div>
          <div className="flex items-center gap-1.5">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
