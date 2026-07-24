'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { Key, Mail, Sparkles, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const router = useRouter();
  const { setUser } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState(1);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        toast.success(`Welcome back, ${data.user.name}!`);
        router.push('/dashboard');
      } else {
        toast.error(data.error || 'Authentication failed');
      }
    } catch (e) {
      toast.error('An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    setEmail('admin@crm.com');
    setPassword('admin123');
    toast.success('Demo credentials filled!');
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (forgotStep === 1) {
      if (!forgotEmail) { toast.error('Please enter your email'); return; }
      toast.success('OTP sent! (Test OTP: 1234)');
      setForgotStep(2);
    } else if (forgotStep === 2) {
      if (otp !== '1234') { toast.error('Invalid OTP. Use 1234'); return; }
      if (!newPassword || newPassword.length < 6) { toast.error('Password must be 6+ characters'); return; }
      toast.success('Password reset successfully!');
      setForgotStep(3);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4 py-10">
      
      {/* Background floating blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-sky-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float" style={{ animationDelay: '1.5s' }} />

      <div className="relative z-10 w-full max-w-sm">
        
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0071e3] text-white font-extrabold text-3xl shadow-lg shadow-blue-200 mb-4 animate-float">
            D
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">DevSamp CRM</h1>
          <p className="text-sm text-gray-500 mt-1">Manage Leads. Close Deals. Grow Faster.</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-blue-100/50 border border-blue-100/80 overflow-hidden">
          
          {/* Card Header */}
          <div className="px-8 pt-8 pb-4">
            <h2 className="text-lg font-bold text-gray-900">Welcome back</h2>
            <p className="text-xs text-gray-500 mt-0.5">Sign in to your CRM account</p>
          </div>

          {/* Demo Access Button */}
          <div className="px-8 pb-4">
            <button
              type="button"
              onClick={handleQuickFill}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/60 hover:bg-blue-100/60 text-sm font-semibold text-[#0071e3] transition-all duration-200 hover:border-blue-300"
            >
              <Sparkles className="w-4 h-4" />
              <span>One-Click Demo Access</span>
            </button>
          </div>

          <div className="flex items-center gap-3 px-8 pb-4">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Or sign in manually</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="px-8 pb-8 space-y-4">
            {/* Email */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 transition-all focus:bg-white focus:border-[#0071e3] focus:ring-3 focus:ring-blue-100 outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Password</label>
                <button
                  type="button"
                  onClick={() => { setForgotStep(1); setForgotEmail(''); setOtp(''); setNewPassword(''); setShowForgotModal(true); }}
                  className="text-[11px] font-semibold text-[#0071e3] hover:text-blue-700 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 transition-all focus:bg-white focus:border-[#0071e3] focus:ring-3 focus:ring-blue-100 outline-none"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0071e3] hover:bg-blue-600 active:bg-blue-700 text-white py-3 rounded-xl text-sm font-bold shadow-md shadow-blue-200 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : 'Sign In →'}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-gray-400 mt-6">
          © 2026 DevSamp Sales CRM · All rights reserved
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/20 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl border border-gray-100 space-y-4 animate-slide-up">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">
                {forgotStep === 1 && 'Reset Password'}
                {forgotStep === 2 && 'Enter OTP'}
                {forgotStep === 3 && 'Success!'}
              </h3>
              <button onClick={() => setShowForgotModal(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
            </div>

            <form onSubmit={handleForgotSubmit} className="space-y-3">
              {forgotStep === 1 && (
                <>
                  <p className="text-xs text-gray-500">Enter your email to receive an OTP reset code.</p>
                  <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="your@email.com" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:border-[#0071e3] outline-none transition-all" />
                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => setShowForgotModal(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-all">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-[#0071e3] text-white rounded-lg text-xs font-semibold hover:bg-blue-600 transition-all">Send OTP</button>
                  </div>
                </>
              )}
              {forgotStep === 2 && (
                <>
                  <p className="text-xs text-gray-500">Enter code <strong className="text-gray-800">1234</strong> (demo) and your new password.</p>
                  <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:border-[#0071e3] outline-none transition-all" />
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New Password (6+ chars)" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:border-[#0071e3] outline-none transition-all" />
                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => setForgotStep(1)} className="px-4 py-2 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-all">Back</button>
                    <button type="submit" className="px-4 py-2 bg-[#0071e3] text-white rounded-lg text-xs font-semibold hover:bg-blue-600 transition-all">Reset</button>
                  </div>
                </>
              )}
              {forgotStep === 3 && (
                <div className="text-center py-4 space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <p className="text-xs text-gray-500">Password reset successfully! You can now sign in with your new password.</p>
                  <button type="button" onClick={() => setShowForgotModal(false)} className="px-6 py-2 bg-[#0071e3] text-white rounded-lg text-xs font-semibold hover:bg-blue-600 transition-all">Done</button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
