'use strict';
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BrainCircuit, ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      // Simulate API call for resetting password
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMessage('If an account exists with that email, a password reset link has been sent.');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 bg-slate-950">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-teal-500/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md p-8 glass-panel rounded-2xl border border-white/10 shadow-2xl relative">
        <Link href="/login" className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-indigo-400 transition-colors mb-6 font-semibold">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to login</span>
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-gradient-to-tr from-indigo-500 to-teal-400 rounded-xl text-white mb-3">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold">Reset Password</h2>
          <p className="text-slate-400 text-xs mt-1 font-medium">Enter your email and new password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg font-medium">
              {error}
            </div>
          )}
          {message && (
            <div className="p-3 bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs rounded-lg font-medium">
              {message}
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
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Reset Password</span>}
          </button>
        </form>
      </div>
    </div>
  );
}
