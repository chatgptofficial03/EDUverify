'use client';
import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Filter,
  Download,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ApaarCard3D } from '@/components/3d/ApaarCard3D';

export default function StudentsDirectoryPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [programme, setProgramme] = useState('');
  const [enrolmentStatus, setEnrolmentStatus] = useState('');
  const [seatCategory, setSeatCategory] = useState('');

  // Modals state
  const [viewStudent, setViewStudent] = useState<any>(null);
  const [editStudent, setEditStudent] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Add/Edit Form State
  const [formData, setFormData] = useState({
    studentRecordNumber: '',
    apaarId: '',
    fullName: '',
    programme: 'B.Tech Computer Science & Engineering',
    course: 'Undergraduate',
    academicYear: '2025-2026',
    admissionDate: '2025-08-01',
    enrolmentStatus: 'ACTIVE',
    seatCategory: 'General',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch students from API
  async function loadStudents() {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        programme,
        enrolmentStatus,
        seatCategory,
      });

      const res = await fetch(`/api/students?${queryParams}`);
      const data = await res.json();
      if (res.ok) {
        setStudents(data.students || []);
        setTotal(data.pagination?.total || 0);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, [page, programme, enrolmentStatus, seatCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadStudents();
  };

  const openAddModal = () => {
    setFormData({
      studentRecordNumber: '',
      apaarId: '',
      fullName: '',
      programme: 'B.Tech Computer Science & Engineering',
      course: 'Undergraduate',
      academicYear: '2025-2026',
      admissionDate: '2025-08-01',
      enrolmentStatus: 'ACTIVE',
      seatCategory: 'General',
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (student: any) => {
    setEditStudent(student);
    setFormData({
      studentRecordNumber: student.studentRecordNumber,
      apaarId: student.apaarId.includes('XXXX') ? '' : student.apaarId, // if masked, user types updated or keeps
      fullName: student.fullName,
      programme: student.programme,
      course: student.course || 'Undergraduate',
      academicYear: student.academicYear,
      admissionDate: student.admissionDate,
      enrolmentStatus: student.enrolmentStatus,
      seatCategory: student.seatCategory,
    });
    setFormError('');
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to create student record.');
        setSubmitting(false);
        return;
      }

      setIsAddModalOpen(false);
      loadStudents();
    } catch (err) {
      setFormError('Network error while saving student.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStudent) return;
    setFormError('');
    setSubmitting(true);

    try {
      const res = await fetch(`/api/students/${editStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to update student record.');
        setSubmitting(false);
        return;
      }

      setEditStudent(null);
      loadStudents();
    } catch (err) {
      setFormError('Network error while updating.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStudent = async (id: string, roll: string) => {
    if (!confirm(`Are you sure you want to remove student ${roll}? This will create an audit entry.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadStudents();
      }
    } catch (err) {
      alert('Failed to delete student.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Registered students linked to demonstration APAAR identifiers ({total} total records)
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <a
            href="/api/reports/export?type=students"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </a>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 shadow-sm shadow-blue-600/30"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Name, Roll No, or APAAR..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={programme}
            onChange={(e) => {
              setProgramme(e.target.value);
              setPage(1);
            }}
            className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Programmes</option>
            <option value="B.Tech Computer Science & Engineering">B.Tech CSE</option>
            <option value="B.Tech Electronics & Communication">B.Tech ECE</option>
            <option value="B.Tech Mechanical Engineering">B.Tech Mechanical</option>
            <option value="M.Tech AI & Data Science">M.Tech AI & DS</option>
            <option value="MBA Tech Management">MBA Tech Management</option>
          </select>

          <select
            value={enrolmentStatus}
            onChange={(e) => {
              setEnrolmentStatus(e.target.value);
              setPage(1);
            }}
            className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="PROVISIONAL">PROVISIONAL</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="DISCONTINUED">DISCONTINUED</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-700 transition-colors"
          >
            Apply Filters
          </button>
        </form>
      </Card>

      {/* Student Records Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Record / Roll No</th>
                <th className="py-3 px-4 font-semibold">Student Name</th>
                <th className="py-3 px-4 font-semibold">APAAR ID (Masked)</th>
                <th className="py-3 px-4 font-semibold">Programme</th>
                <th className="py-3 px-4 font-semibold">Year</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-center">Category</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span>Loading student records...</span>
                    </div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No student records matched your filters.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                      {student.studentRecordNumber}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">{student.fullName}</td>
                    <td className="py-3 px-4 font-mono text-slate-600 flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-slate-400" />
                      <span>{student.maskedApaarId}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 truncate max-w-xs">{student.programme}</td>
                    <td className="py-3 px-4 text-slate-600 font-mono">{student.academicYear}</td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={student.enrolmentStatus} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="neutral">{student.seatCategory}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setViewStudent(student)}
                          title="View Details"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(student)}
                          title="Edit Student"
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.id, student.studentRecordNumber)}
                          title="Delete Student"
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Showing Page <span className="font-semibold text-slate-900">{page}</span> of{' '}
            <span className="font-semibold text-slate-900">{totalPages}</span> ({total} records)
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

      {/* View Student Details Modal */}
      {viewStudent && (
        <Modal
          isOpen={Boolean(viewStudent)}
          onClose={() => setViewStudent(null)}
          title="Student APAAR Credential & Registry Record"
          subtitle={`Institutional Roll: ${viewStudent.studentRecordNumber}`}
          maxWidth="2xl"
        >
          <div className="space-y-6 text-xs font-sans">
            {/* Interactive 3D APAAR ID Smart Card */}
            <div className="p-5 bg-gradient-to-b from-oxford-950 to-oxford-900 rounded-2xl border border-gold-400/40 shadow-3d-lg flex flex-col items-center">
              <div className="text-[10px] font-mono text-gold-300 mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>INTERACTIVE 3D APAAR SMART CARD &bull; TILT WITH MOUSE & TAP TO FLIP</span>
              </div>
              <ApaarCard3D
                student={{
                  fullName: viewStudent.fullName,
                  apaarId: viewStudent.apaarId || viewStudent.maskedApaarId,
                  maskedApaarId: viewStudent.maskedApaarId,
                  studentRecordNumber: viewStudent.studentRecordNumber,
                  programme: viewStudent.programme,
                  course: viewStudent.course,
                  academicYear: viewStudent.academicYear,
                  institutionName: viewStudent.institution?.name || 'Delhi Institute of Technology',
                  institutionCode: viewStudent.institution?.code || 'AICTE-DL-001',
                  enrolmentStatus: viewStudent.enrolmentStatus,
                }}
              />
            </div>

            {/* Official Academic Registry Details */}
            <div className="grid grid-cols-2 gap-3.5 bg-parchment-50 p-4 rounded-2xl border border-gold-300/40">
              <div>
                <span className="text-slate-500 block font-serif font-semibold text-[11px] uppercase">Full Legal Name</span>
                <span className="font-serif font-bold text-oxford-950 text-sm">{viewStudent.fullName}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-serif font-semibold text-[11px] uppercase">12-Digit Masked APAAR ID</span>
                <span className="font-mono font-bold text-oxford-950 text-sm flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-gold-600" />
                  {viewStudent.maskedApaarId}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block font-serif font-semibold text-[11px] uppercase">Programme Enrolled</span>
                <span className="font-semibold text-oxford-950">{viewStudent.programme}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-serif font-semibold text-[11px] uppercase">Academic Year Cycle</span>
                <span className="font-mono font-bold text-oxford-950">{viewStudent.academicYear}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-serif font-semibold text-[11px] uppercase">Admission Clearance Date</span>
                <span className="font-mono text-slate-800">{viewStudent.admissionDate}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-serif font-semibold text-[11px] uppercase">Approved Seat Category</span>
                <Badge variant="gold">{viewStudent.seatCategory}</Badge>
              </div>
              <div>
                <span className="text-slate-500 block font-serif font-semibold text-[11px] uppercase">AICTE Regulatory Status</span>
                <StatusBadge status={viewStudent.enrolmentStatus} />
              </div>
              <div>
                <span className="text-slate-500 block font-serif font-semibold text-[11px] uppercase">Citizenship / Domicile</span>
                <span className="font-medium text-oxford-900">
                  {viewStudent.nriStatus ? 'NRI Quota ' : ''}
                  {viewStudent.ociStatus ? 'OCI Foreign National ' : ''}
                  {!viewStudent.nriStatus && !viewStudent.ociStatus ? 'Standard Indian National' : ''}
                </span>
              </div>
            </div>

            <div className="p-3 bg-gold-50/80 border border-gold-300/60 rounded-xl text-oxford-900 text-[11px] font-serif flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-gold-600 shrink-0" />
              <span><strong>AICTE Privacy Minimization:</strong> Confidential demographic markers remain masked during queries under DPDP Act 2023 regulations.</span>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setViewStudent(null)}
                className="px-5 py-2 bg-oxford-950 hover:bg-oxford-900 text-gold-200 border border-gold-400/50 rounded-xl font-serif font-bold transition-all shadow-xs"
              >
                Close Profile
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add / Edit Student Modal */}
      {(isAddModalOpen || editStudent) && (
        <Modal
          isOpen={isAddModalOpen || Boolean(editStudent)}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditStudent(null);
          }}
          title={editStudent ? 'Edit Student Record' : 'Register New Student'}
          subtitle="All fields undergo server-side validation and audit logging"
        >
          <form onSubmit={editStudent ? handleUpdateStudent : handleCreateStudent} className="space-y-4 text-xs">
            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Student Record / Roll No *</label>
                <input
                  type="text"
                  required
                  value={formData.studentRecordNumber}
                  onChange={(e) => setFormData({ ...formData, studentRecordNumber: e.target.value })}
                  placeholder="e.g. DIT-2025-CS-999"
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">12-Digit APAAR ID *</label>
                <input
                  type="text"
                  required
                  maxLength={14}
                  value={formData.apaarId}
                  onChange={(e) => setFormData({ ...formData, apaarId: e.target.value })}
                  placeholder="e.g. 900012345678"
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Student official name"
                className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Programme *</label>
                <select
                  value={formData.programme}
                  onChange={(e) => setFormData({ ...formData, programme: e.target.value })}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="B.Tech Computer Science & Engineering">B.Tech CSE</option>
                  <option value="B.Tech Electronics & Communication">B.Tech ECE</option>
                  <option value="B.Tech Mechanical Engineering">B.Tech Mechanical</option>
                  <option value="M.Tech AI & Data Science">M.Tech AI & DS</option>
                  <option value="MBA Tech Management">MBA Tech Management</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Admission Date (YYYY-MM-DD) *</label>
                <input
                  type="date"
                  required
                  value={formData.admissionDate}
                  onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Academic Year</label>
                <input
                  type="text"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={formData.enrolmentStatus}
                  onChange={(e) => setFormData({ ...formData, enrolmentStatus: e.target.value })}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PROVISIONAL">PROVISIONAL</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="DISCONTINUED">DISCONTINUED</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Seat Category</label>
                <select
                  value={formData.seatCategory}
                  onChange={(e) => setFormData({ ...formData, seatCategory: e.target.value })}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="EWS">EWS</option>
                  <option value="Management">Management</option>
                  <option value="TFW">TFW</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditStudent(null);
                }}
                className="px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 disabled:opacity-50 flex items-center gap-1.5"
              >
                {submitting && <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                <span>{editStudent ? 'Update Student' : 'Save Record'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
