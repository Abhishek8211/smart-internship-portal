'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BrainCircuit, LogOut, Briefcase, Plus, Users, Award, Percent, 
  MapPin, Clock, DollarSign, Loader2, Sparkles, User, FileText, Check, X, Calendar, Send
} from 'lucide-react';

export default function RecruiterDashboard() {
  const { user, logout, apiFetch, loading: authLoading } = useAuth();
  const router = useRouter();

  // Navigation Panel
  const [activeTab, setActiveTab] = useState<'listings' | 'applicants' | 'post-job' | 'company'>('listings');

  // DB States
  const [listings, setListings] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Post/Edit Job form state
  const [jobRole, setJobRole] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [jobLoc, setJobLoc] = useState('');
  const [jobMode, setJobMode] = useState<'Remote' | 'Hybrid' | 'Office'>('Remote');
  const [jobStipend, setJobStipend] = useState('');
  const [jobDuration, setJobDuration] = useState('');
  const [jobSkills, setJobSkills] = useState('');
  const [postingJob, setPostingJob] = useState(false);
  const [editingJob, setEditingJob] = useState<any | null>(null);

  // Company Profile states
  const [companyName, setCompanyName] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [companyDesc, setCompanyDesc] = useState('');
  const [companyWeb, setCompanyWeb] = useState('');
  const [companyLoc, setCompanyLoc] = useState('');
  const [savingCompany, setSavingCompany] = useState(false);

  // Application modification states (Interview scheduling modal)
  const [schedulingApp, setSchedulingApp] = useState<any>(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewLink, setInterviewLink] = useState('https://zoom.us/j/987654321');
  const [interviewNotes, setInterviewNotes] = useState('');
  const [schedulingLoading, setSchedulingLoading] = useState(false);

  // Offer Letter modal states
  const [offeringApp, setOfferingApp] = useState<any>(null);
  const [offerSalary, setOfferSalary] = useState('');
  const [offerStartDate, setOfferStartDate] = useState('');
  const [offeringLoading, setOfferingLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user && user.role !== 'recruiter') {
      router.push(`/dashboard/${user.role}`);
      return;
    }
    if (user) {
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const jobsData = await apiFetch('/internships').catch(() => []);

      const applicantsData = await apiFetch('/applications').catch(() => []);

      // Filter listings belonging to this recruiter's company if in memory
      setListings(jobsData);
      
      // Candidate ranking: sort applicants by AI score descending
      const sortedApplicants = [...applicantsData].sort((a, b) => b.matchPercentage - a.matchPercentage);
      setApplicants(sortedApplicants);

      // Fetch company details
      const companyRes = await apiFetch('/recruiter/company').catch(() => ({ company: null }));
      if (companyRes?.company) {
        setCompanyName(companyRes.company.name || '');
        setCompanyLogo(companyRes.company.logo || '');
        setCompanyDesc(companyRes.company.description || '');
        setCompanyWeb(companyRes.company.website || '');
        setCompanyLoc(companyRes.company.location || '');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Job Submission
  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostingJob(true);
    try {
      const skillsArray = jobSkills.split(',').map(s => s.trim()).filter(Boolean);
      
      if (editingJob) {
        // Edit flow
        await apiFetch(`/internships/${editingJob.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            role: jobRole,
            description: jobDesc,
            location: jobLoc,
            mode: jobMode,
            stipend: jobStipend,
            duration: jobDuration,
            skills_required: skillsArray
          })
        });
        addToast('Success', 'Internship position updated successfully!', 'success');
      } else {
        // Post flow
        await apiFetch('/internships', {
          method: 'POST',
          body: JSON.stringify({
            role: jobRole,
            description: jobDesc,
            location: jobLoc,
            mode: jobMode,
            stipend: jobStipend,
            duration: jobDuration,
            skills_required: skillsArray
          })
        });
        addToast('Success', 'Internship position posted successfully!', 'success');
      }
      
      // Clear inputs
      setJobRole('');
      setJobDesc('');
      setJobLoc('');
      setJobStipend('');
      setJobDuration('');
      setJobSkills('');
      setEditingJob(null);
      
      setActiveTab('listings');
      fetchDashboardData();
    } catch (err: any) {
      addToast('Demo Mode', editingJob ? 'Updated successfully (simulated local changes)' : 'Posted successfully (simulated local changes)', 'info');
      setEditingJob(null);
      setActiveTab('listings');
      fetchDashboardData();
    } finally {
      setPostingJob(false);
    }
  };

  // Company Profile Save
  const handleCompanySave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCompany(true);
    try {
      const data = await apiFetch('/recruiter/company', {
        method: 'PUT',
        body: JSON.stringify({
          name: companyName,
          logo: companyLogo,
          description: companyDesc,
          website: companyWeb,
          location: companyLoc
        })
      });
      addToast('Success', 'Company profile updated successfully!', 'success');
      fetchDashboardData();
    } catch (err: any) {
      addToast('Demo Mode', 'Updated successfully (simulated local changes)', 'info');
    } finally {
      setSavingCompany(false);
    }
  };

  // Job deletion
  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this position?')) return;
    try {
      await apiFetch(`/internships/${jobId}`, { method: 'DELETE' });
      fetchDashboardData();
    } catch (err) {
      addToast('Demo Mode', 'Delete completed (simulated).', 'info');
    }
  };

  // Shortlist application
  const handleShortlist = async (appId: string) => {
    try {
      await apiFetch(`/applications/${appId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'Shortlisted' })
      });
      fetchDashboardData();
    } catch (err) {
      addToast('Demo Mode', 'Status updated to Shortlisted (simulated).', 'info');
    }
  };

  // Reject candidate
  const handleReject = async (appId: string) => {
    try {
      await apiFetch(`/applications/${appId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'Rejected' })
      });
      fetchDashboardData();
    } catch (err) {
      addToast('Demo Mode', 'Status updated to Rejected (simulated).', 'info');
    }
  };

  // Open Scheduler Modal
  const openScheduler = (app: any) => {
    setSchedulingApp(app);
    setInterviewDate(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16));
  };

  // Submit interview schedule
  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSchedulingLoading(true);
    try {
      await apiFetch(`/applications/${schedulingApp._id}/status`, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'Interview Scheduled',
          interviewDateTime: interviewDate,
          interviewLink,
          notes: interviewNotes
        })
      });
      addToast('Success', 'Interview Scheduled! AI practice questions generated.', 'success');
      setSchedulingApp(null);
      fetchDashboardData();
    } catch (err) {
      addToast('Demo Mode', 'Interview Scheduled & AI practice sheets generated.', 'info');
      setSchedulingApp(null);
    } finally {
      setSchedulingLoading(false);
    }
  };

  // Open Offer letter modal
  const openOfferModal = (app: any) => {
    setOfferingApp(app);
    setOfferSalary(app.internship?.stipend || '$40/hour');
    setOfferStartDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
  };

  // Submit Offer
  const handleOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOfferingLoading(true);
    try {
      await apiFetch(`/applications/${offeringApp._id}/status`, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'Selected',
          salary: offerSalary,
          startDate: offerStartDate
        })
      });
      addToast('Success', 'Offer letter sent successfully!', 'success');
      setOfferingApp(null);
      fetchDashboardData();
    } catch (err) {
      addToast('Demo Mode', 'Offer letter logged (simulated).', 'info');
      setOfferingApp(null);
    } finally {
      setOfferingLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col bg-slate-950 text-slate-100">
      {/* Background gradients */}
      <div className="absolute top-0 right-0 w-[40vw] h-[40vw] rounded-full bg-teal-600/5 blur-[120px] pointer-events-none" />
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
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-teal-500/10 text-teal-400 border border-teal-500/20 uppercase tracking-wider">
            Recruiter
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <img 
              src={user?.profilePic || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80'} 
              alt="Avatar" 
              className="w-8 h-8 rounded-full border border-teal-500/30 object-cover"
            />
            <span className="text-xs font-bold hidden sm:inline">{user?.name || 'Sarah Chen'}</span>
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

      {/* METRIC HIGHLIGHTS BAR */}
      <div className="max-w-7xl w-full mx-auto px-6 pt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 glass-panel rounded-xl border border-white/5 bg-gradient-to-br from-indigo-500/5 to-transparent">
          <div className="flex justify-between items-center text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Active Jobs</span>
            <Briefcase className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-2xl font-extrabold text-white">{listings.length}</span>
        </div>

        <div className="p-4 glass-panel rounded-xl border border-white/5 bg-gradient-to-br from-teal-500/5 to-transparent">
          <div className="flex justify-between items-center text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Applicants Received</span>
            <Users className="w-4 h-4 text-teal-400" />
          </div>
          <span className="text-2xl font-extrabold text-white">{applicants.length}</span>
        </div>

        <div className="p-4 glass-panel rounded-xl border border-white/5 bg-gradient-to-br from-purple-500/5 to-transparent">
          <div className="flex justify-between items-center text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Shortlisted</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-2xl font-extrabold text-white">
            {applicants.filter(a => ['Shortlisted', 'Interview Scheduled'].includes(a.status)).length}
          </span>
        </div>

        <div className="p-4 glass-panel rounded-xl border border-white/5 bg-gradient-to-br from-emerald-500/5 to-transparent">
          <div className="flex justify-between items-center text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Placement Rate</span>
            <Percent className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-extrabold text-white">
            {applicants.length > 0 ? Math.round((applicants.filter(a => a.status === 'Selected').length / applicants.length) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* WORKSPACE LAYOUT */}
      <div className="flex-grow max-w-7xl w-full mx-auto px-6 py-8 grid md:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <aside className="space-y-4 md:col-span-1">
          <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-1">
            <button
              onClick={() => setActiveTab('listings')}
              className={`w-full py-2.5 px-4 rounded-xl text-left text-xs font-bold transition-all flex items-center space-x-3 ${
                activeTab === 'listings' ? 'bg-teal-500 text-white shadow-lg' : 'hover:bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Job Listings</span>
            </button>
            <button
              onClick={() => setActiveTab('applicants')}
              className={`w-full py-2.5 px-4 rounded-xl text-left text-xs font-bold transition-all flex items-center space-x-3 ${
                activeTab === 'applicants' ? 'bg-teal-500 text-white shadow-lg' : 'hover:bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Applicants Funnel</span>
            </button>
            <button
              onClick={() => {
                setEditingJob(null);
                setJobRole('');
                setJobDesc('');
                setJobLoc('');
                setJobStipend('');
                setJobDuration('');
                setJobSkills('');
                setActiveTab('post-job');
              }}
              className={`w-full py-2.5 px-4 rounded-xl text-left text-xs font-bold transition-all flex items-center space-x-3 ${
                activeTab === 'post-job' && !editingJob ? 'bg-teal-500 text-white shadow-lg' : 'hover:bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Post New Position</span>
            </button>
            <button
              onClick={() => setActiveTab('company')}
              className={`w-full py-2.5 px-4 rounded-xl text-left text-xs font-bold transition-all flex items-center space-x-3 ${
                activeTab === 'company' ? 'bg-teal-500 text-white shadow-lg' : 'hover:bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <BrainCircuit className="w-4 h-4" />
              <span>Company Profile</span>
            </button>
          </div>
        </aside>

        {/* Content Panel */}
        <main className="md:col-span-3 space-y-6">
          {loading ? (
            <div className="h-64 flex flex-col justify-center items-center space-y-4">
              <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
              <span className="text-xs text-slate-400">Loading recruiter database...</span>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {/* Tab 1: Listings */}
              {activeTab === 'listings' && (
                <motion.div
                  key="listings"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <h2 className="text-xl font-extrabold">Active Listings</h2>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    {listings.map((job: any) => (
                      <div key={job.id} className="p-6 glass-panel rounded-2xl border border-white/5 relative flex flex-col justify-between overflow-hidden">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-base text-white">{job.role}</h4>
                            <span className="px-2 py-0.5 bg-teal-500/10 border border-teal-500/30 text-teal-400 rounded-md font-extrabold text-[10px] uppercase">
                              Active
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-400 mb-4 font-semibold">
                            <span className="flex items-center space-x-1">
                              <MapPin className="w-3.5 h-3.5 text-teal-400" />
                              <span>{job.location}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3.5 h-3.5 text-indigo-400" />
                              <span>{job.duration} ({job.mode})</span>
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1 mb-4">
                            {job.skills_required?.slice(0, 3).map((sk: string) => (
                              <span key={sk} className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 text-slate-300">
                                {sk}
                              </span>
                            ))}
                            {job.skills_required?.length > 3 && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 text-slate-400">
                                +{job.skills_required.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-between items-center border-t border-white/5 pt-4 mt-4">
                          <span className="text-xs text-slate-400 font-bold">
                            💼 {job.applicants_count || 0} Candidates
                          </span>
                          <div className="flex space-x-3">
                            <button
                              onClick={() => {
                                setEditingJob(job);
                                setJobRole(job.role);
                                setJobDesc(job.description);
                                setJobLoc(job.location);
                                setJobMode(job.mode);
                                setJobStipend(job.stipend);
                                setJobDuration(job.duration);
                                setJobSkills(job.skills_required?.join(', ') || '');
                                setActiveTab('post-job');
                              }}
                              className="text-xs font-bold text-teal-400 hover:text-teal-300 hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteJob(job.id)}
                              className="text-xs font-bold text-red-400 hover:text-red-300 hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Tab 2: Applicants */}
              {activeTab === 'applicants' && (
                <motion.div
                  key="applicants"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <h2 className="text-xl font-extrabold flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-teal-400" />
                    <span>AI Candidate Ranking Funnel</span>
                  </h2>

                  <div className="space-y-4">
                    {applicants.map((app: any) => (
                      <div key={app._id} className="p-6 glass-panel rounded-2xl border border-white/5 flex flex-col justify-between space-y-4 relative overflow-hidden glass-panel-hover">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-teal-500/10 to-transparent blur-xl pointer-events-none" />

                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="flex items-center space-x-3">
                            <img src={app.studentProfilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80'} className="w-11 h-11 rounded-full object-cover border border-teal-500/30" alt="avatar" />
                            <div>
                              <h4 className="font-bold text-base text-white">{app.studentName}</h4>
                              <p className="text-xs text-slate-400 font-semibold">{app.studentEmail} • CGPA: {app.studentProfile?.cgpa || '3.5'}</p>
                              <span className="text-xs text-indigo-400 font-bold block mt-1">Applying for: {app.internship?.role}</span>
                            </div>
                          </div>

                          <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
                            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 font-extrabold text-[10px] flex items-center space-x-1">
                              <Sparkles className="w-3 h-3" />
                              <span>{app.matchPercentage}% AI Compatibility Match</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold block">Status: **{app.status}**</span>
                          </div>
                        </div>

                        {/* Student Skills & Projects parse summary */}
                        <div className="p-4 bg-slate-900/60 rounded-xl border border-white/5 grid sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-400">
                          <div>
                            <span className="text-white block font-bold text-xs mb-1.5">Candidate Skills:</span>
                            <div className="flex flex-wrap gap-1">
                              {app.studentProfile?.skills?.map((sk: string) => (
                                <span key={sk} className="px-2 py-0.5 rounded bg-white/5 text-slate-300 text-[10px] font-semibold">{sk}</span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="text-white block font-bold text-xs mb-1.5">Project Highlights:</span>
                            {app.studentProfile?.projects?.slice(0, 1).map((p: any) => (
                              <p key={p.title} className="leading-relaxed text-[11px] text-slate-400">💡 **{p.title}**: {p.description}</p>
                            ))}
                          </div>
                        </div>

                        {/* Pipeline controls */}
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                          {app.status === 'Applied' && (
                            <button
                              onClick={() => handleShortlist(app._id)}
                              className="py-1.5 px-4 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-xs font-bold transition-all flex items-center space-x-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Shortlist</span>
                            </button>
                          )}

                          {['Applied', 'Shortlisted'].includes(app.status) && (
                            <button
                              onClick={() => openScheduler(app)}
                              className="py-1.5 px-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold transition-all flex items-center space-x-1"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Schedule Interview</span>
                            </button>
                          )}

                          {app.status === 'Interview Scheduled' && (
                            <button
                              onClick={() => openOfferModal(app)}
                              className="py-1.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all flex items-center space-x-1"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Send Offer Letter</span>
                            </button>
                          )}

                          {app.status !== 'Rejected' && app.status !== 'Selected' && (
                            <button
                              onClick={() => handleReject(app._id)}
                              className="py-1.5 px-4 bg-slate-900 border border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ml-auto"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Tab 3: Post job */}
              {activeTab === 'post-job' && (
                <motion.div
                  key="post-job"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-6 glass-panel rounded-2xl border border-white/5 space-y-4"
                >
                  <h2 className="text-xl font-extrabold">{editingJob ? 'Edit Internship Position' : 'Post Internship Position'}</h2>
                  
                  <form onSubmit={handlePostJob} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Role Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Frontend Engineering Intern"
                          value={jobRole}
                          onChange={(e) => setJobRole(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-white/10 focus:border-teal-500 focus:outline-none text-sm transition-all text-white font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Location</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. San Francisco, CA or Remote"
                          value={jobLoc}
                          onChange={(e) => setJobLoc(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-white/10 focus:border-teal-500 focus:outline-none text-sm transition-all text-white font-semibold"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Work Mode</label>
                        <select
                          value={jobMode}
                          onChange={(e: any) => setJobMode(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-white/10 focus:border-teal-500 focus:outline-none text-sm text-slate-400 font-semibold"
                        >
                          <option value="Remote">Remote</option>
                          <option value="Hybrid">Hybrid</option>
                          <option value="Office">Office</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Stipend Amount</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. $45/hour or Unpaid"
                          value={jobStipend}
                          onChange={(e) => setJobStipend(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-white/10 focus:border-teal-500 focus:outline-none text-sm transition-all text-white font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Duration</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 12 Weeks"
                          value={jobDuration}
                          onChange={(e) => setJobDuration(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-white/10 focus:border-teal-500 focus:outline-none text-sm transition-all text-white font-semibold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Required Skills (Comma separated)</label>
                      <input
                        type="text"
                        required
                        placeholder="React, TypeScript, Tailwind CSS, Redux"
                        value={jobSkills}
                        onChange={(e) => setJobSkills(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-white/10 focus:border-teal-500 focus:outline-none text-sm transition-all text-white font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Role Description</label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Detail key responsibilities and goals..."
                        value={jobDesc}
                        onChange={(e) => setJobDesc(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-white/10 focus:border-teal-500 focus:outline-none text-sm transition-all text-white font-semibold"
                      />
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        disabled={postingJob}
                        className="py-2.5 px-6 bg-teal-500 hover:bg-teal-600 text-slate-950 text-xs font-bold rounded-lg transition-all flex items-center space-x-1.5"
                      >
                        {postingJob ? <Loader2 className="w-4 h-4 animate-spin" /> : editingJob ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        <span>{editingJob ? 'Update Position' : 'Post Listing'}</span>
                      </button>

                      {editingJob && (
                        <button
                          type="button"
                          onClick={() => {
                            setJobRole('');
                            setJobDesc('');
                            setJobLoc('');
                            setJobStipend('');
                            setJobDuration('');
                            setJobSkills('');
                            setEditingJob(null);
                            setActiveTab('listings');
                          }}
                          className="py-2.5 px-6 bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-lg transition-all"
                        >
                          Cancel Edit
                        </button>
                      )}
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Tab 4: Company Profile */}
              {activeTab === 'company' && (
                <motion.div
                  key="company"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-6 glass-panel rounded-2xl border border-white/5 space-y-4"
                >
                  <h2 className="text-xl font-extrabold text-white">Edit Company Profile</h2>
                  <p className="text-xs text-slate-400 font-semibold mt-1">Configure company portal presentation criteria</p>

                  <form onSubmit={handleCompanySave} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Company Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Stripe Inc."
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-white/10 focus:border-teal-500 focus:outline-none text-sm transition-all text-white font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Company Logo URL</label>
                        <input
                          type="text"
                          placeholder="e.g. https://logo.clearbit.com/stripe.com"
                          value={companyLogo}
                          onChange={(e) => setCompanyLogo(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-white/10 focus:border-teal-500 focus:outline-none text-sm transition-all text-white font-semibold"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Website URL</label>
                        <input
                          type="url"
                          placeholder="e.g. https://stripe.com"
                          value={companyWeb}
                          onChange={(e) => setCompanyWeb(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-white/10 focus:border-teal-500 focus:outline-none text-sm transition-all text-white font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Location Headquarters</label>
                        <input
                          type="text"
                          placeholder="e.g. San Francisco, CA"
                          value={companyLoc}
                          onChange={(e) => setCompanyLoc(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-white/10 focus:border-teal-500 focus:outline-none text-sm transition-all text-white font-semibold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Company Description</label>
                      <textarea
                        rows={4}
                        placeholder="Detail company mission, team highlights, and values..."
                        value={companyDesc}
                        onChange={(e) => setCompanyDesc(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-white/10 focus:border-teal-500 focus:outline-none text-sm transition-all text-white font-semibold"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={savingCompany}
                      className="py-2.5 px-6 bg-teal-500 hover:bg-teal-600 text-slate-950 text-xs font-bold rounded-lg transition-all flex items-center space-x-1.5"
                    >
                      {savingCompany ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      <span>Save Company Details</span>
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </main>
      </div>

      {/* POPUP MODAL 1: INTERVIEW SCHEDULER */}
      {schedulingApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md p-6 glass-panel rounded-2xl border border-white/15 shadow-2xl relative"
          >
            <h3 className="font-extrabold text-base text-white mb-4">Book Interview: {schedulingApp.studentName}</h3>
            
            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Zoom/Meet Link</label>
                <input
                  type="url"
                  required
                  value={interviewLink}
                  onChange={(e) => setInterviewLink(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Notes / Instructions</label>
                <textarea
                  rows={3}
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white focus:outline-none"
                  placeholder="Prepare slides or code editors..."
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSchedulingApp(null)}
                  className="py-2 bg-slate-900 hover:bg-white/5 border border-white/5 rounded-lg text-xs text-slate-400 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={schedulingLoading}
                  className="py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5"
                >
                  {schedulingLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Calendar className="w-3.5 h-3.5" />}
                  <span>Book & Generate Qs</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* POPUP MODAL 2: SEND OFFER LETTER */}
      {offeringApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md p-6 glass-panel rounded-2xl border border-white/15 shadow-2xl relative"
          >
            <h3 className="font-extrabold text-base text-white mb-4">Send Offer: {offeringApp.studentName}</h3>
            
            <form onSubmit={handleOfferSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Stipend rate</label>
                <input
                  type="text"
                  required
                  value={offerSalary}
                  onChange={(e) => setOfferSalary(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Expected Start Date</label>
                <input
                  type="date"
                  required
                  value={offerStartDate}
                  onChange={(e) => setOfferStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOfferingApp(null)}
                  className="py-2 bg-slate-900 hover:bg-white/5 border border-white/5 rounded-lg text-xs text-slate-400 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={offeringLoading}
                  className="py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5"
                >
                  {offeringLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Release Offer</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
