'use strict';
'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { motion } from 'framer-motion';
import { Sparkles, Briefcase, GraduationCap, ShieldCheck, Sun, Moon, ArrowRight, BrainCircuit, LineChart, CodeXml, MessageSquareShare } from 'lucide-react';

export default function LandingPage() {
  const { mockLogin, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-between">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-500/10 blur-[120px] pointer-events-none" />

      {/* 1. HEADER */}
      <header className="sticky top-0 z-50 w-full px-6 py-4 glass-panel border-b border-indigo-500/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-tr from-indigo-500 to-teal-400 rounded-lg text-white">
              <BrainCircuit className="w-6 h-6 animate-pulse" />
            </div>
            <span className="font-extrabold text-xl bg-gradient-to-r from-indigo-500 to-teal-400 bg-clip-text text-transparent">
              SmartMatch
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <a href="#features" className="hover:text-indigo-400 transition-colors">Features</a>
            <a href="#demo" className="hover:text-indigo-400 transition-colors">Quick Demo</a>
            <a href="#how-it-works" className="hover:text-indigo-400 transition-colors">How It Works</a>
          </nav>

          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 transition-colors"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {user ? (
              <Link 
                href={`/dashboard/${user.role}`}
                className="px-4 py-2 text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg shadow-lg hover:shadow-indigo-500/20 transition-all flex items-center space-x-1"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-semibold hover:text-indigo-400 transition-colors">
                  Sign In
                </Link>
                <Link 
                  href="/register" 
                  className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-teal-500 hover:from-indigo-600 hover:to-teal-600 rounded-lg shadow-lg hover:shadow-indigo-500/20 transition-all"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <main className="flex-grow max-w-7xl mx-auto px-6 py-12 md:py-24 grid md:grid-cols-2 gap-12 items-center relative">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-6"
        >
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Driven Hiring Platform</span>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight"
          >
            Bridge The Gap Between{' '}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-400 bg-clip-text text-transparent">
              Talent & Opportunity
            </span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-base md:text-lg text-slate-400 font-medium leading-relaxed"
          >
            An intelligent portal connecting students with internships using resume parsing, ATS scoring, candidate ranking, and career chatbot coaching.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pt-4"
          >
            <Link 
              href="/register" 
              className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/25 transition-all text-center flex items-center justify-center space-x-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a 
              href="#demo" 
              className="px-6 py-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-semibold rounded-lg transition-all text-center"
            >
              Try Instant Demo
            </a>
          </motion.div>
        </motion.div>

        {/* Visual Card / Glassmorphism Deck */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative flex justify-center items-center"
        >
          <div className="w-full max-w-md p-6 glass-panel rounded-2xl relative shadow-2xl overflow-hidden border border-white/10">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-400/20 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-indigo-500/10 pb-4 mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Alex Rivera</h4>
                  <p className="text-xs text-slate-400 font-medium">B.Tech Computer Science</p>
                </div>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-extrabold">
                92% AI Match
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1 font-semibold">
                  <span>ATS Resume Score</span>
                  <span className="text-indigo-400 font-bold">88/100</span>
                </div>
                <div className="w-full h-2 bg-indigo-500/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-teal-400 rounded-full" style={{ width: '88%' }} />
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400">React</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400">Next.js</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400">TypeScript</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400">Tailwind</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/10 text-teal-400">Node.js</span>
              </div>

              <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 text-xs text-slate-400 leading-relaxed font-medium">
                🎯 **AI Match Insight**: Candidate possesses 4/4 required skills for the Frontend position and has relevant dashboard projects.
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* 3. DEMO SELECTION (THE BYPASS TRICK) */}
      <section id="demo" className="w-full max-w-7xl mx-auto px-6 py-16 border-t border-indigo-500/10">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
          <h2 className="text-3xl font-extrabold">Instant Developer Sandbox</h2>
          <p className="text-slate-400 text-sm font-medium">
            Skip registration screens and preview the platform dashboards immediately. Select a role below to launch the sandbox.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Student Bypass */}
          <div className="p-6 glass-panel rounded-2xl flex flex-col justify-between items-center text-center glass-panel-hover group">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Student Sandbox</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed font-medium">
              View matching jobs, parser analytics, check ATS score checklist, and chat with the Career Counselor Bot.
            </p>
            <button 
              onClick={() => mockLogin('student')}
              className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm rounded-lg transition-all"
            >
              Login as Student
            </button>
          </div>

          {/* Recruiter Bypass */}
          <div className="p-6 glass-panel rounded-2xl flex flex-col justify-between items-center text-center glass-panel-hover group">
            <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center mb-4 text-teal-400 group-hover:bg-teal-500 group-hover:text-white transition-all">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Recruiter Sandbox</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed font-medium">
              Post listings, filter applicants sorted by AI compatibility score, and generate customized interview questions.
            </p>
            <button 
              onClick={() => mockLogin('recruiter')}
              className="w-full py-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold text-sm rounded-lg transition-all"
            >
              Login as Recruiter
            </button>
          </div>

          {/* Admin Bypass */}
          <div className="p-6 glass-panel rounded-2xl flex flex-col justify-between items-center text-center glass-panel-hover group">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-4 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Admin Sandbox</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed font-medium">
              Approve recruiter companies, moderate jobs database, audit system activity, and view global metric charts.
            </p>
            <button 
              onClick={() => mockLogin('admin')}
              className="w-full py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold text-sm rounded-lg transition-all"
            >
              Login as Admin
            </button>
          </div>
        </div>
      </section>

      {/* 4. FEATURES GRID */}
      <section id="features" className="w-full bg-slate-900/40 border-t border-indigo-500/10 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl font-extrabold tracking-tight">AI Matching Architecture</h2>
            <p className="text-slate-400 text-sm font-medium">
              Our custom NLP engines evaluate data models across key pillars to optimize candidates placement rates.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="p-6 glass-panel rounded-xl space-y-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <CodeXml className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base">ATS Grader</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Scans structural gaps, missing key terms, formatting issues, and provides interactive roadmap recommendations.
              </p>
            </div>

            <div className="p-6 glass-panel rounded-xl space-y-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <LineChart className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base">Candidate Ranking</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Ranks applicants instantly using skill intersections, CGPA thresholds, and quantitative projects checks.
              </p>
            </div>

            <div className="p-6 glass-panel rounded-xl space-y-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <MessageSquareShare className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base">Career Assistant</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Our chatbot counselor evaluates candidate profile context to suggest roadmap tutorials and mock coding topics.
              </p>
            </div>

            <div className="p-6 glass-panel rounded-xl space-y-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base">Interview Gen</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Automatically designs technical, coding, HR, and behavioral tasks specific to the recruiter’s job listings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full px-6 py-8 border-t border-indigo-500/10 glass-panel mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p>© 2026 Smart Internship Matching Portal. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-indigo-400">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-400">Terms of Service</a>
            <a href="#" className="hover:text-indigo-400">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
