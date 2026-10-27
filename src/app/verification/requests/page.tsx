'use client';
import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Building2,
  Lock,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

export default function VerificationRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({ studentId: '', purpose: '' });
  const [submitting, setSubmitting] = useState(false);

  // Available students list to select from
  const [studentsList, setStudentsList] = useState<any[]>([]);

  async function loadRequests() {
    setLoading(true);
    try {
      const res = await fetch('/api/verifications/requests');
      const data = await res.json();
      if (res.ok) {
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
    // Load top students for dropdown
    fetch('/api/students?limit=25')
      .then((r) => r.json())
      .then((d) => setStudentsList(d.students || []));
  }, []);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.purpose) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/verifications/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setIsCreateOpen(false);
        setFormData({ studentId: '', purpose: '' });
        loadRequests();
      } else {
        alert(data.error || 'Failed to submit request.');
      }
    } catch (err) {
      alert('Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Formal Verification Requests</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track and process official degree, scholarship, and employer verification cases
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 shadow-sm shadow-blue-600/30"
        >
          <Plus className="w-4 h-4" />
          Create Verification Case
        </button>
      </div>

      {/* Requests Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Reference ID</th>
                <th className="py-3 px-4 font-semibold">Candidate Name</th>
                <th className="py-3 px-4 font-semibold">Institution</th>
                <th className="py-3 px-4 font-semibold">Requested By</th>
                <th className="py-3 px-4 font-semibold">Purpose</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span>Loading requests...</span>
                    </div>
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No verification requests logged.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{req.verificationReference}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{req.student?.fullName}</td>
                    <td className="py-3 px-4 text-slate-700">{req.student?.institution?.name}</td>
                    <td className="py-3 px-4 text-slate-700">{req.requestedBy}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{req.purpose}</td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-500">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Request Modal */}
      {isCreateOpen && (
        <Modal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Initiate Verification Request"
          subtitle="Generate an audited background verification case"
        >
          <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Select Student Candidate *</label>
              <select
                required
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">-- Choose Candidate --</option>
                {studentsList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.studentRecordNumber}) &bull; {s.programme}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Purpose of Verification *</label>
              <textarea
                required
                rows={3}
                placeholder="e.g. National Scholarship Scheme Eligibility Check, Employment Clearance..."
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
