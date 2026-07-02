'use strict';
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { BrainCircuit, ArrowLeft, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const { register, verifyOtp } = useAuth();
  const [role, setRole] = useState<'student' | 'recruiter'>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Recruiter fields
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // OTP Screens
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [receivedOtp, setReceivedOtp] = useState('');
  const router = useRouter();

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await register({
        email,
        password,
        role,
        name,
        phone,
        companyName,
        jobTitle
      });

      // Verification transition
      setReceivedOtp(data.otp || '123456');
      setShowOtpScreen(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    setLoading(true);

    try {
      const res = await verifyOtp(email, otp);
      router.push(`/dashboard/${res.user?.role || 'student'}`);
    } catch (err: any) {
      setOtpError(err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 bg-slate-950">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-teal-500/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-lg p-8 glass-panel rounded-2xl border border-white/10 shadow-2xl relative">
        <Link href="/" className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-indigo-400 transition-colors mb-6 font-semibold">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to home</span>
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-gradient-to-tr from-indigo-500 to-teal-400 rounded-xl text-white mb-3">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold">Create Account</h2>
          <p className="text-slate-400 text-xs mt-1 font-medium">SmartMatch Internship Matching Portal</p>
        </div>

        {!showOtpScreen ? (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg font-medium">
                {error}
              </div>
            )}

            {/* Role Select tab */}
            <div className="grid grid-cols-2 gap-3 mb-6 bg-slate-900 p-1 rounded-lg border border-white/5">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`py-2 rounded-md text-xs font-bold transition-all ${
                  role === 'student' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Student Profile
              </button>
              <button
                type="button"
                onClick={() => setRole('recruiter')}
                className={`py-2 rounded-md text-xs font-bold transition-all ${
                  role === 'recruiter' ? 'bg-teal-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Recruiter Portal
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-white/10 focus:border-indigo-500 focus:outline-none text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="john.doe@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-white/10 focus:border-indigo-500 focus:outline-none text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Password</label>
              <input
                type="password"
                required
                placeholder="Password@123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-white/10 focus:border-indigo-500 focus:outline-none text-sm transition-all"
              />
            </div>

            {/* Recruiter specific inputs */}
            {role === 'recruiter' && (
              <div className="border-t border-white/5 pt-4 mt-4 grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Company Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Stripe, Vercel, Google"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-white/10 focus:border-teal-500 focus:outline-none text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Job Title</label>
                  <input
                    type="text"
                    required
                    placeholder="Talent Coordinator"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-white/10 focus:border-teal-500 focus:outline-none text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Contact Number</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 012-3456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-white/10 focus:border-teal-500 focus:outline-none text-sm transition-all"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 text-white font-semibold text-sm rounded-lg transition-all flex items-center justify-center space-x-2 ${
                role === 'student' ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-teal-500 hover:bg-teal-600'
              }`}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Create Account</span>}
            </button>

            <div className="text-center text-xs text-slate-400 pt-4">
              Already have an account? <Link href="/login" className="text-indigo-400 hover:underline font-bold">Sign In here</Link>
            </div>
          </form>
        ) : (
          /* OTP Screen */
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div className="p-3 bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 text-xs rounded-lg font-medium leading-relaxed">
              🔑 OTP Verification code sent! Your mock verification code is **{receivedOtp}**. Enter it below to activate your account.
            </div>

            {otpError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg font-medium">
                {otpError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">OTP Code</label>
              <input
                type="text"
                required
                placeholder={receivedOtp}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-white/10 focus:border-indigo-500 focus:outline-none text-sm text-center tracking-widest font-extrabold transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm rounded-lg transition-all flex items-center justify-center space-x-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Verify OTP</span>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
