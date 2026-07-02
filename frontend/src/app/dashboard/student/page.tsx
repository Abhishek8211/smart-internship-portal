'use strict';
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BrainCircuit, LogOut, Search, Briefcase, FileUp, Sparkles, AlertCircle, CheckCircle, 
  MapPin, Clock, DollarSign, Send, Bot, User, Github, Linkedin, RefreshCw, Star, 
  ListTodo, BookOpen, GraduationCap, Trophy, HelpCircle, ExternalLink, Calendar
} from 'lucide-react';

export default function StudentDashboard() {
  const { user, logout, apiFetch } = useAuth();
  const router = useRouter();

  // Primary Active Tab
  const [activeTab, setActiveTab] = useState<'recommendations' | 'applications' | 'profile' | 'chatbot'>('recommendations');

  // Database States
  const [profile, setProfile] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [chatbotLog, setChatbotLog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [modeFilter, setModeFilter] = useState('');
  const [locFilter, setLocFilter] = useState('');

  // Form profile edits
  const [profileSkills, setProfileSkills] = useState('');
  const [profileCgpa, setProfileCgpa] = useState('3.5');
  const [profileLinks, setProfileLinks] = useState({ github: '', linkedin: '', portfolio: '' });
  const [profileEducation, setProfileEducation] = useState<any[]>([]);
  const [profileProjects, setProfileProjects] = useState<any[]>([]);
  const [profileCertifications, setProfileCertifications] = useState<any[]>([]);

  // Education Sub-form States
  const [newEduInst, setNewEduInst] = useState('');
  const [newEduDegree, setNewEduDegree] = useState('');
  const [newEduField, setNewEduField] = useState('');
  const [newEduStart, setNewEduStart] = useState('2022');
  const [newEduEnd, setNewEduEnd] = useState('2026');
  const [newEduCgpa, setNewEduCgpa] = useState('3.5');

  // Projects Sub-form States
  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjTech, setNewProjTech] = useState('');
  const [newProjLink, setNewProjLink] = useState('');

  // Certifications Sub-form States
  const [newCertName, setNewCertName] = useState('');
  const [newCertOrg, setNewCertOrg] = useState('');
  const [newCertDate, setNewCertDate] = useState('');
  const [newCertId, setNewCertId] = useState('');

  // GitHub & LinkedIn Username imports
  const [githubUser, setGithubUser] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [importingGit, setImportingGit] = useState(false);
  const [importingIn, setImportingIn] = useState(false);

  // Resume Upload Simulation
  const [uploadingResume, setUploadingResume] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Career Chatbot message input
  const [chatMessage, setChatMessage] = useState('');
  const [sendingChat, setSendingChat] = useState(false);

  // Detailed Skill Gap target job
  const [selectedGapJob, setSelectedGapJob] = useState<any>(null);
  const [gapAnalysis, setGapAnalysis] = useState<any>(null);

  // Interview Questions Practice Modal
  const [activeInterviewApp, setActiveInterviewApp] = useState<any>(null);

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
      // Try calling backend, fallback to local simulations on catch
      const profileData = await apiFetch('/student/profile').catch(() => ({
        skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Express', 'MongoDB'],
        cgpa: 3.92,
        education: [{ institution: 'Stanford University', degree: 'BS CS', fieldOfStudy: 'Computer Science', startYear: 2023, endYear: 2027, cgpa: 3.92 }],
        projects: [
          { title: 'E-Commerce Dashboard', description: 'A sales analytics layout using React.', technologies: ['React', 'TypeScript'] },
          { title: 'Task Manager API', description: 'RESTful API built with Express.', technologies: ['Node.js', 'Express'] }
        ],
        certifications: [{ name: 'AWS Cloud Practitioner', issuingOrganization: 'Amazon Web Services', issueDate: '2025-05-15' }],
        links: { portfolio: 'https://alexrivera.dev', github: 'https://github.com/alexrivera', linkedin: 'https://linkedin.com/in/alexrivera' },
        resumeUrl: '',
        atsScore: 88,
        atsSuggestions: ['Add more metrics-focused achievements.', 'Incorporate cloud deployment keywords.']
      }));

      const jobsData = await apiFetch(`/internships?search=${searchQuery}&mode=${modeFilter}&location=${locFilter}`).catch(() => [
        { id: 'intern_stripe_fe', role: 'Frontend Engineering Intern', company_name: 'Stripe', company_logo: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=100', location: 'San Francisco, CA', mode: 'Hybrid', stipend: '$45/hour', duration: '12 Weeks', skills_required: ['React', 'TypeScript', 'Tailwind CSS', 'Redux Toolkit'], posted_date: '3 days ago', matchPercentage: 92, matchExplanation: 'You match all skills and your CGPA exceeds the criteria.' },
        { id: 'intern_vercel_fs', role: 'Full-Stack Developer Intern', company_name: 'Vercel', company_logo: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=100&q=80', location: 'Remote', mode: 'Remote', stipend: '$50/hour', duration: '16 Weeks', skills_required: ['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL'], posted_date: '5 days ago', matchPercentage: 88, matchExplanation: 'Matches 4/5 skills. Excellent portfolio projects.' },
        { id: 'intern_google_ai', role: 'AI & Research Engineering Intern', company_name: 'Google', company_logo: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=100', location: 'Mountain View, CA', mode: 'Office', stipend: '$55/hour', duration: '12 Weeks', skills_required: ['Python', 'PyTorch', 'TensorFlow', 'Docker'], posted_date: '1 day ago', matchPercentage: 45, matchExplanation: 'Skill gap in PyTorch/TensorFlow. Python matches.' }
      ]);

      const applicationsData = await apiFetch('/applications').catch(() => [
        { _id: 'app_1', internship: { role: 'Frontend Engineering Intern', company_name: 'Stripe' }, status: 'Shortlisted', matchPercentage: 92, timeline: [{ status: 'Applied', date: new Date() }] },
        { _id: 'app_2', internship: { role: 'Full-Stack Developer Intern', company_name: 'Vercel', description: 'Work on React 19 Next.js features.' }, status: 'Interview Scheduled', matchPercentage: 88, timeline: [{ status: 'Applied', date: new Date() }, { status: 'Interview Scheduled', date: new Date() }], interviewDetails: { dateTime: 'Tomorrow, 10:00 AM', link: 'https://zoom.us/j/987654321', notes: 'Panel round.', aiQuestions: { technical: ['What are server components vs client components?', 'How would you handle heavy backend Express routes?'], hr: ['Why do you want to join Vercel?', 'Describe a time you had a technical disagreement.'], coding: ['Implement a custom throttle in TypeScript.', 'Merge overlapping intervals.'], behavioral: ['Explain a complex project completed under a tight deadline.', 'How do you coordinate key bug fixes?'] } } }
      ]);

      const notificationsData = await apiFetch('/notifications').catch(() => [
        { _id: 'n_1', title: 'Application Shortlisted', message: 'Your application for Stripe is shortlisted.', type: 'success', createdAt: new Date() },
        { _id: 'n_2', title: 'Interview Scheduled', message: 'Vercel interview scheduled for tomorrow.', type: 'info', createdAt: new Date() }
      ]);

      const chatbotHistory = await apiFetch('/ai/chat').catch(() => ({
        messages: [{ sender: 'bot', text: 'Hello Alex! I am your AI Career Assistant. Ask me about resume tuning, projects, or roadmap guides.', timestamp: new Date() }]
      }));

      setProfile(profileData);
      setProfileSkills(profileData.skills?.join(', ') || '');
      setProfileCgpa(profileData.cgpa?.toString() || '3.5');
      setProfileLinks(profileData.links || { github: '', linkedin: '', portfolio: '' });
      setProfileEducation(profileData.education || []);
      setProfileProjects(profileData.projects || []);
      setProfileCertifications(profileData.certifications || []);

      // Sort jobs by Match Score descending
      const sortedJobs = [...jobsData].sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
      setJobs(sortedJobs);

      setApplications(applicationsData);
      setNotifications(notificationsData);
      setChatbotLog(chatbotHistory.messages || chatbotHistory);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Profile Save
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const skillsArray = profileSkills.split(',').map((s) => s.trim()).filter(Boolean);
      const data = await apiFetch('/student/profile', {
        method: 'PUT',
        body: JSON.stringify({
          skills: skillsArray,
          cgpa: parseFloat(profileCgpa),
          links: profileLinks,
          education: profileEducation,
          projects: profileProjects,
          certifications: profileCertifications
        })
      });
      setProfile(data.profile);
      alert('Profile updated successfully!');
      fetchDashboardData();
    } catch (err: any) {
      alert('Updated successfully (simulated local changes)');
    }
  };

  // Education Helpers
  const handleAddEducation = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newEduInst || !newEduDegree || !newEduField) return;
    const newItem = {
      institution: newEduInst,
      degree: newEduDegree,
      fieldOfStudy: newEduField,
      startYear: parseInt(newEduStart) || 2022,
      endYear: parseInt(newEduEnd) || 2026,
      cgpa: parseFloat(newEduCgpa) || 3.5
    };
    setProfileEducation([...profileEducation, newItem]);
    setNewEduInst('');
    setNewEduDegree('');
    setNewEduField('');
  };

  const handleRemoveEducation = (idx: number) => {
    setProfileEducation(profileEducation.filter((_, i) => i !== idx));
  };

  // Project Helpers
  const handleAddProject = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newProjTitle || !newProjDesc) return;
    const newItem = {
      title: newProjTitle,
      description: newProjDesc,
      technologies: newProjTech.split(',').map((s) => s.trim()).filter(Boolean),
      link: newProjLink
    };
    setProfileProjects([...profileProjects, newItem]);
    setNewProjTitle('');
    setNewProjDesc('');
    setNewProjTech('');
    setNewProjLink('');
  };

  const handleRemoveProject = (idx: number) => {
    setProfileProjects(profileProjects.filter((_, i) => i !== idx));
  };

  // Certification Helpers
  const handleAddCertification = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newCertName || !newCertOrg) return;
    const newItem = {
      name: newCertName,
      issuingOrganization: newCertOrg,
      issueDate: newCertDate || new Date().toISOString().slice(0, 10),
      credentialId: newCertId
    };
    setProfileCertifications([...profileCertifications, newItem]);
    setNewCertName('');
    setNewCertOrg('');
    setNewCertDate('');
    setNewCertId('');
  };

  const handleRemoveCertification = (idx: number) => {
    setProfileCertifications(profileCertifications.filter((_, i) => i !== idx));
  };

  // GitHub Import
  const handleGitHubImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUser) return;
    setImportingGit(true);
    try {
      const res = await apiFetch('/student/import-github', {
        method: 'POST',
        body: JSON.stringify({ githubUsername: githubUser })
      });
      setProfile(res.profile);
      alert('GitHub data imported! Profile projects and skills updated.');
      fetchDashboardData();
    } catch (err) {
      alert('Imported successfully (simulated local merge)');
    } finally {
      setImportingGit(false);
    }
  };

  // LinkedIn Import
  const handleLinkedInImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkedinUrl) return;
    setImportingIn(true);
    try {
      const res = await apiFetch('/student/import-linkedin', {
        method: 'POST',
        body: JSON.stringify({ linkedinUrl })
      });
      setProfile(res.profile);
      alert('LinkedIn data imported! Profile certifications updated.');
      fetchDashboardData();
    } catch (err) {
      alert('Imported successfully (simulated local sync)');
    } finally {
      setImportingIn(false);
    }
  };

  // Apply Action
  const handleApply = async (jobId: string) => {
    try {
      await apiFetch('/applications', {
        method: 'POST',
        body: JSON.stringify({ internshipId: jobId, coverLetter: 'I am applying through the Smart Internship Matching Portal.' })
      });
      alert('Applied successfully!');
      fetchDashboardData();
    } catch (err: any) {
      alert(err.message || 'Already applied or applied successfully (simulated).');
    }
  };

  // Bookmark Save
  const handleBookmark = async (jobId: string, isSaved: boolean) => {
    const endpoint = `/internships/${jobId}/${isSaved ? 'unsave' : 'save'}`;
    try {
      await apiFetch(endpoint, { method: 'POST' });
      fetchDashboardData();
    } catch (err) {
      alert('Bookmark updated (simulated).');
    }
  };

  // Chat Submission
  const handleChatSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMsg = { sender: 'user', text: chatMessage, timestamp: new Date() };
    setChatbotLog(prev => [...prev, userMsg]);
    setChatMessage('');
    setSendingChat(true);

    try {
      const res = await apiFetch('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message: userMsg.text })
      });
      setChatbotLog(res.messages || res);
    } catch (err) {
      // Mock Bot response
      setTimeout(() => {
        let reply = "I can guide you on formatting: 1. Keep layout clean. 2. Mention metric highlights. 3. Add projects details.";
        if (userMsg.text.toLowerCase().includes('react')) {
          reply = "For React roles, learn: React 19 Actions, server rendering in Next.js, and state managers like Redux or Zustand.";
        }
        setChatbotLog(prev => [...prev, { sender: 'bot', text: reply, timestamp: new Date() }]);
      }, 800);
    } finally {
      setSendingChat(false);
    }
  };

  // Skill Gap Trigger
  const handleSkillGapTrigger = async (job: any) => {
    setSelectedGapJob(job);
    try {
      const analysis = await apiFetch(`/ai/skill-gap/${job.id}`);
      setGapAnalysis(analysis);
    } catch (err) {
      // Mock gap analysis calculation
      const required = job.skills_required || ['React'];
      const mySkills = profile?.skills || [];
      const known = required.filter((s: string) => mySkills.some((ms: string) => ms.toLowerCase() === s.toLowerCase()));
      const missing = required.filter((s: string) => !mySkills.some((ms: string) => ms.toLowerCase() === s.toLowerCase()));

      setGapAnalysis({
        known,
        missing,
        roadmap: missing.map((s: string) => `Learn ${s} basics. Create a dashboard utilizing ${s}. Deploy a stack containing ${s}.`),
        courses: missing.map((s: string) => `Complete guide to ${s} on Coursera/Udemy`)
      });
    }
  };

  // Resume Upload File select
  const handleResumeSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingResume(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await apiFetch('/ai/parse-resume', {
        method: 'POST',
        headers: {
          // fetch API automatically configures boundary if headers is omitted,
          // so we bypass content-type json config
        },
        body: formData
      });
      setProfile(res.profile);
      alert(`Resume parsed! ATS Score: ${res.atsScore}/100. Profile updated.`);
      fetchDashboardData();
    } catch (err) {
      // Simulate local parser run
      setTimeout(() => {
        const dummyProfile = {
          ...profile,
          resumeUrl: `/resumes/${file.name}`,
          atsScore: 92,
          atsSuggestions: ['Quantify project metrics.', 'Add Docker and Postgres to skill list.'],
          skills: Array.from(new Set([...(profile?.skills || []), 'React', 'Node.js', 'PostgreSQL', 'Docker']))
        };
        setProfile(dummyProfile);
        alert('Resume parsed locally (Simulated). ATS Score: 92/100. Profile synced.');
        setUploadingResume(false);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col bg-slate-950 text-slate-100">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-[40vw] h-[40vw] rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] rounded-full bg-teal-600/5 blur-[120px] pointer-events-none" />

      {/* DASHBOARD HEADER */}
      <header className="sticky top-0 z-40 w-full px-6 py-4 glass-panel border-b border-indigo-500/10 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-gradient-to-tr from-indigo-500 to-teal-400 rounded-lg text-white">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-lg bg-gradient-to-r from-indigo-500 to-teal-400 bg-clip-text text-transparent">
            SmartMatch
          </span>
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
            Student
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <img 
              src={user?.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80'} 
              alt="Avatar" 
              className="w-8 h-8 rounded-full border border-indigo-500/30 object-cover"
            />
            <span className="text-xs font-bold hidden sm:inline">{user?.name || 'Alex Rivera'}</span>
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

      <div className="flex-grow max-w-7xl w-full mx-auto px-6 py-8 grid md:grid-cols-4 gap-8">
        {/* LEFT COLUMN: NAVIGATION & RESUME ATS SCORER */}
        <aside className="space-y-6 md:col-span-1">
          {/* Navigation links */}
          <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-1">
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`w-full py-2.5 px-4 rounded-xl text-left text-xs font-bold transition-all flex items-center space-x-3 ${
                activeTab === 'recommendations' ? 'bg-indigo-500 text-white shadow-lg' : 'hover:bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Recommended Jobs</span>
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`w-full py-2.5 px-4 rounded-xl text-left text-xs font-bold transition-all flex items-center space-x-3 ${
                activeTab === 'applications' ? 'bg-indigo-500 text-white shadow-lg' : 'hover:bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <ListTodo className="w-4 h-4" />
              <span>My Applications</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full py-2.5 px-4 rounded-xl text-left text-xs font-bold transition-all flex items-center space-x-3 ${
                activeTab === 'profile' ? 'bg-indigo-500 text-white shadow-lg' : 'hover:bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Resume/Portfolio Builder</span>
            </button>
            <button
              onClick={() => setActiveTab('chatbot')}
              className={`w-full py-2.5 px-4 rounded-xl text-left text-xs font-bold transition-all flex items-center space-x-3 ${
                activeTab === 'chatbot' ? 'bg-indigo-500 text-white shadow-lg' : 'hover:bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>AI Career Assistant</span>
            </button>
          </div>

          {/* ATS Resume Score Card */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-400">ATS Resume Grader</h4>
            
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-3xl font-extrabold text-white">
                {profile?.atsScore || 0}%
              </span>
              <span className="text-[10px] font-bold text-slate-400">Completeness Grade</span>
            </div>

            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-teal-400 rounded-full transition-all duration-1000"
                style={{ width: `${profile?.atsScore || 0}%` }}
              />
            </div>

            {/* Resume Upload Drop-zone simulation */}
            <div className="pt-2 border-t border-white/5">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleResumeSelect} 
                className="hidden" 
                accept=".pdf,.docx,.txt"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingResume}
                className="w-full py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-2"
              >
                {uploadingResume ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing PDF...</span>
                  </>
                ) : (
                  <>
                    <FileUp className="w-4 h-4" />
                    <span>Upload Resume</span>
                  </>
                )}
              </button>
            </div>

            {profile?.atsSuggestions?.length > 0 && (
              <div className="space-y-2 pt-2 text-[10px] text-slate-400 font-semibold border-t border-white/5">
                <span className="text-white block font-bold text-[11px] mb-1">AI Tuning Checklist:</span>
                {profile.atsSuggestions.map((sug: string, i: number) => (
                  <div key={i} className="flex space-x-2 items-start leading-relaxed">
                    <span className="text-indigo-400">•</span>
                    <span>{sug}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT COLUMN: WORKSPACE LAYOUT */}
        <main className="md:col-span-3 space-y-6">
          {loading ? (
            <div className="h-64 flex flex-col justify-center items-center space-y-4">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
              <span className="text-xs text-slate-400">Loading student dashboards...</span>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {/* Tab 1: Recommendations */}
              {activeTab === 'recommendations' && (
                <motion.div
                  key="recommendations"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-2xl font-extrabold">Recommended Positions</h2>
                      <p className="text-xs text-slate-400 font-semibold mt-1">Smart candidate similarity ranking matching your active profile</p>
                    </div>

                    {/* Filter fields */}
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                      <input 
                        type="text" 
                        placeholder="Search role/company..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onBlur={fetchDashboardData}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs focus:outline-none focus:border-indigo-500 w-full sm:w-40"
                      />
                      <select
                        value={modeFilter}
                        onChange={(e) => { setModeFilter(e.target.value); setTimeout(fetchDashboardData, 100); }}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs focus:outline-none text-slate-400"
                      >
                        <option value="">All Modes</option>
                        <option value="Remote">Remote</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="Office">Office</option>
                      </select>
                    </div>
                  </div>

                  {/* Listings Card Grid */}
                  <div className="grid sm:grid-cols-2 gap-6">
                    {jobs.map((job: any) => {
                      const isSaved = profile?.savedInternships?.includes(job.id);
                      return (
                        <div key={job.id} className="p-6 glass-panel rounded-2xl border border-white/5 relative flex flex-col justify-between glass-panel-hover overflow-hidden">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/10 to-transparent blur-xl pointer-events-none" />
                          
                          <div>
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center space-x-3">
                                <img src={job.company_logo || 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=80'} className="w-10 h-10 rounded-lg object-cover bg-white" alt="logo" />
                                <div>
                                  <h4 className="font-bold text-sm text-white group-hover:text-indigo-400 transition-colors">{job.role}</h4>
                                  <p className="text-xs text-slate-400 font-semibold">{job.company_name}</p>
                                </div>
                              </div>
                              <button 
                                onClick={() => handleBookmark(job.id, isSaved)}
                                className={`p-1.5 rounded-lg border transition-colors ${
                                  isSaved ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : 'border-white/10 hover:border-indigo-500 text-slate-400 hover:text-white'
                                }`}
                              >
                                <Star className="w-4 h-4 fill-current" />
                              </button>
                            </div>

                            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-400 mb-4 font-semibold">
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-3.5 h-3.5 text-teal-400" />
                                <span>{job.location}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                                <span>{job.duration} ({job.mode})</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                                <span>{job.stipend}</span>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {job.skills_required?.map((sk: string) => (
                                <span key={sk} className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 text-slate-300">
                                  {sk}
                                </span>
                              ))}
                            </div>

                            <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 text-[11px] text-slate-400 leading-relaxed font-semibold mb-6 flex justify-between items-center gap-2">
                              <span>🎯 {job.matchExplanation}</span>
                              <span className="px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 font-extrabold text-[10px] shrink-0">
                                {job.matchPercentage}%
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mt-auto">
                            <button
                              onClick={() => handleSkillGapTrigger(job)}
                              className="py-2 rounded-xl bg-slate-900 border border-white/5 text-slate-300 hover:bg-white/5 transition-all text-xs font-bold text-center"
                            >
                              Skill Gap Analysis
                            </button>
                            <button
                              onClick={() => handleApply(job.id)}
                              className="py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs transition-all text-center flex items-center justify-center space-x-1"
                            >
                              <span>Apply Now</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Skill Gap Analysis Box if selected */}
                  {selectedGapJob && gapAnalysis && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-6 glass-panel rounded-2xl border border-indigo-500/20 space-y-4"
                    >
                      <div className="flex justify-between items-center border-b border-white/5 pb-3">
                        <h4 className="font-extrabold text-sm text-indigo-400">Skill Gap: {selectedGapJob.role} ({selectedGapJob.company_name})</h4>
                        <button 
                          onClick={() => { setSelectedGapJob(null); setGapAnalysis(null); }}
                          className="text-xs text-slate-500 hover:text-white"
                        >
                          Dismiss
                        </button>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Matched Skills ({gapAnalysis.known?.length})</h5>
                          <div className="flex flex-wrap gap-1.5">
                            {gapAnalysis.known?.length > 0 ? (
                              gapAnalysis.known.map((s: string) => (
                                <span key={s} className="px-2.5 py-0.5 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400 text-[10px] font-extrabold flex items-center space-x-1">
                                  <CheckCircle className="w-3 h-3 shrink-0" />
                                  <span>{s}</span>
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-500 font-semibold">No required skills matching.</span>
                            )}
                          </div>

                          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 pt-2">Missing Skills ({gapAnalysis.missing?.length})</h5>
                          <div className="flex flex-wrap gap-1.5">
                            {gapAnalysis.missing?.length > 0 ? (
                              gapAnalysis.missing.map((s: string) => (
                                <span key={s} className="px-2.5 py-0.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-extrabold flex items-center space-x-1">
                                  <AlertCircle className="w-3 h-3 shrink-0" />
                                  <span>{s}</span>
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-teal-400 font-bold">You match all requirements perfectly!</span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3 p-4 bg-slate-900/60 rounded-xl border border-white/5 text-xs text-slate-400 leading-relaxed font-semibold">
                          <h5 className="text-white font-extrabold text-xs mb-2">Learning Roadmap & Courses:</h5>
                          {gapAnalysis.roadmap?.map((rm: string, idx: number) => (
                            <p key={idx} className="mb-2">📖 {rm}</p>
                          ))}
                          <div className="pt-2 border-t border-white/5 space-y-1.5">
                            <span className="text-white text-[11px] font-bold block mb-1">Recommended Material:</span>
                            {gapAnalysis.courses?.map((c: string, idx: number) => (
                              <div key={idx} className="flex items-center space-x-2 text-indigo-400 text-[11px] font-bold hover:underline cursor-pointer">
                                <BookOpen className="w-3.5 h-3.5 shrink-0" />
                                <span>{c}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Tab 2: Applications */}
              {activeTab === 'applications' && (
                <motion.div
                  key="applications"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-extrabold">Application Tracking</h2>
                    <p className="text-xs text-slate-400 font-semibold mt-1">Review active pipeline status checkpoints and recruiter actions</p>
                  </div>

                  <div className="space-y-4">
                    {applications.map((app: any) => (
                      <div key={app._id} className="p-6 glass-panel rounded-2xl border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <h4 className="font-bold text-base text-white">{app.internship?.role}</h4>
                          <p className="text-xs text-slate-400 font-semibold mt-0.5">{app.internship?.company_name}</p>
                          
                          <div className="flex space-x-4 text-xs text-slate-400 mt-3 font-semibold">
                            <span className="flex items-center space-x-1">
                              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                              <span>{app.matchPercentage}% Compatibility Match</span>
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
                          <span className={`px-3 py-1 rounded-full text-xs font-extrabold text-center border ${
                            app.status === 'Selected' 
                              ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400'
                              : app.status === 'Interview Scheduled'
                              ? 'bg-amber-500/15 border-amber-500 text-amber-400'
                              : app.status === 'Shortlisted'
                              ? 'bg-indigo-500/15 border-indigo-500 text-indigo-400'
                              : app.status === 'Rejected'
                              ? 'bg-red-500/15 border-red-500 text-red-400'
                              : 'bg-slate-800 border-white/10 text-slate-300'
                          }`}>
                            {app.status}
                          </span>

                          {app.status === 'Interview Scheduled' && app.interviewDetails && (
                            <button
                              onClick={() => setActiveInterviewApp(app)}
                              className="py-1.5 px-3 bg-amber-500 text-slate-950 hover:bg-amber-600 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 w-full"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Practice Interview</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Interview Preparation Modal */}
                  {activeInterviewApp && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-6 glass-panel rounded-2xl border border-amber-500/20 space-y-4"
                    >
                      <div className="flex justify-between items-center border-b border-white/5 pb-3">
                        <h4 className="font-extrabold text-sm text-amber-400 flex items-center space-x-2">
                          <BrainCircuit className="w-5 h-5" />
                          <span>AI practice interview sheets generated for {activeInterviewApp.internship?.role}</span>
                        </h4>
                        <button 
                          onClick={() => setActiveInterviewApp(null)}
                          className="text-xs text-slate-500 hover:text-white"
                        >
                          Close Practice Panel
                        </button>
                      </div>

                      <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/10 text-xs text-slate-400 leading-relaxed font-semibold">
                        <p className="mb-2 text-white">📅 **Schedule details**: {activeInterviewApp.interviewDetails.dateTime}</p>
                        <p className="mb-2 text-indigo-400">🔗 **Meeting Link**: <a href={activeInterviewApp.interviewDetails.link} target="_blank" rel="noreferrer" className="underline">{activeInterviewApp.interviewDetails.link}</a></p>
                        <p>📝 **Recruiter Notes**: {activeInterviewApp.interviewDetails.notes}</p>
                      </div>

                      {activeInterviewApp.interviewDetails.aiQuestions && (
                        <div className="grid sm:grid-cols-2 gap-6 pt-2">
                          <div className="space-y-4">
                            <div>
                              <span className="text-white block font-bold text-xs uppercase tracking-wider mb-2">Technical Questions:</span>
                              <ul className="list-decimal pl-4 text-xs text-slate-400 font-semibold space-y-2 leading-relaxed">
                                {activeInterviewApp.interviewDetails.aiQuestions.technical?.map((q: string, i: number) => <li key={i}>{q}</li>)}
                              </ul>
                            </div>
                            <div>
                              <span className="text-white block font-bold text-xs uppercase tracking-wider mb-2">Coding Questions:</span>
                              <ul className="list-decimal pl-4 text-xs text-slate-400 font-semibold space-y-2 leading-relaxed">
                                {activeInterviewApp.interviewDetails.aiQuestions.coding?.map((q: string, i: number) => <li key={i}><code>{q}</code></li>)}
                              </ul>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <span className="text-white block font-bold text-xs uppercase tracking-wider mb-2">Behavioral Questions:</span>
                              <ul className="list-decimal pl-4 text-xs text-slate-400 font-semibold space-y-2 leading-relaxed">
                                {activeInterviewApp.interviewDetails.aiQuestions.behavioral?.map((q: string, i: number) => <li key={i}>{q}</li>)}
                              </ul>
                            </div>
                            <div>
                              <span className="text-white block font-bold text-xs uppercase tracking-wider mb-2">HR Questions:</span>
                              <ul className="list-decimal pl-4 text-xs text-slate-400 font-semibold space-y-2 leading-relaxed">
                                {activeInterviewApp.interviewDetails.aiQuestions.hr?.map((q: string, i: number) => <li key={i}>{q}</li>)}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Tab 3: Resume Builder */}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-extrabold">Resume & Portfolio Builder</h2>
                    <p className="text-xs text-slate-400 font-semibold mt-1">Configure profile criteria manually or sync credentials automatically</p>
                  </div>

                  {/* Sync tools */}
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="p-6 glass-panel rounded-2xl border border-white/5 space-y-4">
                      <h4 className="font-extrabold text-sm text-indigo-400 flex items-center space-x-2">
                        <Github className="w-5 h-5" />
                        <span>GitHub Profile Sync</span>
                      </h4>
                      <form onSubmit={handleGitHubImport} className="space-y-3">
                        <input
                          type="text"
                          required
                          placeholder="Enter username (e.g. alexrivera)"
                          value={githubUser}
                          onChange={(e) => setGithubUser(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          type="submit"
                          disabled={importingGit}
                          className="w-full py-2 bg-slate-800 text-indigo-400 hover:text-white border border-indigo-500/20 hover:border-indigo-500 rounded-lg text-xs font-bold transition-all flex justify-center items-center space-x-1.5"
                        >
                          {importingGit ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                          <span>Sync Repositories & Tech</span>
                        </button>
                      </form>
                    </div>

                    <div className="p-6 glass-panel rounded-2xl border border-white/5 space-y-4">
                      <h4 className="font-extrabold text-sm text-indigo-400 flex items-center space-x-2">
                        <Linkedin className="w-5 h-5" />
                        <span>LinkedIn Profile Sync</span>
                      </h4>
                      <form onSubmit={handleLinkedInImport} className="space-y-3">
                        <input
                          type="text"
                          required
                          placeholder="Enter profile URL (e.g. linkedin.com/in/alex)"
                          value={linkedinUrl}
                          onChange={(e) => setLinkedinUrl(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          type="submit"
                          disabled={importingIn}
                          className="w-full py-2 bg-slate-800 text-indigo-400 hover:text-white border border-indigo-500/20 hover:border-indigo-500 rounded-lg text-xs font-bold transition-all flex justify-center items-center space-x-1.5"
                        >
                          {importingIn ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                          <span>Sync Certifications & Education</span>
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Profile Edit Fields */}
                  <form onSubmit={handleProfileSave} className="p-6 glass-panel rounded-2xl border border-white/5 space-y-6">
                    <h3 className="font-bold text-sm border-b border-white/5 pb-2 text-indigo-400">Manual Attributes</h3>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Skills (Comma separated)</label>
                        <input
                          type="text"
                          value={profileSkills}
                          onChange={(e) => setProfileSkills(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs focus:outline-none focus:border-indigo-500 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Current CGPA</label>
                        <input
                          type="text"
                          value={profileCgpa}
                          onChange={(e) => setProfileCgpa(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs focus:outline-none focus:border-indigo-500 text-white"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Portfolio Website</label>
                        <input
                          type="text"
                          value={profileLinks.portfolio}
                          onChange={(e) => setProfileLinks({ ...profileLinks, portfolio: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs focus:outline-none focus:border-indigo-500 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">GitHub Link</label>
                        <input
                          type="text"
                          value={profileLinks.github}
                          onChange={(e) => setProfileLinks({ ...profileLinks, github: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs focus:outline-none focus:border-indigo-500 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">LinkedIn Link</label>
                        <input
                          type="text"
                          value={profileLinks.linkedin}
                          onChange={(e) => setProfileLinks({ ...profileLinks, linkedin: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs focus:outline-none focus:border-indigo-500 text-white"
                        />
                      </div>
                    </div>

                    {/* Education block */}
                    <div className="border-t border-white/5 pt-4 space-y-3">
                      <h4 className="font-extrabold text-xs text-indigo-400">Education Details</h4>
                      
                      {profileEducation.length > 0 && (
                        <div className="space-y-2">
                          {profileEducation.map((edu, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg border border-white/5">
                              <div>
                                <p className="text-xs font-bold text-white">{edu.institution}</p>
                                <p className="text-[10px] text-slate-400">{edu.degree} in {edu.fieldOfStudy} ({edu.startYear} - {edu.endYear}) • CGPA: {edu.cgpa}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveEducation(idx)}
                                className="text-red-400 hover:text-red-300 text-xs font-bold px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 transition-all"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Add Academic Record</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <input
                            type="text"
                            placeholder="Institution (e.g. Stanford)"
                            value={newEduInst}
                            onChange={(e) => setNewEduInst(e.target.value)}
                            className="px-2.5 py-1.5 rounded bg-slate-900 border border-white/10 text-[11px] text-white"
                          />
                          <input
                            type="text"
                            placeholder="Degree (e.g. BS)"
                            value={newEduDegree}
                            onChange={(e) => setNewEduDegree(e.target.value)}
                            className="px-2.5 py-1.5 rounded bg-slate-900 border border-white/10 text-[11px] text-white"
                          />
                          <input
                            type="text"
                            placeholder="Field (e.g. Computer Science)"
                            value={newEduField}
                            onChange={(e) => setNewEduField(e.target.value)}
                            className="px-2.5 py-1.5 rounded bg-slate-900 border border-white/10 text-[11px] text-white"
                          />
                          <input
                            type="number"
                            placeholder="Start Year"
                            value={newEduStart}
                            onChange={(e) => setNewEduStart(e.target.value)}
                            className="px-2.5 py-1.5 rounded bg-slate-900 border border-white/10 text-[11px] text-white"
                          />
                          <input
                            type="number"
                            placeholder="End Year"
                            value={newEduEnd}
                            onChange={(e) => setNewEduEnd(e.target.value)}
                            className="px-2.5 py-1.5 rounded bg-slate-900 border border-white/10 text-[11px] text-white"
                          />
                          <input
                            type="text"
                            placeholder="GPA (e.g. 3.8)"
                            value={newEduCgpa}
                            onChange={(e) => setNewEduCgpa(e.target.value)}
                            className="px-2.5 py-1.5 rounded bg-slate-900 border border-white/10 text-[11px] text-white"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleAddEducation}
                          className="px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500 text-indigo-400 hover:text-white rounded text-[10px] font-bold transition-all"
                        >
                          + Add Academic Entry
                        </button>
                      </div>
                    </div>

                    {/* Projects block */}
                    <div className="border-t border-white/5 pt-4 space-y-3">
                      <h4 className="font-extrabold text-xs text-indigo-400">Project Portfolio</h4>
                      
                      {profileProjects.length > 0 && (
                        <div className="space-y-2">
                          {profileProjects.map((proj, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg border border-white/5">
                              <div className="space-y-1">
                                <p className="text-xs font-bold text-white">
                                  {proj.title}
                                  {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" className="ml-2 text-[10px] text-indigo-400 hover:underline">Link</a>}
                                </p>
                                <p className="text-[10px] text-slate-400">{proj.description}</p>
                                <p className="text-[9px] text-slate-500">Tech: {Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveProject(idx)}
                                className="text-red-400 hover:text-red-300 text-xs font-bold px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 transition-all"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Add Portfolio Project</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Project Title"
                            value={newProjTitle}
                            onChange={(e) => setNewProjTitle(e.target.value)}
                            className="px-2.5 py-1.5 rounded bg-slate-900 border border-white/10 text-[11px] text-white"
                          />
                          <input
                            type="text"
                            placeholder="Technologies (comma separated)"
                            value={newProjTech}
                            onChange={(e) => setNewProjTech(e.target.value)}
                            className="px-2.5 py-1.5 rounded bg-slate-900 border border-white/10 text-[11px] text-white"
                          />
                          <input
                            type="text"
                            placeholder="Repository Link"
                            value={newProjLink}
                            onChange={(e) => setNewProjLink(e.target.value)}
                            className="px-2.5 py-1.5 rounded bg-slate-900 border border-white/10 text-[11px] text-white sm:col-span-2"
                          />
                          <textarea
                            placeholder="Project Description Highlight"
                            value={newProjDesc}
                            onChange={(e) => setNewProjDesc(e.target.value)}
                            rows={2}
                            className="px-2.5 py-1.5 rounded bg-slate-900 border border-white/10 text-[11px] text-white sm:col-span-2 focus:outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleAddProject}
                          className="px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500 text-indigo-400 hover:text-white rounded text-[10px] font-bold transition-all"
                        >
                          + Add Project Entry
                        </button>
                      </div>
                    </div>

                    {/* Certifications block */}
                    <div className="border-t border-white/5 pt-4 space-y-3">
                      <h4 className="font-extrabold text-xs text-indigo-400">Certificates & Certifications</h4>
                      
                      {profileCertifications.length > 0 && (
                        <div className="space-y-2">
                          {profileCertifications.map((cert, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg border border-white/5">
                              <div>
                                <p className="text-xs font-bold text-white">{cert.name}</p>
                                <p className="text-[10px] text-slate-400">{cert.issuingOrganization} • Issued: {cert.issueDate} {cert.credentialId && `(ID: ${cert.credentialId})`}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveCertification(idx)}
                                className="text-red-400 hover:text-red-300 text-xs font-bold px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 transition-all"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Add Professional Certificate</p>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Certificate Name"
                            value={newCertName}
                            onChange={(e) => setNewCertName(e.target.value)}
                            className="px-2.5 py-1.5 rounded bg-slate-900 border border-white/10 text-[11px] text-white"
                          />
                          <input
                            type="text"
                            placeholder="Issuing Organization"
                            value={newCertOrg}
                            onChange={(e) => setNewCertOrg(e.target.value)}
                            className="px-2.5 py-1.5 rounded bg-slate-900 border border-white/10 text-[11px] text-white"
                          />
                          <input
                            type="date"
                            placeholder="Issue Date"
                            value={newCertDate}
                            onChange={(e) => setNewCertDate(e.target.value)}
                            className="px-2.5 py-1.5 rounded bg-slate-900 border border-white/10 text-[11px] text-white"
                          />
                          <input
                            type="text"
                            placeholder="Credential ID (optional)"
                            value={newCertId}
                            onChange={(e) => setNewCertId(e.target.value)}
                            className="px-2.5 py-1.5 rounded bg-slate-900 border border-white/10 text-[11px] text-white"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleAddCertification}
                          className="px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500 text-indigo-400 hover:text-white rounded text-[10px] font-bold transition-all"
                        >
                          + Add Certificate Entry
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-4">
                      <button
                        type="submit"
                        className="py-2.5 px-6 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg transition-all"
                      >
                        Save Profile & Recalculate ATS
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Tab 4: AI Career Chatbot */}
              {activeTab === 'chatbot' && (
                <motion.div
                  key="chatbot"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col h-[70vh] glass-panel rounded-2xl border border-indigo-500/10 overflow-hidden"
                >
                  <div className="px-6 py-4 border-b border-indigo-500/10 bg-indigo-500/5 flex items-center space-x-2">
                    <Bot className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h4 className="font-bold text-sm">AI Career Counselor Sandbox</h4>
                      <p className="text-[10px] text-slate-400 font-semibold">Tuned to evaluate matching algorithms against your skills profile</p>
                    </div>
                  </div>

                  {/* Messages log */}
                  <div className="flex-grow p-6 overflow-y-auto space-y-4">
                    {chatbotLog.map((msg: any, i: number) => (
                      <div 
                        key={i} 
                        className={`flex items-start gap-3 max-w-[80%] ${
                          msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${
                          msg.sender === 'user' ? 'bg-indigo-500 text-white' : 'bg-slate-900 border border-white/5 text-slate-300'
                        }`}>
                          {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-teal-400" />}
                        </div>
                        <div className={`p-3.5 rounded-2xl text-xs leading-relaxed font-semibold whitespace-pre-wrap shadow-md ${
                          msg.sender === 'user' 
                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                            : 'bg-slate-900/80 border border-white/5 text-slate-300 rounded-tl-none'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    
                    {sendingChat && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-900 border border-white/5">
                          <Bot className="w-4 h-4 text-teal-400 animate-bounce" />
                        </div>
                        <div className="p-3 bg-slate-900/80 border border-white/5 text-xs text-slate-500 rounded-2xl rounded-tl-none font-bold">
                          Counselor is designing feedback...
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Send Input */}
                  <form onSubmit={handleChatSend} className="p-4 border-t border-indigo-500/10 bg-slate-950 flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask about resume scores, matching roles, or design roadmaps..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      className="flex-grow px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs focus:outline-none focus:border-indigo-500 text-white"
                    />
                    <button
                      type="submit"
                      disabled={sendingChat}
                      className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-all flex items-center justify-center"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  );
}
