'use client';
import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building2,
  Calendar,
  Eye,
  MessageSquare,
  Search,
  Filter,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

export default function CentralReviewQueuePage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('SUBMITTED');

  // Review Decision Modal State
  const [activeBatch, setActiveBatch] = useState<any>(null);
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [reviewComment, setReviewComment] = useState('');
  const [decisionSubmitting, setDecisionSubmitting] = useState(false);
  const [decisionError, setDecisionError] = useState('');

  // Inspection details modal
  const [inspectBatch, setInspectBatch] = useState<any>(null);

  async function loadSubmissions() {
    setLoading(true);
    try {
      const url = statusFilter ? `/api/submissions?status=${statusFilter}` : '/api/submissions';
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setSubmissions(data.submissions || []);
      }
    } catch (err) {
      console.error('Failed to load review queue:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubmissions();
  }, [statusFilter]);

  const openReviewModal = (batch: any, type: 'APPROVED' | 'REJECTED') => {
    setActiveBatch(batch);
    setDecision(type);
    setReviewComment(
      type === 'APPROVED'
        ? 'Verified against AICTE approved seat matrix. All APAAR records checked and cleared.'
        : ''
    );
    setDecisionError('');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBatch) return;

    if (decision === 'REJECTED' && !reviewComment.trim()) {
      setDecisionError('A clear explanation for rejection is strictly required by AICTE policy.');
      return;
    }

    setDecisionSubmitting(true);
    try {
      const res = await fetch(`/api/submissions/${activeBatch.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          reviewComment,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setDecisionError(data.error || 'Failed to submit review decision.');
        setDecisionSubmitting(false);
        return;
      }

      setActiveBatch(null);
      loadSubmissions();
    } catch (err) {
      setDecisionError('Network error while recording decision.');
    } finally {
      setDecisionSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AICTE Central Review Queue</h1>
          <p className="text-xs text-slate-500 mt-1">
            Authorize or reject institutional student enrolment batches with audited decision rationale
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
          {(['SUBMITTED', 'APPROVED', 'REJECTED', ''] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                statusFilter === st
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st || 'All Batches'}
            </button>
          ))}
        </div>
      </div>

      {/* Submissions List */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Institution</th>
                <th className="py-3 px-4 font-semibold">Batch Filename</th>
                <th className="py-3 px-4 font-semibold text-center">Submitted At</th>
                <th className="py-3 px-4 font-semibold text-center">Total / Valid</th>
                <th className="py-3 px-4 font-semibold text-center">Issues</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span>Loading submissions...</span>
                    </div>
                  </td>
                </tr>
              ) : submissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No submissions currently found in queue for filter "{statusFilter || 'All'}".
                  </td>
                </tr>
              ) : (
                submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{sub.institution?.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {sub.institution?.officialCode} &bull; {sub.institution?.state}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-800">{sub.filename}</td>
                    <td className="py-3 px-4 text-center text-slate-600 font-mono">
                      {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-900">
                      {sub.totalRows} <span className="text-slate-400 font-normal">/</span>{' '}
                      <span className="text-emerald-700">{sub.validRows}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {sub.invalidRows > 0 ? (
                        <span className="font-semibold text-rose-600">{sub.invalidRows} errors</span>
                      ) : (
                        <span className="text-emerald-600 font-medium">Clean</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={sub.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      {sub.status === 'SUBMITTED' ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => openReviewModal(sub, 'APPROVED')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold inline-flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => openReviewModal(sub, 'REJECTED')}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-semibold inline-flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-500 italic max-w-xs truncate text-right">
                          {sub.reviewComment || 'Reviewed'}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Approve / Reject Review Decision Modal */}
      {activeBatch && (
        <Modal
          isOpen={Boolean(activeBatch)}
          onClose={() => setActiveBatch(null)}
          title={
            decision === 'APPROVED'
              ? `Approve Submission: ${activeBatch.institution?.name}`
              : `Reject Submission: ${activeBatch.institution?.name}`
          }
          subtitle={`Batch: ${activeBatch.filename} (${activeBatch.totalRows} rows)`}
        >
          <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
            {decisionError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{decisionError}</span>
              </div>
            )}

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Institution:</span>
                <span className="font-semibold text-slate-900">{activeBatch.institution?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Approved Seat Intake:</span>
                <span className="font-mono text-slate-900">{activeBatch.institution?.approvedIntake}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Valid Records in Batch:</span>
                <span className="font-bold text-emerald-700">{activeBatch.validRows}</span>
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                {decision === 'APPROVED' ? 'Approval Clearance Notes' : 'Mandatory Rejection Rationale *'}
              </label>
              <textarea
                required={decision === 'REJECTED'}
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder={
                  decision === 'APPROVED'
                    ? 'State any clearance conditions or matrix confirmation...'
                    : 'Detail why this batch is rejected (e.g. invalid APAARs, quota excess)...'
                }
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveBatch(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={decisionSubmitting}
                className={`px-4 py-2 text-white rounded-lg font-semibold flex items-center gap-1.5 disabled:opacity-50 ${
                  decision === 'APPROVED'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                {decisionSubmitting ? (
                  'Recording...'
                ) : decision === 'APPROVED' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Clear & Approve
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" /> Confirm Rejection
                  </>
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
