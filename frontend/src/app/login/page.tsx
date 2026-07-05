'use strict';
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { BrainCircuit, ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login, verifyOtp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // OTP Verification state if not verified
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const router = useRouter();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      // Success - Redirect based on role
      router.push(`/dashboard/${res.user?.role || 'student'}`);
    } catch (err: any) {
      if (err.message?.includes('not verified') || err.message?.includes('verified: false')) {
        setShowOtpScreen(true);
      } else {
        setError(err.message || 'Invalid email or password.');
      }
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
      setOtpError(err.message || 'Verification failed. Please check the OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 bg-slate-950">
      {/* Background circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-teal-500/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md p-8 glass-panel rounded-2xl border border-white/10 shadow-2xl relative">
        <Link href="/" className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-indigo-400 transition-colors mb-6 font-semibold">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to home</span>
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-gradient-to-tr from-indigo-500 to-teal-400 rounded-xl text-white mb-3">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold">Welcome Back</h2>
          <p className="text-slate-400 text-xs mt-1 font-medium">SmartMatch Internship Matching Portal</p>
        </div>

        {/* 1. LOGIN SCREEN */}
        {!showOtpScreen ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                required
                placeholder="student@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-white/10 focus:border-indigo-500 focus:outline-none text-sm transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
                <Link href="/forgot-password" className="text-xs text-indigo-400 hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-white/10 focus:border-indigo-500 focus:outline-none text-sm transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm rounded-lg transition-all flex items-center justify-center space-x-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In</span>}
            </button>

            <div className="text-center text-xs text-slate-400 pt-4">
              Don&apos;t have an account? <Link href="/register" className="text-indigo-400 hover:underline font-bold">Register here</Link>
            </div>
          </form>
        ) : (
          /* 2. OTP VERIFICATION OVERLAY SCREEN */
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div className="p-3 bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 text-xs rounded-lg font-medium leading-relaxed">
              ⚠️ Your account is registered but email verification is pending. Enter the OTP code sent to your email to verify. (For testing, enter **123456**)
            </div>

            {otpError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg font-medium">
                {otpError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Enter OTP Code</label>
              <input
                type="text"
                required
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-white/10 focus:border-indigo-500 focus:outline-none text-sm text-center tracking-widest font-extrabold transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold text-sm rounded-lg transition-all flex items-center justify-center space-x-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Verify Account</span>}
            </button>

            <button
              type="button"
              onClick={() => setShowOtpScreen(false)}
              className="w-full py-2 bg-slate-900 text-slate-400 text-xs rounded-lg hover:text-white transition-colors"
            >
              Back to Sign In
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
