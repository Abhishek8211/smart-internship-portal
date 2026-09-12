'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BrainCircuit, LogOut, ShieldCheck, Users, Briefcase, Building,
  Check, X, AlertOctagon, BarChart3, Clock, Loader2, Search,
  Trash2, ChevronDown, UserCog, AlertTriangle, CheckCircle2,
  XCircle, RefreshCw, Filter, Eye, TrendingUp, Activity
} from 'lucide-react';

// ─── Toast notification system ───
interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] space-y-3 max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={`p-4 rounded-xl border backdrop-blur-xl flex items-start gap-3 shadow-2xl cursor-pointer ${
              toast.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : toast.type === 'error'
                ? 'bg-red-500/10 border-red-500/30 text-red-300'
                : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
            }`}
            onClick={() => onDismiss(toast.id)}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> :
             toast.type === 'error' ? <XCircle className="w-5 h-5 shrink-0 mt-0.5" /> :
             <Activity className="w-5 h-5 shrink-0 mt-0.5" />}
            <span className="text-xs font-semibold leading-relaxed">{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Confirmation modal ───
function ConfirmModal({ open, title, message, confirmLabel, onConfirm, onCancel, variant = 'danger' }: {
  open: boolean; title: string; message: string; confirmLabel: string;
  onConfirm: () => void; onCancel: () => void; variant?: 'danger' | 'warning';
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative z-10 w-full max-w-md mx-4 p-6 glass-panel rounded-2xl border border-white/10 space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${variant === 'danger' ? 'bg-red-500/15' : 'bg-amber-500/15'}`}>
            <AlertTriangle className={`w-5 h-5 ${variant === 'danger' ? 'text-red-400' : 'text-amber-400'}`} />
          </div>
          <h3 className="font-extrabold text-base text-white">{title}</h3>
        </div>
        <p className="text-xs font-semibold text-slate-400 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 border border-white/10 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              variant === 'danger'
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Role badge component ───
function RoleBadge({ role }: { role: string }) {
  const config: Record<string, { bg: string; text: string; border: string }> = {
    student: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
    recruiter: { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/20' },
    admin: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  };
  const c = config[role] || config.student;
  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${c.bg} ${c.text} ${c.border}`}>
      {role}
    </span>
  );
}

// ─── Status badge component ───
function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
      active
        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        : 'bg-red-500/10 text-red-400 border-red-500/20'
    }`}>
      {active ? 'Active' : 'Suspended'}
    </span>
  );
}

// ═══════════════════════════════════════════════
// MAIN ADMIN DASHBOARD
// ═══════════════════════════════════════════════
export default function AdminDashboard() {
  const { user, logout, apiFetch, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'analytics' | 'companies' | 'users' | 'jobs'>('analytics');

  // DB States
  const [metrics, setMetrics] = useState<any>(null);
  const [topSkills, setTopSkills] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [jobsList, setJobsList] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Search & filter states for users tab
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');

  // Toast system
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Confirmation modal
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean; title: string; message: string; confirmLabel: string;
    onConfirm: () => void; variant: 'danger' | 'warning';
  }>({ open: false, title: '', message: '', confirmLabel: '', onConfirm: () => {}, variant: 'danger' });

  // Role dropdown
  const [roleDropdownOpen, setRoleDropdownOpen] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Toast helpers
  const addToast = useCallback((message: string, type: Toast['type']) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setRoleDropdownOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user && user.role !== 'admin') {
      router.push(`/dashboard/${user.role}`);
      return;
    }
    if (user) {
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  // ─── Data fetching ───
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [stats, users, comps, jobs] = await Promise.all([
        apiFetch('/admin/stats'),
        apiFetch('/admin/users'),
        apiFetch('/admin/companies'),
        apiFetch('/admin/internships')
      ]);

      setMetrics(stats.metrics);
      setTopSkills(stats.topSkills || []);
      setRecentLogs(stats.recentActivity || []);
      setUsersList(users || []);
      setCompanies(comps || []);
      setJobsList(jobs || []);
    } catch (e: any) {
      console.error('Failed to fetch admin data:', e);
      addToast(`Failed to load dashboard data: ${e.message || 'Backend unreachable'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ─── Fetch users with filters ───
  const fetchFilteredUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (userSearch) params.set('search', userSearch);
      if (userRoleFilter !== 'all') params.set('role', userRoleFilter);
      if (userStatusFilter !== 'all') params.set('status', userStatusFilter);

      const users = await apiFetch(`/admin/users?${params.toString()}`);
      setUsersList(users || []);
    } catch (e: any) {
      addToast(`Failed to fetch users: ${e.message}`, 'error');
    }
  };

  // Debounced user search
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => fetchFilteredUsers(), 300);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSearch, userRoleFilter, userStatusFilter]);

  // ─── Admin actions ───

  // Toggle company verification
  const handleVerifyCompany = async (compId: string) => {
    try {
      setActionLoading(compId);
      const result = await apiFetch(`/admin/companies/${compId}/verify`, { method: 'PUT' });
      addToast(result.message, 'success');
      fetchDashboardData();
    } catch (err: any) {
      addToast(`Failed to update company: ${err.message}`, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Delete company (with confirmation)
  const handleDeleteCompany = (compId: string, compName: string) => {
    setConfirmModal({
      open: true,
      title: 'Delete Company',
      message: `Are you sure you want to delete "${compName}"? This will also delete all associated internship postings. This action cannot be undone.`,
      confirmLabel: 'Delete Company',
      variant: 'danger',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, open: false }));
        try {
          setActionLoading(compId);
          const result = await apiFetch(`/admin/companies/${compId}`, { method: 'DELETE' });
          addToast(result.message, 'success');
          fetchDashboardData();
        } catch (err: any) {
          addToast(`Failed to delete company: ${err.message}`, 'error');
        } finally {
          setActionLoading(null);
        }
      }
    });
  };

  // Toggle user suspension
  const handleSuspendUser = async (userId: string) => {
    try {
      setActionLoading(userId);
      const result = await apiFetch(`/admin/users/${userId}/suspend`, { method: 'PUT' });
      addToast(result.message, 'success');
      fetchFilteredUsers();
      // Refresh stats too
      const stats = await apiFetch('/admin/stats');
      setMetrics(stats.metrics);
    } catch (err: any) {
      addToast(`Failed to update user: ${err.message}`, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Delete user (with confirmation)
  const handleDeleteUser = (userId: string, userName: string) => {
    setConfirmModal({
      open: true,
      title: 'Delete User Account',
      message: `Are you sure you want to permanently delete the account for "${userName}"? All associated data will be lost. This action cannot be undone.`,
      confirmLabel: 'Delete User',
      variant: 'danger',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, open: false }));
        try {
          setActionLoading(userId);
          const result = await apiFetch(`/admin/users/${userId}`, { method: 'DELETE' });
          addToast(result.message, 'success');
          fetchFilteredUsers();
          const stats = await apiFetch('/admin/stats');
          setMetrics(stats.metrics);
        } catch (err: any) {
          addToast(`Failed to delete user: ${err.message}`, 'error');
        } finally {
          setActionLoading(null);
        }
      }
    });
  };

  // Change user role
  const handleChangeRole = async (userId: string, newRole: string) => {
    setRoleDropdownOpen(null);
    try {
      setActionLoading(userId);
      const result = await apiFetch(`/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole })
      });
      addToast(result.message, 'success');
      fetchFilteredUsers();
      const stats = await apiFetch('/admin/stats');
      setMetrics(stats.metrics);
    } catch (err: any) {
      addToast(`Failed to change role: ${err.message}`, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Approve Job Posting
  const handleApproveJob = async (jobId: string) => {
    try {
      setActionLoading(jobId);
      const result = await apiFetch(`/admin/internships/${jobId}/approve`, { method: 'PUT' });
      addToast(result.message, 'success');
      fetchDashboardData();
    } catch (err: any) {
      addToast(`Failed to approve job: ${err.message}`, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Reject Job Posting
  const handleRejectJob = async (jobId: string) => {
    try {
      setActionLoading(jobId);
      const result = await apiFetch(`/admin/internships/${jobId}/reject`, { method: 'PUT' });
      addToast(result.message, 'success');
      fetchDashboardData();
    } catch (err: any) {
      addToast(`Failed to reject job: ${err.message}`, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // ─── Metric card helper ───
  const MetricCard = ({ label, value, icon: Icon, color, subtext }: { label: string; value: number | string; icon: any; color: string; subtext?: string }) => (
    <div className="p-4 glass-panel rounded-xl border border-white/5 bg-gradient-to-br from-transparent to-transparent hover:border-white/10 transition-all group">
      <div className="flex justify-between items-center text-slate-400 mb-1">
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <span className="text-2xl font-extrabold text-white">{value}</span>
      {subtext && <p className="text-[10px] text-slate-500 font-semibold mt-1">{subtext}</p>}
    </div>
  );

  // Highest skill count for bar normalization
  const maxSkillValue = topSkills.length > 0 ? Math.max(...topSkills.map(s => s.value)) : 1;

  return (
    <div className="min-h-screen relative flex flex-col bg-slate-950 text-slate-100">
      <div className="absolute top-0 right-0 w-[40vw] h-[40vw] rounded-full bg-purple-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none" />

      {/* TOAST NOTIFICATIONS */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* CONFIRMATION MODAL */}
      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, open: false }))}
        variant={confirmModal.variant}
      />

      {/* HEADER */}
      <header className="sticky top-0 z-40 w-full px-6 py-4 glass-panel border-b border-indigo-500/10 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="p-2 bg-gradient-to-tr from-indigo-500 to-teal-400 rounded-lg text-white">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg bg-gradient-to-r from-indigo-500 to-teal-400 bg-clip-text text-transparent">
              SmartMatch
            </span>
          </Link>
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-wider ml-2">
            Admin
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={fetchDashboardData}
            className="p-2 rounded-lg hover:bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
            </div>
            <div className="hidden sm:block">
              <span className="text-xs font-bold block text-white">{user?.name || 'Admin'}</span>
              <span className="text-[10px] text-slate-500 font-semibold">{user?.email}</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-lg hover:bg-red-500/10 border border-red-500/20 text-red-400 transition-colors flex items-center space-x-1 text-xs font-semibold"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* METRIC SUMMARIES */}
      {metrics && (
        <div className="max-w-7xl w-full mx-auto px-6 pt-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <MetricCard label="Students" value={metrics.totalStudents} icon={Users} color="text-indigo-400" />
          <MetricCard label="Recruiters" value={metrics.totalRecruiters} icon={Users} color="text-teal-400" />
          <MetricCard label="Companies" value={metrics.totalCompanies} icon={Building} color="text-purple-400" />
          <MetricCard label="Active Jobs" value={metrics.activeJobs} icon={Briefcase} color="text-emerald-400" subtext={`${metrics.pendingJobs || 0} pending`} />
          <MetricCard label="Applications" value={metrics.totalApplications} icon={TrendingUp} color="text-blue-400" subtext={`${metrics.placementRate}% placed`} />
          <MetricCard label="Suspended" value={metrics.suspendedUsers || 0} icon={AlertOctagon} color="text-red-400" />
        </div>
      )}

      {/* BODY WORKSPACE */}
      <div className="flex-grow max-w-7xl w-full mx-auto px-6 py-8 grid md:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <aside className="space-y-4 md:col-span-1">
          <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-1">
            {([
              { key: 'analytics', icon: BarChart3, label: 'Platform Analytics' },
              { key: 'users', icon: Users, label: 'User Management' },
              { key: 'companies', icon: Building, label: 'Companies' },
              { key: 'jobs', icon: Briefcase, label: 'Job Moderation' },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full py-2.5 px-4 rounded-xl text-left text-xs font-bold transition-all flex items-center space-x-3 ${
                  activeTab === tab.key ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'hover:bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.key === 'users' && usersList.length > 0 && (
                  <span className="ml-auto text-[10px] bg-white/10 px-1.5 py-0.5 rounded-md">{usersList.length}</span>
                )}
              </button>
            ))}
          </div>

          {/* Quick stats sidebar */}
          {metrics && (
            <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Quick Stats</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Total Users</span>
                  <span className="text-white">{metrics.totalUsers || 0}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Selected</span>
                  <span className="text-emerald-400">{metrics.selectedCandidates || 0}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Rejected</span>
                  <span className="text-red-400">{metrics.rejectedCandidates || 0}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Placement Rate</span>
                  <span className="text-purple-400">{metrics.placementRate}%</span>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Content workspace */}
        <main className="md:col-span-3 space-y-6">
          {loading ? (
            <div className="h-64 flex flex-col justify-center items-center space-y-4">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
              <span className="text-xs text-slate-400">Loading admin operations panel...</span>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {/* ═══ TAB 1: ANALYTICS ═══ */}
              {activeTab === 'analytics' && (
                <motion.div
                  key="analytics"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="grid md:grid-cols-3 gap-6"
                >
                  {/* Skill Distribution Chart */}
                  <div className="p-6 glass-panel rounded-2xl border border-white/5 md:col-span-2 space-y-4">
                    <h3 className="font-extrabold text-sm text-purple-400">Top Candidate Skills In-Demand</h3>
                    {topSkills.length > 0 ? (
                      <div className="space-y-4">
                        {topSkills.map((sk: any) => (
                          <div key={sk.name}>
                            <div className="flex justify-between text-xs font-semibold mb-1 text-slate-400">
                              <span>{sk.name}</span>
                              <span>{sk.value} Profiles</span>
                            </div>
                            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(sk.value / maxSkillValue) * 100}%` }}
                                transition={{ duration: 0.8, delay: 0.1 }}
                                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-xs text-slate-500 font-semibold">
                        No student skills data available yet.
                      </div>
                    )}
                  </div>

                  {/* Activity Logs */}
                  <div className="p-6 glass-panel rounded-2xl border border-white/5 space-y-4">
                    <h3 className="font-extrabold text-sm text-purple-400">Recent Activity</h3>
                    {recentLogs.length > 0 ? (
                      <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                        {recentLogs.map((log: any, idx: number) => (
                          <div key={log.id || idx} className="flex gap-3 text-xs leading-relaxed font-semibold text-slate-400">
                            <div className={`p-1 rounded shrink-0 border border-white/5 ${
                              log.type === 'registration' ? 'bg-indigo-500/10 text-indigo-400' :
                              log.type === 'application' ? 'bg-teal-500/10 text-teal-400' :
                              'bg-slate-900 text-purple-400'
                            }`}>
                              {log.type === 'registration' ? <Users className="w-3.5 h-3.5" /> :
                               log.type === 'application' ? <Briefcase className="w-3.5 h-3.5" /> :
                               <Clock className="w-3.5 h-3.5" />}
                            </div>
                            <div className="min-w-0">
                              <span className="text-white font-extrabold block">{log.action}</span>
                              <span className="block truncate">{log.details}</span>
                              <span className="block text-[10px] text-slate-500 pt-0.5">{log.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-xs text-slate-500 font-semibold">
                        No recent activity to display.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ═══ TAB 2: USER MANAGEMENT ═══ */}
              {activeTab === 'users' && (
                <motion.div
                  key="users"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-xl font-extrabold">User Management</h2>
                    <span className="text-xs text-slate-500 font-semibold">{usersList.length} user{usersList.length !== 1 ? 's' : ''} found</span>
                  </div>

                  {/* Search & Filter Bar */}
                  <div className="glass-panel rounded-xl border border-white/5 p-4 flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-xs font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
                      />
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={userRoleFilter}
                        onChange={(e) => setUserRoleFilter(e.target.value)}
                        className="px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-purple-500/50 transition-all appearance-none cursor-pointer"
                      >
                        <option value="all">All Roles</option>
                        <option value="student">Students</option>
                        <option value="recruiter">Recruiters</option>
                        <option value="admin">Admins</option>
                      </select>
                      <select
                        value={userStatusFilter}
                        onChange={(e) => setUserStatusFilter(e.target.value)}
                        className="px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-purple-500/50 transition-all appearance-none cursor-pointer"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  </div>

                  {/* Users List */}
                  <div className="space-y-2">
                    {usersList.length > 0 ? usersList.map((u: any) => (
                      <div key={u.id} className="p-4 glass-panel rounded-xl border border-white/5 hover:border-white/10 transition-all">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center border border-white/10 shrink-0">
                              <span className="text-xs font-extrabold text-white">
                                {u.name?.charAt(0)?.toUpperCase() || '?'}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold text-sm text-white">{u.name}</h4>
                                <RoleBadge role={u.role} />
                                <StatusBadge active={u.isVerified} />
                              </div>
                              <p className="text-[11px] text-slate-400 font-semibold truncate">{u.email}</p>
                              {u.createdAt && (
                                <p className="text-[10px] text-slate-500 font-semibold">Joined {new Date(u.createdAt).toLocaleDateString()}</p>
                              )}
                            </div>
                          </div>

                          {/* User Actions */}
                          <div className="flex items-center gap-2 shrink-0" ref={roleDropdownOpen === u.id ? dropdownRef : null}>
                            {/* Role change dropdown */}
                            <div className="relative">
                              <button
                                onClick={() => setRoleDropdownOpen(roleDropdownOpen === u.id ? null : u.id)}
                                className="py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 bg-slate-800/50 border border-white/10 text-slate-300 hover:text-white hover:border-white/20"
                                title="Change role"
                              >
                                <UserCog className="w-3.5 h-3.5" />
                                <span>Role</span>
                                <ChevronDown className="w-3 h-3" />
                              </button>
                              {roleDropdownOpen === u.id && (
                                <div className="absolute right-0 top-full mt-1 w-36 glass-panel rounded-lg border border-white/10 shadow-2xl z-50 overflow-hidden">
                                  {['student', 'recruiter', 'admin'].map(role => (
                                    <button
                                      key={role}
                                      onClick={() => handleChangeRole(u.id, role)}
                                      disabled={u.role === role}
                                      className={`w-full px-3 py-2 text-left text-xs font-semibold transition-all flex items-center justify-between ${
                                        u.role === role
                                          ? 'text-slate-500 cursor-not-allowed bg-white/5'
                                          : 'text-slate-300 hover:bg-purple-500/10 hover:text-white'
                                      }`}
                                    >
                                      <span className="capitalize">{role}</span>
                                      {u.role === role && <Check className="w-3 h-3 text-purple-400" />}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Suspend/Activate */}
                            <button
                              onClick={() => handleSuspendUser(u.id)}
                              disabled={actionLoading === u.id}
                              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                                u.isVerified
                                  ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/25'
                                  : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/25'
                              } ${actionLoading === u.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {actionLoading === u.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
                               u.isVerified ? <AlertOctagon className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                              <span>{u.isVerified ? 'Suspend' : 'Activate'}</span>
                            </button>

                            {/* Delete user */}
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              disabled={actionLoading === u.id}
                              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/25 ${
                                actionLoading === u.id ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                              title="Delete user"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="py-16 text-center glass-panel rounded-2xl border border-white/5">
                        <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                        <p className="text-sm font-bold text-slate-500">No users found</p>
                        <p className="text-xs text-slate-600 font-semibold mt-1">
                          {userSearch || userRoleFilter !== 'all' || userStatusFilter !== 'all'
                            ? 'Try adjusting your search or filter criteria.'
                            : 'No users have registered yet.'}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ═══ TAB 3: COMPANIES ═══ */}
              {activeTab === 'companies' && (
                <motion.div
                  key="companies"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-extrabold">Company Registry</h2>
                    <span className="text-xs text-slate-500 font-semibold">{companies.length} compan{companies.length !== 1 ? 'ies' : 'y'}</span>
                  </div>

                  <div className="space-y-3">
                    {companies.length > 0 ? companies.map((c: any) => (
                      <div key={c.id} className="p-4 glass-panel rounded-xl border border-white/5 hover:border-white/10 transition-all">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-teal-500/20 flex items-center justify-center border border-white/10">
                              <Building className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-white">{c.name}</h4>
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                                  c.is_verified
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                }`}>
                                  {c.is_verified ? 'Verified' : 'Unverified'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 font-semibold">
                                {c.website && `${c.website} • `}{c.location || 'No location'}
                              </p>
                              {c.description && (
                                <p className="text-[10px] text-slate-500 font-semibold mt-1 line-clamp-1">{c.description}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => handleVerifyCompany(c.id)}
                              disabled={actionLoading === c.id}
                              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                                c.is_verified
                                  ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/25'
                                  : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/25'
                              } ${actionLoading === c.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {actionLoading === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
                               c.is_verified ? <X className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                              <span>{c.is_verified ? 'Revoke' : 'Verify'}</span>
                            </button>
                            <button
                              onClick={() => handleDeleteCompany(c.id, c.name)}
                              disabled={actionLoading === c.id}
                              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/25 ${
                                actionLoading === c.id ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                              title="Delete company"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="py-16 text-center glass-panel rounded-2xl border border-white/5">
                        <Building className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                        <p className="text-sm font-bold text-slate-500">No companies registered</p>
                        <p className="text-xs text-slate-600 font-semibold mt-1">Companies will appear here when recruiters register.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ═══ TAB 4: JOB MODERATION ═══ */}
              {activeTab === 'jobs' && (
                <motion.div
                  key="jobs"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-extrabold">Job Moderation</h2>
                    <span className="text-xs text-slate-500 font-semibold">{jobsList.length} listing{jobsList.length !== 1 ? 's' : ''}</span>
                  </div>

                  <div className="space-y-3">
                    {jobsList.length > 0 ? jobsList.map((j: any) => (
                      <div key={j.id} className="p-4 glass-panel rounded-xl border border-white/5 hover:border-white/10 transition-all">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-sm text-white">{j.role}</h4>
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                                j.status === 'Active'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : j.status === 'Pending Approval'
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  : 'bg-red-500/10 text-red-400 border-red-500/20'
                              }`}>
                                {j.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 font-semibold mt-1">
                              {j.company_name || 'Unknown Company'} • {j.location} • {j.mode}
                            </p>
                            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                              {j.stipend} • {j.duration} • {j.applicants_count || 0} applicant{(j.applicants_count || 0) !== 1 ? 's' : ''}
                            </p>
                          </div>

                          <div className="flex gap-2 shrink-0">
                            {j.status === 'Pending Approval' && (
                              <>
                                <button
                                  onClick={() => handleApproveJob(j.id)}
                                  disabled={actionLoading === j.id}
                                  className={`py-1.5 px-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/25 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                                    actionLoading === j.id ? 'opacity-50 cursor-not-allowed' : ''
                                  }`}
                                >
                                  {actionLoading === j.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                  <span>Approve</span>
                                </button>
                                <button
                                  onClick={() => handleRejectJob(j.id)}
                                  disabled={actionLoading === j.id}
                                  className={`py-1.5 px-3 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/25 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                                    actionLoading === j.id ? 'opacity-50 cursor-not-allowed' : ''
                                  }`}
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Reject</span>
                                </button>
                              </>
                            )}
                            {j.status === 'Active' && (
                              <button
                                onClick={() => handleRejectJob(j.id)}
                                disabled={actionLoading === j.id}
                                className={`py-1.5 px-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/25 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                                  actionLoading === j.id ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                              >
                                {actionLoading === j.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                                <span>Close Listing</span>
                              </button>
                            )}
                            {j.status === 'Closed' && (
                              <button
                                onClick={() => handleApproveJob(j.id)}
                                disabled={actionLoading === j.id}
                                className={`py-1.5 px-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/25 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                                  actionLoading === j.id ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                              >
                                {actionLoading === j.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                                <span>Re-activate</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="py-16 text-center glass-panel rounded-2xl border border-white/5">
                        <Briefcase className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                        <p className="text-sm font-bold text-slate-500">No internship listings</p>
                        <p className="text-xs text-slate-600 font-semibold mt-1">Listings will appear here when recruiters post internships.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  );
}
