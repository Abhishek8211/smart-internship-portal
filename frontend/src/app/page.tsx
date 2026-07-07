'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Briefcase, GraduationCap, ShieldCheck, Sun, Moon, ArrowRight, 
  BrainCircuit, LineChart, CodeXml, MessageSquareShare, Percent, MapPin, 
  Clock, DollarSign, CheckCircle, AlertCircle, Calendar, Award, Star, X, 
  ChevronDown, Heart, Eye, ArrowUpRight, HelpCircle, Bot
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
          <div className="w-6 h-6 rounded-full border-2 border-slate-700 border-t-purple-500 animate-spin" />
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

export default function LandingPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Active Category Filter
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = ['All', 'Software', 'AI', 'ML', 'Cyber Security', 'Cloud', 'Data Science', 'UI UX', 'Marketing', 'Finance', 'Product', 'DevOps'];

  // Testimonials state
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // FAQ Accordion
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Quick View Modal
  const [quickViewJob, setQuickViewJob] = useState<any>(null);

  // Saved Jobs tracking
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const toggleSaveJob = (id: string) => {
    setSavedJobs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // Live Counter Animation hook
  const [stats, setStats] = useState({ students: 0, companies: 0, internships: 0, success: 0 });
  const [targetStats, setTargetStats] = useState({ students: 0, companies: 0, internships: 0, success: 0 });

  useEffect(() => {
    const statsUrl = process.env.NODE_ENV === 'production' 
      ? `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/api/public/stats`
      : `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:5000'}/api/public/stats`;

    fetch(statsUrl)
      .then(res => res.json())
      .then(data => {
        setTargetStats({
          students: data.students || 0,
          companies: data.companies || 0,
          internships: data.internships || 0,
          success: data.success || 0
        });
      })
      .catch(err => console.error('Failed to fetch stats:', err));
  }, []);

  useEffect(() => {
    if (targetStats.students === 0 && targetStats.companies === 0 && targetStats.internships === 0 && targetStats.success === 0) return;

    const duration = 1500;
    const steps = 40;
    const stepTime = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setStats({
        students: Math.min(targetStats.students, Math.round((targetStats.students / steps) * step)),
        companies: Math.min(targetStats.companies, Math.round((targetStats.companies / steps) * step)),
        internships: Math.min(targetStats.internships, Math.round((targetStats.internships / steps) * step)),
        success: Math.min(targetStats.success, Math.round((targetStats.success / steps) * step))
      });
      if (step >= steps) {
        setStats(targetStats);
        clearInterval(timer);
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [targetStats]);

  const companyLogos = [
    { name: 'Google', logo: 'Google' },
    { name: 'Microsoft', logo: 'Microsoft' },
    { name: 'Amazon', logo: 'Amazon' },
    { name: 'Meta', logo: 'Meta' },
    { name: 'Netflix', logo: 'Netflix' },
    { name: 'Apple', logo: 'Apple' },
    { name: 'Adobe', logo: 'Adobe' },
    { name: 'Oracle', logo: 'Oracle' },
    { name: 'IBM', logo: 'IBM' },
    { name: 'Salesforce', logo: 'Salesforce' },
    { name: 'NVIDIA', logo: 'NVIDIA' },
    { name: 'Zoho', logo: 'Zoho' }
  ];

  const features = [
    { title: 'AI Resume Analysis', desc: 'Deep NLP scan evaluating match readiness instantly.', icon: <CodeXml className="w-5 h-5" /> },
    { title: 'ATS Resume Score', desc: 'Score checklist matching formatting rules and keywords density.', icon: <Percent className="w-5 h-5" /> },
    { title: 'Smart Internship Matching', desc: 'Connects academic metrics with role criteria dynamically.', icon: <Sparkles className="w-5 h-5" /> },
    { title: 'Career Roadmap', desc: 'Syllabus guidelines based on student current skill indices.', icon: <LineChart className="w-5 h-5" /> },
    { title: 'Skill Gap Analysis', desc: 'Pinpoint missing skills compared to active listings.', icon: <AlertCircle className="w-5 h-5" /> },
    { title: 'Mock Interviews', desc: 'AI practice interview questions specific to role scopes.', icon: <GraduationCap className="w-5 h-5" /> },
    { title: 'Resume Builder', desc: 'Draft clean resumes directly with optimal ATS templates.', icon: <Briefcase className="w-5 h-5" /> },
    { title: 'Resume Parser', desc: 'Instantly pull education, projects, and certifications.', icon: <BrainCircuit className="w-5 h-5" /> },
    { title: 'Cover Letter Generator', desc: 'Tailor custom-written cover letters to target positions.', icon: <MessageSquareShare className="w-5 h-5" /> },
    { title: 'Company Insights', desc: 'Real recruiter parameters, verified locations and scopes.', icon: <ShieldCheck className="w-5 h-5" /> },
    { title: 'Application Tracker', desc: 'Interactive visual pipeline logs from Applied to Hired.', icon: <Calendar className="w-5 h-5" /> },
    { title: 'Notifications', desc: 'Real-time WebSocket notifications of application updates.', icon: <Star className="w-5 h-5" /> },
    { title: 'Real-time Chat', desc: 'Interactive dialogues, direct chat counselor integration.', icon: <Bot className="w-5 h-5" /> },
    { title: 'Mentorship', desc: 'Detailed career advice and suggested learning roadmaps.', icon: <Award className="w-5 h-5" /> },
    { title: 'Certificates', desc: 'Add credentials verification status to impress recruiters.', icon: <Award className="w-5 h-5" /> },
    { title: 'Leaderboard', desc: 'Score metrics tracking skills and placement readiness.', icon: <TrophyIcon className="w-5 h-5" /> }
  ];

  const internships = [
    { id: 'intern_stripe_fe', role: 'Frontend Engineering Intern', category: 'Software', company_name: 'Stripe', company_logo: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=100', location: 'San Francisco, CA', mode: 'Hybrid', stipend: '$45/hour', duration: '12 Weeks', experience: '0-1 Years', skills_required: ['React', 'TypeScript', 'Tailwind CSS', 'Redux Toolkit'], matchPercentage: 92, deadline: 'In 5 days', description: 'Collaborate with the Stripe Dashboard UI team to build premium, responsive web components.' },
    { id: 'intern_vercel_fs', role: 'Full-Stack Developer Intern', category: 'AI', company_name: 'Vercel', company_logo: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=100&q=80', location: 'Remote', mode: 'Remote', stipend: '$50/hour', duration: '16 Weeks', experience: 'Entry Level', skills_required: ['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL'], matchPercentage: 88, deadline: 'In 3 days', description: 'Build and deploy Server Actions, optimizing initial load performance on Next.js 15 apps.' },
    { id: 'intern_google_ai', role: 'AI & Research Engineering Intern', category: 'AI', company_name: 'Google', company_logo: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=100', location: 'Mountain View, CA', mode: 'Office', stipend: '$55/hour', duration: '12 Weeks', experience: 'Intermediate', skills_required: ['Python', 'PyTorch', 'TensorFlow', 'Docker'], matchPercentage: 45, deadline: 'In 10 days', description: 'Train deep learning models for NLP pipelines, deploying inference servers in containerized workspaces.' },
    { id: 'intern_meta_cyber', role: 'Cyber Security Operations Intern', category: 'Cyber Security', company_name: 'Meta', company_logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100', location: 'Seattle, WA', mode: 'Office', stipend: '$48/hour', duration: '12 Weeks', experience: 'Entry Level', skills_required: ['Linux', 'Network Security', 'Wireshark', 'Python'], matchPercentage: 78, deadline: 'In 7 days', description: 'Audit cloud infrastructure access controls and build automated intrusion warning triggers.' },
    { id: 'intern_adobe_ui', role: 'UI/UX Product Design Intern', category: 'UI UX', company_name: 'Adobe', company_logo: 'https://images.unsplash.com/photo-1561070791-26c113006238?w=100', location: 'San Jose, CA', mode: 'Hybrid', stipend: '$42/hour', duration: '24 Weeks', experience: '0-1 Years', skills_required: ['Figma', 'Prototyping', 'User Research', 'Design Systems'], matchPercentage: 85, deadline: 'In 12 days', description: 'Design custom icons, flows, and interactive layouts for Photoshop web-release integrations.' }
  ];

  const filteredJobs = selectedCategory === 'All' 
    ? internships 
    : internships.filter(j => j.category === selectedCategory || (selectedCategory === 'Software' && j.category === 'DevOps'));

  const testimonials = [
    { name: 'Sarah Jenkins', role: 'Frontend Engineer at Stripe', feedback: 'Using the AI Match dashboard, I mapped my college React projects straight to Stripe’s tech requirements. The practice interview sheet was 90% identical to the actual technical rounds!', logo: 'Stripe', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120' },
    { name: 'David Kim', role: 'Full-Stack Developer at Vercel', feedback: 'The skill gap analyzer suggested I learn Server Actions. Within 3 weeks of following the learning roadmap, Vercel matched my profile and booked an interview!', logo: 'Vercel', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120' },
    { name: 'Aisha Rahman', role: 'AI Researcher at Google', feedback: 'I uploaded my raw resume, got an ATS Score of 62, and applied all recommendations. My ATS Score rose to 95, and I received direct interview invites!', logo: 'Google', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120' }
  ];

  const faqs = [
    { q: 'How does the AI matching percentage calculation work?', a: 'Our system analyzes your skills, CGPA, certifications, and project keywords in MongoDB, and matches them against PostgreSQL internship requirements. It utilizes Gemini to score compatibility and explain gaps.' },
    { q: 'What is the Developer Sandbox?', a: 'The sandbox bypasses authentication flows so students, recruiters, and admins can instantly test full-featured dashboards with seeded profiles, application timelines, and real-time socket chats.' },
    { q: 'Does it support resume parsing?', a: 'Yes! Upload any resume PDF, and our parser will extract your skills, education arrays, and projects, syncing your portal profile database instantly.' },
    { q: 'Can recruiters generate custom practice interview sheets?', a: 'Absolutely. When a recruiter schedules a Zoom interview, our AI engine parses the internship role details and generates custom Technical, Behavioral, Coding, and HR questions for the student.' }
  ];

  return (
    <div className="min-h-screen relative flex flex-col justify-between bg-[#080B18] text-slate-100 overflow-x-hidden font-sans">
      {/* Background ambient glow blobs */}
      <div className="glow-blob top-[-10%] left-[-15%] w-[600px] h-[600px] bg-purple-600/10" />
      <div className="glow-blob bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/5" />
      <div className="glow-blob top-[40%] right-[5%] w-[400px] h-[400px] bg-indigo-600/10" />

      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full px-6 py-4 glass-panel border-b border-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-tr from-purple-500 via-indigo-500 to-teal-400 rounded-xl text-white shadow-lg shadow-indigo-500/20">
              <BrainCircuit className="w-6 h-6 animate-pulse" />
            </div>
            <span className="font-extrabold text-xl bg-gradient-to-r from-purple-400 via-indigo-300 to-teal-400 bg-clip-text text-transparent tracking-wide">
              SmartMatch
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8 text-xs font-bold tracking-wider text-slate-400 uppercase">
            <a href="#features" className="hover:text-purple-400 transition-colors">Features</a>
            <a href="#categories" className="hover:text-purple-400 transition-colors">Categories</a>
            <a href="#listings" className="hover:text-purple-400 transition-colors">Internships</a>
            <a href="#sandbox" className="hover:text-purple-400 transition-colors">Developer Sandbox</a>
            <a href="#testimonials" className="hover:text-purple-400 transition-colors">Success Stories</a>
          </nav>

          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-white/5 border border-white/10 text-purple-400 transition-colors"
            >
              {theme === 'light' ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5" />}
            </button>

            {user ? (
              <Link 
                href={`/dashboard/${user.role}`}
                className="px-4 py-2 text-xs font-bold tracking-wider uppercase text-slate-950 bg-gradient-to-r from-purple-400 to-teal-400 hover:opacity-90 rounded-xl shadow-lg transition-all flex items-center space-x-1"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-xs font-bold uppercase tracking-wider hover:text-purple-400 transition-colors">
                  Sign In
                </Link>
                <Link 
                  href="/register" 
                  className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-white border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500 hover:text-slate-950 rounded-xl transition-all"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-6 pt-16 pb-24 grid md:grid-cols-12 gap-12 items-center relative z-10">
        <div className="md:col-span-7 space-y-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-teal-400 animate-spin-slow" />
            <span>AI Match Engine V2.0</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight text-white">
            AI Internship <br />
            <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-teal-400 bg-clip-text text-transparent">
              Matching Platform
            </span>
          </h1>

          <p className="text-slate-400 text-sm md:text-base font-medium leading-relaxed max-w-xl">
            A premium full-stack recruiting hub bridging college profiles with industry leaders. Includes live resume parsing, ATS scoring checkers, smart skill-gap analyzers, and automated mock practice sheets.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link 
              href="/register" 
              className="px-7 py-3.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-90 text-white font-extrabold rounded-xl shadow-xl shadow-purple-500/20 transition-all text-center flex items-center justify-center space-x-2 text-xs uppercase tracking-wider"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a 
              href="#listings" 
              className="px-7 py-3.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-extrabold rounded-xl transition-all text-center text-xs uppercase tracking-wider"
            >
              Browse Internships
            </a>
            <a 
              href="#sandbox" 
              className="px-7 py-3.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/20 font-extrabold rounded-xl transition-all text-center text-xs uppercase tracking-wider"
            >
              Sandbox Demo
            </a>
          </div>
        </div>

        {/* Floating Cards Graphic Visualizer */}
        <div className="md:col-span-5 relative flex justify-center items-center">
          <div className="absolute w-[350px] h-[350px] bg-gradient-to-tr from-purple-600 to-teal-400 rounded-full blur-[100px] opacity-25 animate-pulse" />
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-sm p-6 glass-panel rounded-3xl relative shadow-2xl border border-white/10 z-10"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                  <GraduationCap className="w-5 h-5 text-purple-300" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white">Alex Rivera</h4>
                  <p className="text-xs text-slate-400 font-semibold">B.Tech CSE Student</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-[10px] font-black uppercase">
                92% Match
              </span>
            </div>

            <div className="space-y-4">
              {/* ATS checklist */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                  <span>ATS Resume Score</span>
                  <span className="text-purple-400 font-black">88/100</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-teal-400 rounded-full" style={{ width: '88%' }} />
                </div>
              </div>

              {/* Skills badges */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['React', 'Next.js', 'TypeScript', 'Node.js'].map(s => (
                  <span key={s} className="px-2 py-0.5 rounded-lg text-[9px] font-black bg-white/5 border border-white/5 text-slate-300 uppercase tracking-wider">
                    {s}
                  </span>
                ))}
              </div>

              {/* AI matching text box */}
              <div className="p-3 bg-purple-500/5 rounded-xl border border-purple-500/10 text-[11px] text-slate-300 leading-relaxed font-semibold">
                ✨ **AI Match Insights**: Alex matches all key core metrics for the Stripe frontend team. Highly recommended.
              </div>
            </div>
          </motion.div>

          {/* Floating badge items */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-[10%] right-[-5%] p-3 glass-panel rounded-2xl border border-white/10 flex items-center space-x-2 shadow-xl z-20"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 text-emerald-400">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div className="text-[10px] font-black uppercase tracking-wider">
              <span className="text-slate-400 block text-[8px] font-bold">Stripe status</span>
              <span className="text-white">Shortlisted</span>
            </div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
            className="absolute bottom-[10%] left-[-8%] p-3 glass-panel rounded-2xl border border-white/10 flex items-center space-x-2 shadow-xl z-20"
          >
            <div className="w-7 h-7 rounded-lg bg-teal-500/20 flex items-center justify-center border border-teal-500/30 text-teal-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="text-[10px] font-black uppercase tracking-wider">
              <span className="text-slate-400 block text-[8px] font-bold">Vercel Interview</span>
              <span className="text-white font-extrabold">Booked</span>
            </div>
          </motion.div>
        </div>
      </main>

      {/* STATISTICS */}
      <section className="w-full border-t border-b border-white/5 bg-[#0b0e1e]/60 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center space-y-1">
            <span className="text-3xl md:text-5xl font-black text-white bg-gradient-to-r from-purple-400 to-indigo-300 bg-clip-text text-transparent block">
              {stats.students.toLocaleString()}+
            </span>
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500">Active Students</span>
          </div>
          <div className="text-center space-y-1">
            <span className="text-3xl md:text-5xl font-black text-white bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent block">
              {stats.companies.toLocaleString()}+
            </span>
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500">Partner Companies</span>
          </div>
          <div className="text-center space-y-1">
            <span className="text-3xl md:text-5xl font-black text-white bg-gradient-to-r from-purple-400 to-indigo-300 bg-clip-text text-transparent block">
              {stats.internships.toLocaleString()}+
            </span>
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500">Jobs Posted</span>
          </div>
          <div className="text-center space-y-1">
            <span className="text-3xl md:text-5xl font-black text-white bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent block">
              {stats.success}%
            </span>
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500">Placement Success</span>
          </div>
        </div>
      </section>

      {/* COMPANY LOGOS RIBBON */}
      <section className="w-full py-10 overflow-hidden border-b border-white/5 relative bg-[#080B18]">
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#080B18] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#080B18] to-transparent z-10 pointer-events-none" />
        
        <div className="animate-marquee space-x-16 items-center">
          {/* Double list to loop seamlessly */}
          {[...companyLogos, ...companyLogos].map((c, idx) => (
            <span key={idx} className="text-lg font-black tracking-widest text-slate-600 hover:text-white uppercase transition-colors shrink-0">
              ⚡ {c.name}
            </span>
          ))}
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="w-full py-24 px-6 border-b border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-[10px] font-black uppercase tracking-widest">
              <span>Full-Stack AI Engine</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Intelligent Vetting Architecture
            </h2>
            <p className="text-slate-400 text-sm font-medium">
              A comprehensive system mapping client profiles, resume checks, and skill-gap analyzers to optimize career path selections.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feat, idx) => (
              <div 
                key={idx} 
                className="p-6 glass-panel rounded-[24px] border border-white/5 glass-panel-hover flex flex-col justify-between h-48 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rounded-bl-[100px] pointer-events-none" />
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300">
                  {feat.icon}
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-extrabold text-sm text-white tracking-wide">{feat.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section id="categories" className="w-full py-24 px-6 border-b border-white/5 relative z-10 bg-[#0b0e1e]/40">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl font-extrabold tracking-tight text-white">Popular Vocation Categories</h2>
            <p className="text-slate-400 text-sm font-medium">Filter internship openings across major industry domains instantly.</p>
          </div>

          {/* Filter Pills Grid */}
          <div className="flex flex-wrap justify-center gap-3 max-w-5xl mx-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`py-2 px-5 text-xs font-extrabold rounded-xl border transition-all uppercase tracking-wider ${
                  selectedCategory === cat 
                    ? 'bg-purple-500 text-slate-950 border-purple-500 shadow-lg shadow-purple-500/10' 
                    : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* INTERNSHIPS GRID */}
      <section id="listings" className="w-full py-24 px-6 border-b border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-white">Featured Internship Roles</h2>
              <p className="text-slate-400 text-sm font-medium mt-1">Live active positions synced with real recruiter portals.</p>
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Showing {filteredJobs.length} matches
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredJobs.map(job => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  key={job.id}
                  className="glowing-card flex flex-col justify-between min-h-[480px] relative overflow-hidden group hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 rounded-2xl border border-white/5"
                >
                  <div>
                    {/* Top cover image banner (e-commerce style) */}
                    <div className="relative w-full h-44 overflow-hidden rounded-t-2xl">
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
                      {/* Overlay Company rating badge */}
                      <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-amber-400 text-[9px] font-black px-2 py-0.5 rounded-md flex items-center space-x-1 border border-white/5">
                        <span>⭐</span>
                        <span>{job.rating || '4.8'}</span>
                      </span>
                    </div>

                    {/* Text content details inside padded layout */}
                    <div className="p-5">
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <div>
                          <h4 className="font-extrabold text-sm text-white tracking-wide leading-tight group-hover:text-purple-400 transition-colors">
                            {job.role}
                          </h4>
                          {/* Store/Company name with shop icon */}
                          <span className="text-[10px] text-slate-400 font-bold flex items-center space-x-1 mt-1">
                            <span>🏢</span>
                            <span>{job.company_name}</span>
                          </span>
                        </div>
                        <button 
                          onClick={() => toggleSaveJob(job.id)}
                          className="p-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:text-rose-400 transition-colors shrink-0"
                        >
                          <Heart className={`w-4 h-4 ${savedJobs.includes(job.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                        </button>
                      </div>

                      {/* Brief description */}
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-4">
                        {job.description}
                      </p>

                      {/* Metadata tags */}
                      <div className="flex flex-wrap gap-2 text-[9px] text-slate-400 mb-4 font-bold uppercase tracking-wider">
                        <span className="flex items-center space-x-1 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                          <MapPin className="w-3 h-3 text-purple-400" />
                          <span>{job.location}</span>
                        </span>
                        <span className="flex items-center space-x-1 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                          <Clock className="w-3 h-3 text-indigo-400" />
                          <span>{job.duration} ({job.mode})</span>
                        </span>
                        {/* Bold Stipend Display Price style */}
                        <span className="text-purple-400 font-black text-xs block">
                          {job.stipend}
                        </span>
                      </div>

                      {/* Skills list */}
                      <div className="flex flex-wrap gap-1.5">
                        {job.skills_required.slice(0, 3).map(sk => (
                          <span key={sk} className="px-2 py-0.5 rounded text-[8px] font-bold bg-white/5 border border-white/5 text-slate-300">
                            {sk}
                          </span>
                        ))}
                        {job.skills_required.length > 3 && (
                          <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-white/5 border border-white/5 text-slate-500">
                            +{job.skills_required.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom footer for compatibility scoring and CTA buttons */}
                  <div className="px-5 pb-5 pt-3 border-t border-white/5 flex items-center justify-between mt-auto">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-400 flex items-center space-x-1">
                      <span>⚡</span>
                      <span>{job.matchPercentage}% AI COMPATIBILITY</span>
                    </span>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => setQuickViewJob(job)}
                        className="p-2 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 rounded-xl transition-all"
                        title="Quick View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <Link
                        href="/register"
                        className="px-4 py-2 bg-purple-500 hover:bg-purple-600 hover:shadow-purple-500/20 text-slate-950 font-black text-[9px] rounded-xl uppercase tracking-wider flex items-center space-x-1.5 transition-all shadow-md"
                      >
                        <span>Apply</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* DEVELOPER SANDBOX BYPASS */}
      <section id="sandbox" className="w-full py-24 px-6 border-b border-white/5 relative z-10 bg-[#0b0e1e]/40">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl font-extrabold tracking-tight text-white">Instant Developer Sandbox</h2>
            <p className="text-slate-400 text-sm font-medium">
              Bypass registration logic and examine the dashboard tabs, custom roadmaps, and chat features immediately.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Student card */}
            <div className="p-6 glass-panel rounded-[28px] border border-white/5 flex flex-col justify-between items-center text-center glass-panel-hover group relative overflow-hidden h-[300px]">
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-bl-[100px] pointer-events-none" />
              <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-2 text-purple-400 group-hover:bg-purple-500 group-hover:text-slate-950 transition-all shadow-lg">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-white">Student Dashboard</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                Explore matched job metrics, ATS checklist, parse resumes, and consult with the AI Counselor.
              </p>
              <Link 
                href="/login"
                className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md block text-center"
              >
                Log In as Student
              </Link>
            </div>

            {/* Recruiter card */}
            <div className="p-6 glass-panel rounded-[28px] border border-white/5 flex flex-col justify-between items-center text-center glass-panel-hover group relative overflow-hidden h-[300px]">
              <div className="absolute top-0 right-0 w-20 h-20 bg-teal-500/5 rounded-bl-[100px] pointer-events-none" />
              <div className="w-12 h-12 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-2 text-teal-400 group-hover:bg-teal-500 group-hover:text-slate-950 transition-all shadow-lg">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-white">Recruiter Dashboard</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                Manage listings (Full CRUD), filter candidates sorted by AI scores, and generate custom interview practice questions.
              </p>
              <Link 
                href="/login"
                className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md block text-center"
              >
                Log In as Recruiter
              </Link>
            </div>

            {/* Admin card */}
            <div className="p-6 glass-panel rounded-[28px] border border-white/5 flex flex-col justify-between items-center text-center glass-panel-hover group relative overflow-hidden h-[300px]">
              <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-bl-[100px] pointer-events-none" />
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-2 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-slate-950 transition-all shadow-lg">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-white">Admin Portal</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                Verify recruiter companies status, suspend rogue accounts, audit system activities, and review stats graph.
              </p>
              <Link 
                href="/login"
                className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md block text-center"
              >
                Log In as Admin
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SUCCESS STORIES */}
      <section id="testimonials" className="w-full py-24 px-6 border-b border-white/5 relative z-10 bg-[#080B18]">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-extrabold tracking-tight text-white">Placement Success Stories</h2>
            <p className="text-slate-400 text-sm font-medium">Read how student candidates landed engineering roles at Stripe, Vercel, and Google.</p>
          </div>

          <div className="relative">
            <div className="p-8 glass-panel rounded-[28px] border border-white/10 relative shadow-2xl flex flex-col md:flex-row gap-8 items-center">
              <img 
                src={testimonials[activeTestimonial].image} 
                alt={testimonials[activeTestimonial].name} 
                className="w-20 h-20 md:w-28 md:h-28 rounded-full object-cover border border-purple-500/30" 
              />
              <div className="space-y-4 flex-grow">
                <p className="text-slate-300 italic text-sm md:text-base leading-relaxed font-semibold">
                  "{testimonials[activeTestimonial].feedback}"
                </p>
                <div className="flex justify-between items-center">
                  <div>
                    <h5 className="font-black text-sm text-white">{testimonials[activeTestimonial].name}</h5>
                    <span className="text-xs text-purple-400 font-bold">{testimonials[activeTestimonial].role}</span>
                  </div>
                  <span className="text-slate-600 font-black text-xl tracking-widest uppercase">
                    ⚡ {testimonials[activeTestimonial].logo}
                  </span>
                </div>
              </div>
            </div>

            {/* Slider navigation */}
            <div className="flex justify-center space-x-2.5 mt-6">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTestimonial(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${activeTestimonial === idx ? 'bg-purple-500 w-6' : 'bg-white/15'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="w-full py-24 px-6 border-b border-white/5 relative z-10 bg-[#0b0e1e]/40">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center space-x-2">
              <HelpCircle className="w-8 h-8 text-purple-400" />
              <span>Frequently Asked Questions</span>
            </h2>
            <p className="text-slate-400 text-sm font-medium">Have questions? We have detailed structural answers.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="glass-panel rounded-[20px] border border-white/5 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 flex justify-between items-center text-left hover:bg-white/5 transition-colors font-extrabold text-sm text-white"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-purple-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/5 bg-slate-950/20"
                    >
                      <p className="p-5 text-xs leading-relaxed text-slate-400 font-semibold">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full px-6 py-12 border-t border-white/5 glass-panel mt-12 text-center text-xs text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-purple-500/20 rounded-lg text-purple-400">
              <BrainCircuit className="w-4.5 h-4.5" />
            </div>
            <span className="font-extrabold text-sm text-white">SmartMatch</span>
          </div>

          <p>© 2026 Smart Internship Matching Portal. Built for hackathons & recruiter integrations.</p>

          <div className="flex space-x-6 font-bold uppercase tracking-wider text-[10px]">
            <a href="#" className="hover:text-purple-400">Privacy</a>
            <a href="#" className="hover:text-purple-400">Terms</a>
            <a href="https://github.com" target="_blank" className="hover:text-purple-400">GitHub</a>
            <a href="https://linkedin.com" target="_blank" className="hover:text-purple-400">LinkedIn</a>
          </div>
        </div>
      </footer>

      {/* QUICK VIEW POPUP MODAL */}
      <AnimatePresence>
        {quickViewJob && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg p-6 glass-panel rounded-3xl border border-white/10 shadow-2xl relative"
            >
              <button 
                onClick={() => setQuickViewJob(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-3 mb-6">
                <img src={quickViewJob.company_logo} alt={quickViewJob.company_name} className="w-12 h-12 rounded-xl object-cover border border-white/10" />
                <div>
                  <h3 className="font-extrabold text-base text-white">{quickViewJob.role}</h3>
                  <span className="text-xs text-purple-400 font-bold">{quickViewJob.company_name}</span>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <h5 className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mb-1">Description</h5>
                  <p className="leading-relaxed text-slate-300 font-semibold">{quickViewJob.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mb-1">Duration & mode</h5>
                    <p className="font-extrabold text-white">{quickViewJob.duration} ({quickViewJob.mode})</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mb-1">Stipend rate</h5>
                    <p className="font-extrabold text-teal-400">{quickViewJob.stipend}</p>
                  </div>
                </div>

                <div>
                  <h5 className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mb-1">Key skills required</h5>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {quickViewJob.skills_required.map((sk: string) => (
                      <span key={sk} className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/5 text-slate-300 text-[10px]">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-purple-500/5 rounded-2xl border border-purple-500/10 flex justify-between items-center mt-6">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">AI compatibility match</span>
                    <span className="font-black text-white text-base">{quickViewJob.matchPercentage}% Score</span>
                  </div>
                  <Link
                    href="/register"
                    onClick={() => setQuickViewJob(null)}
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-90 text-white font-extrabold uppercase text-[10px] tracking-wider rounded-xl transition-all shadow-md"
                  >
                    Apply Now
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Dummy helper
const TrophyIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"/><path d="M12 2a6 6 0 0 0-6 6v3.58a6 6 0 0 0 6 6 6 6 0 0 0 6-6V8a6 6 0 0 0-6-6z"/></svg>
);
