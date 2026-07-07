'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BrainCircuit, LogOut, Search, Briefcase, FileUp, Sparkles, AlertCircle, CheckCircle, 
  MapPin, Clock, DollarSign, Send, Bot, User, Github, Linkedin, RefreshCw, Star, 
  ListTodo, BookOpen, GraduationCap, Trophy, HelpCircle, ExternalLink, Calendar, X
} from 'lucide-react';


// Banner images database helper

// Helper to get category-specific icon, labels and colors matching the e-commerce layout
const getCategoryBadge = (category: string) => {
  const cat = (category || "").toLowerCase();
  if (cat.includes("software") || cat.includes("devops") || cat.includes("cloud")) {
    return {
      label: "Software",
      color: "bg-indigo-500/20 border-indigo-500/30 text-indigo-300",
      icon: "💻"
    };
  }
  if (cat.includes("ai") || cat.includes("ml") || cat.includes("data")) {
    return {
      label: "AI / Data",
      color: "bg-purple-500/20 border-purple-500/30 text-purple-300",
      icon: "✨"
    };
  }
  if (cat.includes("security") || cat.includes("cyber")) {
    return {
      label: "Security",
      color: "bg-rose-500/20 border-rose-500/30 text-rose-300",
      icon: "🛡️"
    };
  }
  if (cat.includes("design") || cat.includes("ui") || cat.includes("ux")) {
    return {
      label: "UI / UX",
      color: "bg-teal-500/20 border-teal-500/30 text-teal-300",
      icon: "🎨"
    };
  }
  return {
    label: category || "Tech",
    color: "bg-slate-500/20 border-slate-500/30 text-slate-300",
    icon: "💼"
  };
};

const getBannerForJob = (job: any) => {
  const company = (job.company_name || job.company?.name || "").toLowerCase();
  const category = (job.category || "").toLowerCase();
  
  if (company.includes("stripe")) {
    return "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&auto=format&fit=crop&q=80";
  }
  if (company.includes("vercel")) {
    return "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=80";
  }
  if (company.includes("google")) {
    return "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=80";
  }
  if (company.includes("meta")) {
    return "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500&auto=format&fit=crop&q=80";
  }
  if (company.includes("adobe")) {
    return "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=500&auto=format&fit=crop&q=80";
  }
  
  // Category Fallbacks
  if (category.includes("ai") || category.includes("machine") || category.includes("data")) {
    return "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=80";
  }
  if (category.includes("security") || category.includes("cyber") || category.includes("network")) {
    return "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500&auto=format&fit=crop&q=80";
  }
  if (category.includes("design") || category.includes("ui") || category.includes("ux") || category.includes("product")) {
    return "https://images.unsplash.com/photo-1541462608141-2ff03cca742e?w=500&auto=format&fit=crop&q=80";
  }
  
  return "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&auto=format&fit=crop&q=80";
};

// Lazy loaded Image Component with Skeleton Loading and Fail-safe Fallback
const JobBannerImage = ({ src, alt, className }: { src: string; alt: string; className?: string }) => {
  const [loading, setLoading] = React.useState(true);
  const [imgSrc, setImgSrc] = React.useState(src);

  return (
    <div className="relative w-full h-full bg-[#0F1225] overflow-hidden">
      {loading && (
        <div className="absolute inset-0 bg-[#0F1225] animate-pulse flex items-center justify-center">
          <div className="w-5 h-5 rounded-full border border-slate-700 border-t-indigo-500 animate-spin" />
        </div>
      )}
      <img
        src={imgSrc}
        alt={alt}
        className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={() => setLoading(false)}
        onError={() => {
          setImgSrc("https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&auto=format&fit=crop&q=80");
          setLoading(false);
        }}
        loading="lazy"
      />
    </div>
  );
};

export default function StudentDashboard() {
  const { user, logout, apiFetch, loading: authLoading } = useAuth();
  const router = useRouter();
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const localBms = JSON.parse(localStorage.getItem('local_bookmarks') || '[]');
      setLocalBookmarks(localBms);
      const localApps = JSON.parse(localStorage.getItem('local_applications') || '[]');
      setAppliedJobsLocally(localApps);
    }
  }, []);

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
  const [profileCgpa, setProfileCgpa] = useState('');
  const [profileLinks, setProfileLinks] = useState({ github: '', linkedin: '', portfolio: '' });
  const [profileEducation, setProfileEducation] = useState<any[]>([]);
  const [profileProjects, setProfileProjects] = useState<any[]>([]);
  const [profileCertifications, setProfileCertifications] = useState<any[]>([]);

  // Education Sub-form States
  const [newEduInst, setNewEduInst] = useState('');
  const [newEduDegree, setNewEduDegree] = useState('');
  const [newEduField, setNewEduField] = useState('');
  const [newEduStart, setNewEduStart] = useState('');
  const [newEduEnd, setNewEduEnd] = useState('');
  const [newEduCgpa, setNewEduCgpa] = useState('');

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
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user && user.role !== 'student') {
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
      const profileData = await apiFetch('/student/profile').catch(() => null);
      const jobsData = await apiFetch(`/internships?search=${searchQuery}&mode=${modeFilter}&location=${locFilter}`).catch(() => []);
      const applicationsData = await apiFetch('/applications').catch(() => []);
      const notificationsData = await apiFetch('/notifications').catch(() => []);
      const chatbotHistory = await apiFetch('/ai/chat').catch(() => ({ messages: [] }));

      if (profileData) {
        setProfile(profileData);
        setProfileSkills(profileData.skills?.join(', ') || '');
        setProfileCgpa(profileData.cgpa ? profileData.cgpa.toString() : '');
        setProfileLinks(profileData.links || { github: '', linkedin: '', portfolio: '' });
        setProfileEducation(profileData.education || []);
        setProfileProjects(profileData.projects || []);
        setProfileCertifications(profileData.certifications || []);
      } else {
        // Fallback profile if server unavailable
        const storedBms = JSON.parse(localStorage.getItem('local_bookmarks') || '[]');
        const storedApps = JSON.parse(localStorage.getItem('local_applications') || '[]');
        setProfile({
          name: user?.name || 'Alex Rivera',
          skills: ['React', 'TypeScript', 'Node.js', 'Figma'],
          cgpa: 9.1,
          savedInternships: storedBms,
          applications: storedApps.map((id: string) => ({ internshipId: id, status: 'Applied' })),
          education: [{ institution: 'Lovely Professional University', degree: 'B.Tech', fieldOfStudy: 'Computer Science', startYear: '2022', endYear: '2026', cgpa: 9.1 }]
        });
        setProfileSkills('React, TypeScript, Node.js, Figma');
        setProfileCgpa('9.1');
        setProfileEducation([{ institution: 'Lovely Professional University', degree: 'B.Tech', fieldOfStudy: 'Computer Science', startYear: '2022', endYear: '2026', cgpa: 9.1 }]);
      }

      // If no jobs returned from backend, load local fallbacks
      const finalJobs = jobsData.length > 0 ? jobsData : [
        { id: 'intern_stripe_fe', role: 'Frontend Engineering Intern', category: 'Software', company_name: 'Stripe', company_logo: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500', location: 'San Francisco, CA', mode: 'Hybrid', stipend: '$45/hour', duration: '12 Weeks', experience: '0-1 Years', skills_required: ['React', 'TypeScript', 'Tailwind CSS', 'Redux Toolkit'], matchPercentage: 92, deadline: 'In 5 days', description: 'Collaborate with the Stripe Dashboard UI team to build premium, responsive web components.', matchExplanation: 'Matches 4 out of 4 skills: React, TypeScript, Tailwind CSS, Redux Toolkit.' },
        { id: 'intern_vercel_fs', role: 'Full-Stack Developer Intern', category: 'AI', company_name: 'Vercel', company_logo: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500', location: 'Remote', mode: 'Remote', stipend: '$50/hour', duration: '16 Weeks', experience: 'Entry Level', skills_required: ['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL'], matchPercentage: 88, deadline: 'In 3 days', description: 'Build and deploy Server Actions, optimizing initial load performance on Next.js 15 apps.', matchExplanation: 'Matches Next.js and TypeScript.' },
        { id: 'intern_google_ai', role: 'AI & Research Engineering Intern', category: 'AI', company_name: 'Google', company_logo: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500', location: 'Mountain View, CA', mode: 'Office', stipend: '$55/hour', duration: '12 Weeks', experience: 'Intermediate', skills_required: ['Python', 'PyTorch', 'TensorFlow', 'Docker'], matchPercentage: 45, deadline: 'In 10 days', description: 'Train deep learning models for NLP pipelines, deploying inference servers in containerized workspaces.', matchExplanation: 'Missing PyTorch and TensorFlow.' },
        { id: 'intern_meta_cyber', role: 'Cyber Security Operations Intern', category: 'Cyber Security', company_name: 'Meta', company_logo: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500', location: 'Seattle, WA', mode: 'Office', stipend: '$48/hour', duration: '12 Weeks', experience: 'Entry Level', skills_required: ['Linux', 'Network Security', 'Wireshark', 'Python'], matchPercentage: 78, deadline: 'In 7 days', description: 'Audit cloud infrastructure access controls and build automated intrusion warning triggers.', matchExplanation: 'Matches Linux and Python.' },
        { id: 'intern_adobe_ui', role: 'UI/UX Product Design Intern', category: 'UI UX', company_name: 'Adobe', company_logo: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=500', location: 'San Jose, CA', mode: 'Hybrid', stipend: '$42/hour', duration: '24 Weeks', experience: '0-1 Years', skills_required: ['Figma', 'Prototyping', 'User Research', 'Design Systems'], matchPercentage: 85, deadline: 'In 12 days', description: 'Design custom icons, flows, and interactive layouts for Photoshop web-release integrations.', matchExplanation: 'Matches Figma prototyping.' }
      ];

      // Sort jobs by Match Score descending
      const sortedJobs = [...finalJobs].sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
      setJobs(sortedJobs);

      setApplications(applicationsData);
      setNotifications(notificationsData);
      setChatbotLog(chatbotHistory.messages || chatbotHistory);
    } catch (e) {
      console.error("Failed to load server dashboard data, falling back to local offline mode.", e);
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
      addToast('Success', 'Profile updated successfully!', 'success');
      fetchDashboardData();
    } catch (err: any) {
      addToast('Demo Mode', 'Profile updated locally (offline demo)', 'info');
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
      startYear: parseInt(newEduStart) || new Date().getFullYear(),
      endYear: parseInt(newEduEnd) || new Date().getFullYear() + 4,
      cgpa: parseFloat(newEduCgpa) || 0
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
      addToast('Success', 'GitHub data imported successfully!', 'success');
      fetchDashboardData();
    } catch (err) {
      addToast('Demo Mode', 'GitHub imported locally (offline demo)', 'info');
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
      addToast('Success', 'LinkedIn data imported successfully!', 'success');
      fetchDashboardData();
    } catch (err) {
      addToast('Demo Mode', 'LinkedIn imported locally (offline demo)', 'info');
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
      addToast('Demo Mode', 'Bookmark updated (simulated).', 'info');
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
      addToast('ATS Score', `Resume parsed! ATS Score: ${res.atsScore}/100. Profile updated.`, 'success');
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
        addToast('ATS Score', 'Resume parsed locally (Simulated). ATS Score: 92/100. Profile synced.', 'info');
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
          {isDemoMode && (
            <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black tracking-wider uppercase rounded-full animate-pulse flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping shrink-0" />
              <span>Demo Mode</span>
            </div>
          )}
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
              <span>Profile & Settings</span>
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
                  </div>

                  {isDemoMode && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs rounded-2xl flex items-start space-x-3 leading-relaxed">
                      <span className="text-lg shrink-0">🚧</span>
                      <div>
                        <p className="font-extrabold text-amber-300">Server temporarily unavailable.</p>
                        <p className="font-medium text-slate-300 mt-0.5">Running in offline demo mode. You can continue exploring internships and saving applications locally.</p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hidden">

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
                        <div key={job.id} className="glass-panel flex flex-col justify-between min-h-[480px] relative overflow-hidden group hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 rounded-2xl border border-white/5">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/10 to-transparent blur-xl pointer-events-none" />
                          
                          <div>
                            {/* Top cover image banner (e-commerce style) */}
                            <div className="relative w-full h-40 overflow-hidden rounded-t-2xl">
                              <JobBannerImage 
                                src={getBannerForJob(job)} 
                                alt={job.company_name} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-550" 
                              />
                              {/* Overlay Category badge (mirrors blinkit/instamart layout) */}
                              {(() => {
                                const badge = getCategoryBadge(job.category);
                                return (
                                  <span className={`absolute top-3 right-3 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border flex items-center space-x-1 backdrop-blur-md ${badge.color}`}>
                                    <span>{badge.icon}</span>
                                    <span>{badge.label}</span>
                                  </span>
                                );
                              })()}
                              {/* Overlay Rating badge */}
                              <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-amber-400 text-[9px] font-black px-2 py-0.5 rounded-md flex items-center space-x-1 border border-white/5">
                                <span>⭐</span>
                                <span>{job.rating || '4.8'}</span>
                              </span>
                            </div>

                            {/* Padded Content Body */}
                            <div className="p-5">
                              <div className="flex justify-between items-start gap-2 mb-3">
                                <div>
                                  <h4 className="font-extrabold text-sm text-white group-hover:text-indigo-400 transition-colors leading-tight">
                                    {job.role}
                                  </h4>
                                  <p className="text-[10px] text-slate-400 font-bold flex items-center space-x-1 mt-1">
                                    <span>🏢</span>
                                    <span>{job.company_name}</span>
                                  </p>
                                </div>
                                <button 
                                  onClick={() => handleBookmark(job.id, isSaved)}
                                  className={`p-1.5 rounded-lg border transition-all duration-300 shrink-0 ${
                                    isSaved ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : 'border-white/10 hover:border-indigo-500 text-slate-400 hover:text-white'
                                  } ${animatingStarId === job.id ? 'scale-125' : ''}`}
                                >
                                  <Star className={`w-4 h-4 fill-current ${animatingStarId === job.id ? 'animate-spin' : ''}`} />
                                </button>
                              </div>

                              {/* Description */}
                              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                                {job.description || "Exciting internship opportunity to join our engineering and product teams working on modern features."}
                              </p>

                              {/* Metadata list */}
                              <div className="flex flex-wrap gap-x-3 gap-y-2 text-[9px] text-slate-400 mb-3.5 font-bold uppercase tracking-wider">
                                <div className="flex items-center space-x-1 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                                  <MapPin className="w-3 h-3.5 text-teal-400" />
                                  <span>{job.location}</span>
                                </div>
                                <div className="flex items-center space-x-1 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                                  <span>{job.duration} ({job.mode})</span>
                                </div>
                                {/* Bold Stipend Display Price style */}
                                <span className="text-indigo-400 font-black text-xs block">
                                  {job.stipend}
                                </span>
                              </div>

                              {/* Skills chips */}
                              <div className="flex flex-wrap gap-1.5 mb-4">
                                {job.skills_required?.slice(0, 4).map((sk: string) => (
                                  <span key={sk} className="px-2 py-0.5 rounded text-[8px] font-bold bg-white/5 border border-white/5 text-slate-300">
                                    {sk}
                                  </span>
                                ))}
                                {job.skills_required?.length > 4 && (
                                  <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-white/5 border border-white/5 text-slate-500">
                                    +{job.skills_required.length - 4} more
                                  </span>
                                )}
                              </div>

                              {/* AI Compatibility Explanations */}
                              <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 text-[10px] text-slate-400 leading-relaxed font-semibold flex justify-between items-center gap-2">
                                <span className="line-clamp-2">🎯 {job.matchExplanation}</span>
                                <span className="px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 font-extrabold text-[9px] shrink-0">
                                  {job.matchPercentage}%
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Footer */}
                          <div className="grid grid-cols-2 gap-2 p-5 pt-0 mt-auto">
                            <button
                              onClick={() => handleSkillGapTrigger(job)}
                              className="py-2 rounded-xl bg-slate-900 border border-white/5 text-slate-300 hover:bg-white/5 transition-all text-xs font-bold text-center"
                            >
                              Skill Gap Analysis
                            </button>
                            {(() => {
                              const isApplied = profile?.applications?.some((app: any) => app.internshipId === job.id) || appliedJobsLocally.includes(job.id);
                              const isApplying = applyingJobId === job.id;
                              return (
                                <button
                                  onClick={() => !isApplied && handleApply(job.id)}
                                  disabled={isApplying || isApplied}
                                  className={`py-2 rounded-xl font-bold text-xs transition-all text-center flex items-center justify-center space-x-1 ${
                                    isApplied 
                                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 cursor-default'
                                      : 'bg-indigo-500 hover:bg-indigo-600 text-white hover:shadow-lg hover:shadow-indigo-500/20'
                                  }`}
                                >
                                  {isApplying && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                                  <span>
                                    {isApplying ? 'Applying...' : isApplied ? 'Applied ✓' : 'Apply Now'}
                                  </span>
                                </button>
                              );
                            })()}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Skill Gap Analysis Box if selected */}
                  {selectedGapJob && gapAnalysis && (() => {
                    const matchPercent = selectedGapJob.matchPercentage || 75;
                    const radius = 42;
                    const strokeWidth = 8;
                    const circumference = 2 * Math.PI * radius;
                    const strokeDashoffset = circumference - (matchPercent / 100) * circumference;

                    const breakdown = [
                      { label: 'Overall Match', value: matchPercent, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                      { label: 'Skills Alignment', value: Math.min(100, Math.round(matchPercent * 0.95)), color: 'text-purple-400', bg: 'bg-purple-500/10' },
                      { label: 'Academic CGPA', value: profile?.cgpa ? Math.min(100, Math.round(profile.cgpa * 25)) : 85, color: 'text-teal-400', bg: 'bg-teal-500/10' },
                      { label: 'Projects Vetting', value: profile?.projects?.length ? Math.min(100, profile.projects.length * 40) : 70, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                      { label: 'Resume ATS Score', value: profile?.atsScore || 85, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                      { label: 'Certifications', value: profile?.certifications?.length ? Math.min(100, profile.certifications.length * 50) : 65, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                      { label: 'Soft Skills Alignment', value: 85, color: 'text-pink-400', bg: 'bg-pink-500/10' }
                    ];

                    return (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 glass-panel rounded-3xl border border-indigo-500/20 space-y-6 shadow-2xl relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-[150px] pointer-events-none" />
                        
                        <div className="flex justify-between items-center border-b border-white/5 pb-3">
                          <div>
                            <h4 className="font-extrabold text-base text-white">AI Match Analytics: {selectedGapJob.role}</h4>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-0.5">{selectedGapJob.company_name} Vetting Parameters</p>
                          </div>
                          <button 
                            onClick={() => { setSelectedGapJob(null); setGapAnalysis(null); }}
                            className="p-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:text-white transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid md:grid-cols-12 gap-8">
                          {/* Circular progress and Breakdown */}
                          <div className="md:col-span-6 space-y-6">
                            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-900/40 rounded-2xl border border-white/5">
                              {/* SVG progress ring */}
                              <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                                <svg className="w-full h-full transform -rotate-90">
                                  <circle
                                    cx="48"
                                    cy="48"
                                    r={radius}
                                    className="text-slate-800"
                                    strokeWidth={strokeWidth}
                                    stroke="currentColor"
                                    fill="transparent"
                                  />
                                  <motion.circle
                                    cx="48"
                                    cy="48"
                                    r={radius}
                                    className="text-indigo-400"
                                    strokeWidth={strokeWidth}
                                    strokeDasharray={circumference}
                                    initial={{ strokeDashoffset: circumference }}
                                    animate={{ strokeDashoffset }}
                                    transition={{ duration: 1.2, ease: "easeOut" }}
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="transparent"
                                  />
                                </svg>
                                <div className="absolute flex flex-col items-center">
                                  <span className="text-xl font-black text-white">{matchPercent}%</span>
                                  <span className="text-[8px] font-black uppercase text-indigo-300">Match</span>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <h5 className="font-extrabold text-sm text-white">Vocation Match Score</h5>
                                <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                                  Evaluated across 7 key vetting parameters from your synced MongoDB and Prisma databases.
                                </p>
                              </div>
                            </div>

                            {/* Breakdown progress list */}
                            <div className="space-y-3.5">
                              {breakdown.map((item, idx) => (
                                <div key={idx} className="space-y-1">
                                  <div className="flex justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                                    <span className="flex items-center space-x-1.5">
                                      <span className={`w-1.5 h-1.5 rounded-full ${item.color.replace('text-', 'bg-')}`} />
                                      <span>{item.label}</span>
                                    </span>
                                    <span className={item.color}>{item.value}%</span>
                                  </div>
                                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                                    <div 
                                      className={`h-full bg-gradient-to-r from-indigo-500 to-teal-400 rounded-full`}
                                      style={{ width: `${item.value}%` }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Skill lists & roadmap timeline */}
                          <div className="md:col-span-6 space-y-6">
                            <div className="grid sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Matched Skills</span>
                                <div className="flex flex-wrap gap-1">
                                  {gapAnalysis.known?.length > 0 ? (
                                    gapAnalysis.known.map((s: string) => (
                                      <span key={s} className="px-2.5 py-0.5 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-300 text-[9px] font-black uppercase tracking-wider">
                                        {s}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-xs text-slate-500">None</span>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Missing Skills</span>
                                <div className="flex flex-wrap gap-1">
                                  {gapAnalysis.missing?.length > 0 ? (
                                    gapAnalysis.missing.map((s: string) => (
                                      <span key={s} className="px-2.5 py-0.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[9px] font-black uppercase tracking-wider">
                                        {s}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-xs text-teal-400 font-extrabold uppercase">100% Match!</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Learning Roadmap timeline */}
                            <div className="p-4 bg-slate-950/40 rounded-2xl border border-white/5 space-y-3.5">
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">AI Suggestion Roadmap</span>
                              <div className="space-y-3 text-xs text-slate-300 font-semibold leading-relaxed">
                                {gapAnalysis.roadmap?.map((rm: string, idx: number) => (
                                  <div key={idx} className="flex gap-2.5 items-start">
                                    <div className="w-5 h-5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center font-extrabold text-[10px] shrink-0 mt-0.5">
                                      {idx + 1}
                                    </div>
                                    <p className="text-[11px] text-slate-300 font-semibold">{rm}</p>
                                  </div>
                                ))}
                              </div>

                              <div className="pt-3 border-t border-white/5 space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Recommended Material</span>
                                {gapAnalysis.courses?.map((c: string, idx: number) => (
                                  <div key={idx} className="flex items-center space-x-2 text-indigo-400 text-[11px] font-bold hover:underline cursor-pointer">
                                    <BookOpen className="w-3.5 h-3.5 shrink-0" />
                                    <span>{c}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })()}
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

              {/* Tab 3: Profile & Settings */}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-2xl font-extrabold">Profile & Settings</h2>
                      <p className="text-xs text-slate-400 font-semibold mt-1">Manage your professional identity and application preferences</p>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column: Sync & Settings */}
                    <div className="space-y-6 lg:col-span-1">
                      {/* Sync Tools */}
                      <div className="p-6 glass-panel rounded-2xl border border-white/5 space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/10 to-transparent blur-xl pointer-events-none" />
                        <div>
                          <h3 className="font-extrabold text-sm text-white mb-1">Quick Sync</h3>
                          <p className="text-[10px] text-slate-400">Import your credentials from external platforms to auto-fill your profile.</p>
                        </div>
                        
                        <div className="space-y-4">
                          <form onSubmit={handleGitHubImport} className="space-y-3 p-4 bg-slate-900/50 rounded-xl border border-white/5">
                            <h4 className="font-extrabold text-[11px] text-indigo-400 flex items-center space-x-2">
                              <Github className="w-4 h-4" />
                              <span>GitHub Sync</span>
                            </h4>
                            <input
                              type="text"
                              required
                              placeholder="Username (e.g. alexrivera)"
                              value={githubUser}
                              onChange={(e) => setGithubUser(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-white/10 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                            <button
                              type="submit"
                              disabled={importingGit}
                              className="w-full py-2 bg-indigo-500/10 text-indigo-400 hover:text-white hover:bg-indigo-500 border border-indigo-500/20 rounded-lg text-xs font-bold transition-all flex justify-center items-center space-x-1.5"
                            >
                              {importingGit ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                              <span>Sync Repositories</span>
                            </button>
                          </form>

                          <form onSubmit={handleLinkedInImport} className="space-y-3 p-4 bg-slate-900/50 rounded-xl border border-white/5">
                            <h4 className="font-extrabold text-[11px] text-teal-400 flex items-center space-x-2">
                              <Linkedin className="w-4 h-4" />
                              <span>LinkedIn Sync</span>
                            </h4>
                            <input
                              type="text"
                              required
                              placeholder="Profile URL"
                              value={linkedinUrl}
                              onChange={(e) => setLinkedinUrl(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-white/10 text-xs focus:outline-none focus:border-teal-500 transition-colors"
                            />
                            <button
                              type="submit"
                              disabled={importingIn}
                              className="w-full py-2 bg-teal-500/10 text-teal-400 hover:text-white hover:bg-teal-500 border border-teal-500/20 rounded-lg text-xs font-bold transition-all flex justify-center items-center space-x-1.5"
                            >
                              {importingIn ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                              <span>Sync Experience</span>
                            </button>
                          </form>
                        </div>
                      </div>

                      {/* General Settings */}
                      <div className="p-6 glass-panel rounded-2xl border border-white/5 space-y-4">
                        <div>
                          <h3 className="font-extrabold text-sm text-white mb-1">Account Settings</h3>
                          <p className="text-[10px] text-slate-400">Manage your portal preferences and account security.</p>
                        </div>
                        <div className="space-y-3 pt-2">
                          <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg border border-white/5">
                            <div>
                              <p className="text-xs font-bold text-white">Email Notifications</p>
                              <p className="text-[10px] text-slate-400">Receive alerts for new matches.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" defaultChecked />
                              <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500"></div>
                            </label>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg border border-white/5">
                            <div>
                              <p className="text-xs font-bold text-white">Update Password</p>
                              <p className="text-[10px] text-slate-400">Ensure your account is secure.</p>
                            </div>
                            <button className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                              Change
                            </button>
                          </div>
                          <button className="w-full mt-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg text-xs font-bold transition-all border border-red-500/20">
                            Deactivate Account
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Profile Form */}
                    <div className="lg:col-span-2">
                      <form onSubmit={handleProfileSave} className="p-8 glass-panel rounded-2xl border border-white/5 space-y-8 relative overflow-hidden">
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-teal-500/5 to-transparent blur-3xl pointer-events-none" />
                        
                        {/* Section: Basic Info */}
                        <div className="space-y-4 relative z-10">
                          <div className="border-b border-white/5 pb-2">
                            <h3 className="font-extrabold text-base text-white">Professional Details</h3>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">Core Identifiers</p>
                          </div>
                          
                          <div className="grid sm:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                              <label className="block text-xs font-bold text-slate-300">Technical Skills</label>
                              <input
                                type="text"
                                placeholder="e.g. React, Python, PostgreSQL"
                                value={profileSkills}
                                onChange={(e) => setProfileSkills(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm focus:outline-none focus:border-indigo-500 text-white transition-all shadow-inner"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="block text-xs font-bold text-slate-300">Current CGPA</label>
                              <input
                                type="text"
                                placeholder="e.g. 3.8"
                                value={profileCgpa}
                                onChange={(e) => setProfileCgpa(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm focus:outline-none focus:border-indigo-500 text-white transition-all shadow-inner"
                              />
                            </div>
                          </div>

                          <div className="grid sm:grid-cols-3 gap-5">
                            <div className="space-y-1.5">
                              <label className="block text-xs font-bold text-slate-300">Portfolio URL</label>
                              <input
                                type="text"
                                placeholder="https://"
                                value={profileLinks.portfolio}
                                onChange={(e) => setProfileLinks({ ...profileLinks, portfolio: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm focus:outline-none focus:border-indigo-500 text-white transition-all shadow-inner"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="block text-xs font-bold text-slate-300">GitHub URL</label>
                              <input
                                type="text"
                                placeholder="https://"
                                value={profileLinks.github}
                                onChange={(e) => setProfileLinks({ ...profileLinks, github: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm focus:outline-none focus:border-indigo-500 text-white transition-all shadow-inner"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="block text-xs font-bold text-slate-300">LinkedIn URL</label>
                              <input
                                type="text"
                                placeholder="https://"
                                value={profileLinks.linkedin}
                                onChange={(e) => setProfileLinks({ ...profileLinks, linkedin: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm focus:outline-none focus:border-indigo-500 text-white transition-all shadow-inner"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Section: Education */}
                        <div className="space-y-4 relative z-10">
                          <div className="border-b border-white/5 pb-2 flex justify-between items-end">
                            <div>
                              <h3 className="font-extrabold text-base text-white">Education Details</h3>
                              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">Academic Background</p>
                            </div>
                          </div>
                          
                          {profileEducation.length === 0 ? (
                            <div className="p-6 bg-slate-900/50 rounded-xl border border-white/5 text-center border-dashed">
                              <GraduationCap className="w-8 h-8 mx-auto text-slate-500 mb-2" />
                              <p className="text-xs text-slate-400 font-semibold">No education records added yet.</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {profileEducation.map((edu, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-white/5 shadow-sm group">
                                  <div>
                                    <p className="text-sm font-extrabold text-white">{edu.institution}</p>
                                    <p className="text-xs text-indigo-400 font-semibold mt-0.5">{edu.degree} in {edu.fieldOfStudy}</p>
                                    <p className="text-[10px] text-slate-400 font-bold mt-1">{edu.startYear} - {edu.endYear} • CGPA: {edu.cgpa}</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveEducation(idx)}
                                    className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 rounded-lg transition-all"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="bg-slate-950 p-5 rounded-xl border border-indigo-500/20 shadow-inner mt-4">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-3">Add New Record</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                              <input type="text" placeholder="Institution Name" value={newEduInst} onChange={(e) => setNewEduInst(e.target.value)} className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white focus:border-indigo-500 focus:outline-none" />
                              <input type="text" placeholder="Degree (e.g. BS)" value={newEduDegree} onChange={(e) => setNewEduDegree(e.target.value)} className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white focus:border-indigo-500 focus:outline-none" />
                              <input type="text" placeholder="Field of Study" value={newEduField} onChange={(e) => setNewEduField(e.target.value)} className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white focus:border-indigo-500 focus:outline-none" />
                              <input type="number" placeholder="Start Year" value={newEduStart} onChange={(e) => setNewEduStart(e.target.value)} className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white focus:border-indigo-500 focus:outline-none" />
                              <input type="number" placeholder="End Year" value={newEduEnd} onChange={(e) => setNewEduEnd(e.target.value)} className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white focus:border-indigo-500 focus:outline-none" />
                              <input type="text" placeholder="GPA" value={newEduCgpa} onChange={(e) => setNewEduCgpa(e.target.value)} className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white focus:border-indigo-500 focus:outline-none" />
                            </div>
                            <button type="button" onClick={handleAddEducation} className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold transition-all shadow-md">
                              Add Education
                            </button>
                          </div>
                        </div>

                        {/* Section: Projects */}
                        <div className="space-y-4 relative z-10">
                          <div className="border-b border-white/5 pb-2">
                            <h3 className="font-extrabold text-base text-white">Project Portfolio</h3>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">Highlighted Work</p>
                          </div>
                          
                          {profileProjects.length === 0 ? (
                            <div className="p-6 bg-slate-900/50 rounded-xl border border-white/5 text-center border-dashed">
                              <Briefcase className="w-8 h-8 mx-auto text-slate-500 mb-2" />
                              <p className="text-xs text-slate-400 font-semibold">No projects added yet. Boost your ATS score by adding some!</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {profileProjects.map((proj, idx) => (
                                <div key={idx} className="flex justify-between items-start bg-slate-900 p-4 rounded-xl border border-white/5 shadow-sm group">
                                  <div className="space-y-1.5">
                                    <div className="flex items-center space-x-2">
                                      <p className="text-sm font-extrabold text-white">{proj.title}</p>
                                      {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" className="text-teal-400 hover:text-teal-300"><ExternalLink className="w-3 h-3" /></a>}
                                    </div>
                                    <p className="text-xs text-slate-400 font-medium leading-relaxed">{proj.description}</p>
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                      {Array.isArray(proj.technologies) ? proj.technologies.map((t: string) => (
                                        <span key={t} className="px-2 py-0.5 rounded-md bg-white/5 text-slate-300 text-[9px] font-bold uppercase tracking-wider">{t}</span>
                                      )) : (
                                        <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-300 text-[9px] font-bold uppercase tracking-wider">{proj.technologies}</span>
                                      )}
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveProject(idx)}
                                    className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 rounded-lg transition-all"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="bg-slate-950 p-5 rounded-xl border border-teal-500/20 shadow-inner mt-4">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-teal-400 mb-3">Add New Project</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                              <input type="text" placeholder="Project Title" value={newProjTitle} onChange={(e) => setNewProjTitle(e.target.value)} className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white focus:border-teal-500 focus:outline-none" />
                              <input type="text" placeholder="Tech Stack (comma separated)" value={newProjTech} onChange={(e) => setNewProjTech(e.target.value)} className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white focus:border-teal-500 focus:outline-none" />
                              <input type="text" placeholder="Repository / Live Link" value={newProjLink} onChange={(e) => setNewProjLink(e.target.value)} className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white focus:border-teal-500 focus:outline-none md:col-span-2" />
                              <textarea placeholder="Brief description of the project and your impact..." value={newProjDesc} onChange={(e) => setNewProjDesc(e.target.value)} rows={3} className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white focus:border-teal-500 focus:outline-none md:col-span-2 resize-none" />
                            </div>
                            <button type="button" onClick={handleAddProject} className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-xs font-bold transition-all shadow-md">
                              Add Project
                            </button>
                          </div>
                        </div>

                        {/* Section: Certifications */}
                        <div className="space-y-4 relative z-10">
                          <div className="border-b border-white/5 pb-2">
                            <h3 className="font-extrabold text-base text-white">Certifications</h3>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">Licenses & Courses</p>
                          </div>
                          
                          {profileCertifications.length === 0 ? (
                            <div className="p-6 bg-slate-900/50 rounded-xl border border-white/5 text-center border-dashed">
                              <Trophy className="w-8 h-8 mx-auto text-slate-500 mb-2" />
                              <p className="text-xs text-slate-400 font-semibold">No certifications added. Stand out by adding some!</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {profileCertifications.map((cert, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-white/5 shadow-sm group">
                                  <div>
                                    <p className="text-sm font-extrabold text-white">{cert.name}</p>
                                    <p className="text-xs text-indigo-400 font-semibold mt-0.5">{cert.issuingOrganization}</p>
                                    <p className="text-[10px] text-slate-400 font-bold mt-1">Issued: {cert.issueDate} {cert.credentialId && `• ID: ${cert.credentialId}`}</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveCertification(idx)}
                                    className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 rounded-lg transition-all"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="bg-slate-950 p-5 rounded-xl border border-indigo-500/20 shadow-inner mt-4">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-3">Add Certificate</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                              <input type="text" placeholder="Certificate Name" value={newCertName} onChange={(e) => setNewCertName(e.target.value)} className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white focus:border-indigo-500 focus:outline-none" />
                              <input type="text" placeholder="Issuing Organization" value={newCertOrg} onChange={(e) => setNewCertOrg(e.target.value)} className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white focus:border-indigo-500 focus:outline-none" />
                              <input type="date" placeholder="Issue Date" value={newCertDate} onChange={(e) => setNewCertDate(e.target.value)} className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white focus:border-indigo-500 focus:outline-none" />
                              <input type="text" placeholder="Credential ID (optional)" value={newCertId} onChange={(e) => setNewCertId(e.target.value)} className="px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white focus:border-indigo-500 focus:outline-none" />
                            </div>
                            <button type="button" onClick={handleAddCertification} className="px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500 text-indigo-400 hover:text-white rounded-lg text-xs font-bold transition-all shadow-md">
                              Add Certificate
                            </button>
                          </div>
                        </div>

                        <div className="pt-6 mt-6 border-t border-white/5 relative z-10">
                          <button
                            type="submit"
                            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-indigo-500 to-teal-400 hover:from-indigo-600 hover:to-teal-500 text-white text-sm font-extrabold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 flex justify-center items-center space-x-2"
                          >
                            <User className="w-4 h-4" />
                            <span>Save Profile & Settings</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
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

      {/* Apply Confirmation Dialog Overlay */}
      {applyConfirmJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-sm w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-2">
              <h3 className="text-base font-black text-white leading-tight">
                Apply for {applyConfirmJob.role}?
              </h3>
              <div className="p-4 rounded-xl bg-slate-950 border border-white/5 space-y-2.5 text-xs font-semibold text-slate-300">
                <p className="flex justify-between"><span className="text-slate-400">Company:</span> <span className="text-white">{applyConfirmJob.company_name}</span></p>
                <p className="flex justify-between"><span className="text-slate-400">Location:</span> <span className="text-white">{applyConfirmJob.location}</span></p>
                <p className="flex justify-between"><span className="text-slate-400">Salary:</span> <span className="text-purple-400 font-extrabold">{applyConfirmJob.stipend}</span></p>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setApplyConfirmJob(null)}
                className="px-4 py-2 bg-slate-950 border border-white/5 rounded-xl text-slate-400 hover:text-white transition-all text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const jobId = applyConfirmJob.id;
                  const localApps = JSON.parse(localStorage.getItem('local_applications') || '[]');
                  if (!localApps.includes(jobId)) {
                    localApps.push(jobId);
                    localStorage.setItem('local_applications', JSON.stringify(localApps));
                  }
                  setAppliedJobsLocally(prev => [...prev, jobId]);
                  
                  // Optimistic profile applications update
                  setProfile((prev: any) => ({
                    ...prev,
                    applications: [...(prev?.applications || []), { internshipId: jobId, status: 'Applied' }]
                  }));

                  addToast(
                    'Application Saved',
                    '✓ Application saved locally. It will sync automatically when the server becomes available.',
                    'success'
                  );
                  setApplyConfirmJob(null);
                }}
                className="px-5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold text-xs transition-all shadow-lg hover:shadow-indigo-500/20"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
