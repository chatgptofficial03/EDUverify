'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  History,
  UploadCloud,
  FileCheck2,
  AlertTriangle,
  Eye,
  Send,
  Download,
  Calendar,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

export default function ImportHistoryPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  async function loadBatches() {
    setLoading(true);
    try {
      const res = await fetch('/api/imports');
      const data = await res.json();
      if (res.ok) {
        setBatches(data.batches || []);
      }
    } catch (err) {
      console.error('Failed to load batches:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBatches();
  }, []);

  const viewBatchDetails = async (id: string) => {
    setLoadingDetails(true);
    try {
      const res = await fetch(`/api/imports/${id}`);
      const data = await res.json();
      if (res.ok) {
        setSelectedBatch(data.batch);
      }
    } catch (err) {
      alert('Failed to load batch details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSubmitBatch = async (batchId: string) => {
    try {
      const res = await fetch(`/api/imports/${batchId}/submit`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert('Batch submitted to AICTE successfully.');
        loadBatches();
      } else {
        alert(data.error || 'Failed to submit batch.');
      }
    } catch (err) {
      alert('Network error submitting batch.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Import Batch History</h1>
          <p className="text-xs text-slate-500 mt-1">
            Historical log of uploaded CSV batches, validation statistics, and central review statuses
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/imports/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 shadow-sm shadow-blue-600/30"
          >
            <UploadCloud className="w-4 h-4" />
            Upload New Batch
          </Link>
        </div>
      </div>

      {/* Batches Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Batch Filename</th>
                <th className="py-3 px-4 font-semibold">Uploaded By</th>
                <th className="py-3 px-4 font-semibold">Upload Date</th>
                <th className="py-3 px-4 font-semibold text-center">Total Rows</th>
                <th className="py-3 px-4 font-semibold text-center">Valid</th>
                <th className="py-3 px-4 font-semibold text-center">Issues</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span>Loading batches...</span>
                    </div>
                  </td>
                </tr>
              ) : batches.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No import batches found. Upload your first CSV using the wizard above.
                  </td>
                </tr>
              ) : (
                batches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{batch.filename}</div>
                      <div className="font-mono text-[10px] text-slate-400 truncate max-w-xs">{batch.id}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{batch.uploader?.name || 'Administrator'}</td>
                    <td className="py-3 px-4 text-slate-600 font-mono">
                      {new Date(batch.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-800">{batch.totalRows}</td>
                    <td className="py-3 px-4 text-center font-semibold text-emerald-700">{batch.validRows}</td>
                    <td className="py-3 px-4 text-center">
                      {batch.invalidRows > 0 ? (
                        <span className="font-semibold text-rose-600">{batch.invalidRows}</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={batch.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        {batch.status === 'VALIDATED' && (
                          <button
                            onClick={() => handleSubmitBatch(batch.id)}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-semibold flex items-center gap-1 shadow-xs"
                          >
                            <Send className="w-3 h-3" />
                            Submit
                          </button>
                        )}
                        <button
                          onClick={() => viewBatchDetails(batch.id)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="View Batch Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Batch Inspection Details Modal */}
      {selectedBatch && (
        <Modal
          isOpen={Boolean(selectedBatch)}
          onClose={() => setSelectedBatch(null)}
          title={`Batch Details: ${selectedBatch.filename}`}
          subtitle={`Batch ID: ${selectedBatch.id}`}
          maxWidth="4xl"
        >
          <div className="space-y-4 text-xs">
            {/* Meta summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block">Status</span>
                <StatusBadge status={selectedBatch.status} />
              </div>
              <div>
                <span className="text-slate-400 block">Total / Valid</span>
                <span className="font-bold text-slate-900">
                  {selectedBatch.totalRows} / {selectedBatch.validRows}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Uploaded By</span>
                <span className="font-medium text-slate-800">{selectedBatch.uploader?.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Upload Date</span>
                <span className="font-mono text-slate-800">
                  {new Date(selectedBatch.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Review Comment if reviewed */}
            {selectedBatch.reviewComment && (
              <div
                className={`p-3 rounded-xl border text-xs ${
                  selectedBatch.status === 'REJECTED'
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  {selectedBatch.status === 'REJECTED' ? (
                    <XCircle className="w-4 h-4 text-rose-600" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                  <span>AICTE Review Feedback:</span>
                </div>
                <p>{selectedBatch.reviewComment}</p>
                {selectedBatch.reviewer && (
                  <div className="text-[10px] text-slate-500 mt-1 font-mono">
                    Reviewed by {selectedBatch.reviewer.name} on{' '}
                    {new Date(selectedBatch.reviewedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            )}

            {/* Staged Rows Inspector */}
            <div>
              <h4 className="font-bold text-slate-900 text-xs mb-2">Staged Rows & Validation Inspector</h4>
              <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
                {selectedBatch.rows?.length === 0 ? (
                  <div className="p-4 text-center text-slate-400">No staged rows recorded.</div>
                ) : (
                  selectedBatch.rows?.map((row: any) => {
                    const errors = row.validationErrors ? JSON.parse(row.validationErrors) : [];
                    return (
                      <div key={row.id} className="p-2.5 flex items-start justify-between gap-4 hover:bg-slate-50">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold text-slate-700">Row #{row.rowNumber}</span>
                            <StatusBadge status={row.validationStatus} />
                          </div>
                          {errors.length > 0 && (
                            <div className="mt-1 space-y-0.5">
                              {errors.map((e: any, idx: number) => (
                                <div key={idx} className="text-[11px] text-rose-700">
                                  <strong>[{e.code}]</strong> {e.message}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono truncate max-w-xs">
                          {row.rawDataJson}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedBatch(null)}
                className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg font-medium hover:bg-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
