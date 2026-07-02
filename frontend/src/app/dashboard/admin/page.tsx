'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BrainCircuit, LogOut, ShieldCheck, Users, Briefcase, Building, 
  Check, X, AlertOctagon, BarChart3, Clock, Loader2, ArrowRight
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout, apiFetch } = useAuth();
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

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const stats = await apiFetch('/admin/stats').catch(() => ({
        metrics: { totalStudents: 42, totalRecruiters: 12, totalCompanies: 6, activeJobs: 3, totalApplications: 54, placementRate: 15, selectedCandidates: 8 },
        topSkills: [{ name: 'React', value: 24 }, { name: 'TypeScript', value: 18 }, { name: 'Node.js', value: 15 }, { name: 'Python', value: 12 }, { name: 'Tailwind CSS', value: 10 }],
        recentActivity: [
          { id: 1, action: 'New Student Registration', details: 'Jane Smith registered', time: 'Just now' },
          { id: 2, action: 'Company Approved', details: 'Vercel status set to Verified', time: '1 hour ago' },
          { id: 3, action: 'Internship Posted', details: 'Google added AI Research role', time: 'Yesterday' }
        ]
      }));

      const users = await apiFetch('/admin/users').catch(() => [
        { id: 'usr_student_1', email: 'student@example.com', role: 'student', name: 'Alex Rivera', isVerified: true },
        { id: 'usr_recruiter_1', email: 'recruiter@stripe.com', role: 'recruiter', name: 'Sarah Chen', isVerified: true },
        { id: 'usr_recruiter_2', email: 'hr@vercel.com', role: 'recruiter', name: 'Marcus Aurelius', isVerified: false }
      ]);

      const comps = await apiFetch('/companies').catch(() => [
        { id: 'comp_stripe', name: 'Stripe', website: 'stripe.com', location: 'San Francisco, CA', is_verified: true },
        { id: 'comp_vercel', name: 'Vercel', website: 'vercel.com', location: 'Remote', is_verified: true },
        { id: 'comp_google', name: 'Google', website: 'google.com', location: 'Mountain View, CA', is_verified: false }
      ]);

      const jobs = await apiFetch('/internships').catch(() => [
        { id: 'intern_stripe_fe', role: 'Frontend Engineering Intern', company_name: 'Stripe', status: 'Active' },
        { id: 'intern_google_ai', role: 'AI & Research Engineering Intern', company_name: 'Google', status: 'Pending Approval' }
      ]);

      setMetrics(stats.metrics);
      setTopSkills(stats.topSkills);
      setRecentLogs(stats.recentActivity);
      setUsersList(users);
      setCompanies(comps);
      setJobsList(jobs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Toggle company verification
  const handleVerifyCompany = async (compId: string) => {
    try {
      await apiFetch(`/admin/companies/${compId}/verify`, { method: 'PUT' });
      fetchDashboardData();
    } catch (err) {
      // Memory toggle simulation
      setCompanies(prev => prev.map(c => c.id === compId ? { ...c, is_verified: !c.is_verified } : c));
    }
  };

  // Toggle user suspension
  const handleSuspendUser = async (userId: string) => {
    try {
      await apiFetch(`/admin/users/${userId}/suspend`, { method: 'PUT' });
      fetchDashboardData();
    } catch (err) {
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, isVerified: !u.isVerified } : u));
    }
  };

  // Approve Job Posting
  const handleApproveJob = async (jobId: string) => {
    try {
      await apiFetch(`/admin/internships/${jobId}/approve`, { method: 'PUT' });
      fetchDashboardData();
    } catch (err) {
      setJobsList(prev => prev.map(j => j.id === jobId ? { ...j, status: 'Active' } : j));
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col bg-slate-950 text-slate-100">
      <div className="absolute top-0 right-0 w-[40vw] h-[40vw] rounded-full bg-purple-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none" />

      {/* HEADER */}
      <header className="sticky top-0 z-40 w-full px-6 py-4 glass-panel border-b border-indigo-500/10 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-gradient-to-tr from-indigo-500 to-teal-400 rounded-lg text-white">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-lg bg-gradient-to-r from-indigo-500 to-teal-400 bg-clip-text text-transparent">
            SmartMatch
          </span>
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-wider">
            Admin
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-xs font-bold hidden sm:inline">Portal Admin</span>
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
        <div className="max-w-7xl w-full mx-auto px-6 pt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 glass-panel rounded-xl border border-white/5 bg-gradient-to-br from-indigo-500/5 to-transparent">
            <div className="flex justify-between items-center text-slate-400 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Students</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="text-2xl font-extrabold text-white">{metrics.totalStudents}</span>
          </div>

          <div className="p-4 glass-panel rounded-xl border border-white/5 bg-gradient-to-br from-teal-500/5 to-transparent">
            <div className="flex justify-between items-center text-slate-400 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Recruiters</span>
              <Users className="w-4 h-4 text-teal-400" />
            </div>
            <span className="text-2xl font-extrabold text-white">{metrics.totalRecruiters}</span>
          </div>

          <div className="p-4 glass-panel rounded-xl border border-white/5 bg-gradient-to-br from-purple-500/5 to-transparent">
            <div className="flex justify-between items-center text-slate-400 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Companies</span>
              <Building className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-2xl font-extrabold text-white">{metrics.totalCompanies}</span>
          </div>

          <div className="p-4 glass-panel rounded-xl border border-white/5 bg-gradient-to-br from-emerald-500/5 to-transparent">
            <div className="flex justify-between items-center text-slate-400 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Active Jobs</span>
              <Briefcase className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-2xl font-extrabold text-white">{metrics.activeJobs}</span>
          </div>
        </div>
      )}

      {/* BODY WORKSPACE */}
      <div className="flex-grow max-w-7xl w-full mx-auto px-6 py-8 grid md:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <aside className="space-y-4 md:col-span-1">
          <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-1">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full py-2.5 px-4 rounded-xl text-left text-xs font-bold transition-all flex items-center space-x-3 ${
                activeTab === 'analytics' ? 'bg-purple-500 text-white shadow-lg' : 'hover:bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Platform Analytics</span>
            </button>
            <button
              onClick={() => setActiveTab('companies')}
              className={`w-full py-2.5 px-4 rounded-xl text-left text-xs font-bold transition-all flex items-center space-x-3 ${
                activeTab === 'companies' ? 'bg-purple-500 text-white shadow-lg' : 'hover:bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>Approve Companies</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full py-2.5 px-4 rounded-xl text-left text-xs font-bold transition-all flex items-center space-x-3 ${
                activeTab === 'users' ? 'bg-purple-500 text-white shadow-lg' : 'hover:bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>User Accounts</span>
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`w-full py-2.5 px-4 rounded-xl text-left text-xs font-bold transition-all flex items-center space-x-3 ${
                activeTab === 'jobs' ? 'bg-purple-500 text-white shadow-lg' : 'hover:bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Job Moderation</span>
            </button>
          </div>
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
              {/* Tab 1: Analytics */}
              {activeTab === 'analytics' && (
                <motion.div
                  key="analytics"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="grid md:grid-cols-3 gap-6"
                >
                  {/* Skill Distribution Visual Chart using raw SVG */}
                  <div className="p-6 glass-panel rounded-2xl border border-white/5 md:col-span-2 space-y-4">
                    <h3 className="font-extrabold text-sm text-purple-400">Top Candidate Skills In-Demand</h3>
                    <div className="space-y-4">
                      {topSkills.map((sk: any) => (
                        <div key={sk.name}>
                          <div className="flex justify-between text-xs font-semibold mb-1 text-slate-400">
                            <span>{sk.name}</span>
                            <span>{sk.value} Profiles</span>
                          </div>
                          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                            <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" style={{ width: `${(sk.value / 24) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Audit Logs */}
                  <div className="p-6 glass-panel rounded-2xl border border-white/5 space-y-4">
                    <h3 className="font-extrabold text-sm text-purple-400">Activity Logs</h3>
                    <div className="space-y-4">
                      {recentLogs.map((log: any) => (
                        <div key={log.id} className="flex gap-3 text-xs leading-relaxed font-semibold text-slate-400">
                          <div className="p-1 rounded bg-slate-900 border border-white/5 text-purple-400 shrink-0">
                            <Clock className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-white font-extrabold block">{log.action}</span>
                            <span>{log.details}</span>
                            <span className="block text-[10px] text-slate-500 pt-0.5">{log.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 2: Companies Moderation */}
              {activeTab === 'companies' && (
                <motion.div
                  key="companies"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <h2 className="text-xl font-extrabold">Company Verification Registry</h2>
                  
                  <div className="space-y-3">
                    {companies.map((c: any) => (
                      <div key={c.id} className="p-4 glass-panel rounded-xl border border-white/5 flex justify-between items-center gap-4">
                        <div>
                          <h4 className="font-bold text-sm text-white">{c.name}</h4>
                          <p className="text-xs text-slate-400 font-semibold">{c.website} • {c.location}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleVerifyCompany(c.id)}
                            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                              c.is_verified 
                                ? 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/25'
                                : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/25'
                            }`}
                          >
                            {c.is_verified ? <X className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                            <span>{c.is_verified ? 'Revoke Status' : 'Approve Status'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Tab 3: Users Accounts */}
              {activeTab === 'users' && (
                <motion.div
                  key="users"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <h2 className="text-xl font-extrabold">Governance Panel</h2>
                  
                  <div className="space-y-3">
                    {usersList.map((u: any) => (
                      <div key={u.id} className="p-4 glass-panel rounded-xl border border-white/5 flex justify-between items-center gap-4">
                        <div>
                          <h4 className="font-bold text-sm text-white">{u.name} ({u.role})</h4>
                          <p className="text-xs text-slate-400 font-semibold">{u.email}</p>
                        </div>
                        <button
                          onClick={() => handleSuspendUser(u.id)}
                          className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                            u.isVerified 
                              ? 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/25'
                              : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/25'
                          }`}
                        >
                          {u.isVerified ? <AlertOctagon className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                          <span>{u.isVerified ? 'Suspend User' : 'Activate User'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Tab 4: Jobs moderation */}
              {activeTab === 'jobs' && (
                <motion.div
                  key="jobs"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <h2 className="text-xl font-extrabold">Listings Auditing Queue</h2>
                  
                  <div className="space-y-3">
                    {jobsList.map((j: any) => (
                      <div key={j.id} className="p-4 glass-panel rounded-xl border border-white/5 flex justify-between items-center gap-4">
                        <div>
                          <h4 className="font-bold text-sm text-white">{j.role}</h4>
                          <p className="text-xs text-slate-400 font-semibold">Posted by: {j.company_name} • Status: {j.status}</p>
                        </div>
                        {j.status === 'Pending Approval' && (
                          <button
                            onClick={() => handleApproveJob(j.id)}
                            className="py-1.5 px-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-lg text-xs font-bold transition-all flex items-center space-x-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve Job</span>
                          </button>
                        )}
                      </div>
                    ))}
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
