'use client';
import React, { useState, useEffect } from 'react';
import {
  Building2,
  Search,
  Plus,
  Edit2,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Download,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

export default function InstitutionManagementPage() {
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState('');

  // Edit Intake Modal state
  const [editingInst, setEditingInst] = useState<any>(null);
  const [newIntake, setNewIntake] = useState<number>(300);
  const [newStatus, setNewStatus] = useState<string>('APPROVED');
  const [saving, setSaving] = useState(false);

  // Add Institution Modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newInstForm, setNewInstForm] = useState({
    officialCode: '',
    name: '',
    institutionType: 'Engineering & Technology',
    state: 'Delhi',
    district: 'New Delhi',
    approvedIntake: 300,
  });

  async function loadInstitutions() {
    setLoading(true);
    try {
      const res = await fetch('/api/institutions');
      const data = await res.json();
      if (res.ok) {
        setInstitutions(data.institutions || []);
      }
    } catch (err) {
      console.error('Failed to load institutions:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInstitutions();
  }, []);

  const openEditModal = (inst: any) => {
    setEditingInst(inst);
    setNewIntake(inst.approvedIntake);
    setNewStatus(inst.approvalStatus);
  };

  const handleSaveIntake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInst) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/institutions/${editingInst.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvedIntake: newIntake,
          approvalStatus: newStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to update institution.');
        setSaving(false);
        return;
      }

      setEditingInst(null);
      loadInstitutions();
    } catch (err) {
      alert('Network error updating intake.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/institutions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInstForm),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to create institution.');
        setSaving(false);
        return;
      }

      setIsAddOpen(false);
      loadInstitutions();
    } catch (err) {
      alert('Network error adding institution.');
    } finally {
      setSaving(false);
    }
  };

  // Filter institutions
  const filteredInstitutions = institutions.filter((inst) => {
    const matchesSearch =
      inst.name.toLowerCase().includes(search.toLowerCase()) ||
      inst.officialCode.toLowerCase().includes(search.toLowerCase());
    const matchesState = !selectedState || inst.state === selectedState;
    return matchesSearch && matchesState;
  });

  const allStates = Array.from(new Set(institutions.map((i) => i.state)));

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institution Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Oversee affiliated institutions, approved seat matrices, and active capacity utilization
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
          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 shadow-sm shadow-blue-600/30"
          >
            <Plus className="w-4 h-4" />
            Add Synthetic Institution
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by institution name or AICTE code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All States / UTs</option>
            {allStates.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Institutions Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">AICTE Code</th>
                <th className="py-3 px-4 font-semibold">Institution Name</th>
                <th className="py-3 px-4 font-semibold">State / District</th>
                <th className="py-3 px-4 font-semibold text-right">Approved Intake</th>
                <th className="py-3 px-4 font-semibold text-right">Active Enrolled</th>
                <th className="py-3 px-4 font-semibold text-center">Utilization</th>
                <th className="py-3 px-4 font-semibold text-center">Approval Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span>Loading institutions...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredInstitutions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No institutions found.
                  </td>
                </tr>
              ) : (
                filteredInstitutions.map((inst) => (
                  <tr key={inst.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">{inst.officialCode}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{inst.name}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {inst.state}, {inst.district}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">{inst.approvedIntake}</td>
                    <td className="py-3 px-4 text-right font-semibold text-blue-700">{inst.activeEnrolment}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 font-semibold">
                        <span
                          className={
                            inst.intakeStatus?.isExceeded
                              ? 'text-rose-600'
                              : inst.intakeStatus?.isWarning
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                          }
                        >
                          {inst.intakeStatus?.utilizationPercentage}%
                        </span>
                        {inst.intakeStatus?.isExceeded && (
                          <span title="Intake Exceeded">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={inst.approvalStatus} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openEditModal(inst)}
                        className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md inline-flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        Adjust Intake
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Intake Modal */}
      {editingInst && (
        <Modal
          isOpen={Boolean(editingInst)}
          onClose={() => setEditingInst(null)}
          title={`Adjust Intake Allocation: ${editingInst.name}`}
          subtitle={`Current Active Enrolment: ${editingInst.activeEnrolment} students`}
        >
          <form onSubmit={handleSaveIntake} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Approved Intake Seat Limit *</label>
              <input
                type="number"
                min="0"
                max="5000"
                required
                value={newIntake}
                onChange={(e) => setNewIntake(parseInt(e.target.value) || 0)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold text-sm"
              />
              <div className="text-[11px] text-slate-500 mt-1">
                Projected utilization after adjustment:{' '}
                <strong>
                  {newIntake > 0
                    ? ((editingInst.activeEnrolment / newIntake) * 100).toFixed(1)
                    : 0}
                  %
                </strong>
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">AICTE Approval Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="APPROVED">APPROVED</option>
                <option value="PROVISIONAL">PROVISIONAL</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
              <span className="font-semibold">Audit Notice:</span> Any change to approved intake is saved in the tamper-evident central audit log.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingInst(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 disabled:opacity-50"
              >
                {saving ? 'Updating...' : 'Save Allocation'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Synthetic Institution Modal */}
      {isAddOpen && (
        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Add Synthetic Demonstration Institution"
          subtitle="Creates a new institution record for SIH testing"
        >
          <form onSubmit={handleCreateInstitution} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Official AICTE Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. AICTE-1-9999"
                value={newInstForm.officialCode}
                onChange={(e) => setNewInstForm({ ...newInstForm, officialCode: e.target.value })}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Institution Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. National Institute of Computing"
                value={newInstForm.name}
                onChange={(e) => setNewInstForm({ ...newInstForm, name: e.target.value })}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">State *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gujarat"
                  value={newInstForm.state}
                  onChange={(e) => setNewInstForm({ ...newInstForm, state: e.target.value })}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">District *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ahmedabad"
                  value={newInstForm.district}
                  onChange={(e) => setNewInstForm({ ...newInstForm, district: e.target.value })}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Approved Intake Capacity</label>
              <input
                type="number"
                min="10"
                max="5000"
                value={newInstForm.approvedIntake}
                onChange={(e) =>
                  setNewInstForm({ ...newInstForm, approvedIntake: parseInt(e.target.value) || 300 })
                }
                className="w-full p-2 bg-white border border-slate-300 rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 disabled:opacity-50"
              >
                {saving ? 'Creating...' : 'Register Institution'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
