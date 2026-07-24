'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { Key, Mail, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const router = useRouter();
  const { setUser } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Forgot password flow states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP, 3: Success

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

  const handleQuickFill = (roleEmail, rolePassword) => {
    setEmail(roleEmail);
    setPassword(rolePassword);
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (forgotStep === 1) {
      if (!forgotEmail) {
        toast.error('Please enter your email');
        return;
      }
      toast.success('OTP sent to ' + forgotEmail + ' (Mock OTP: 1234)');
      setForgotStep(2);
    } else if (forgotStep === 2) {
      if (otp !== '1234') {
        toast.error('Invalid OTP. Use "1234" for mock testing');
        return;
      }
      if (!newPassword || newPassword.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
      toast.success('Password reset successfully!');
      setForgotStep(3);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f3f4f6] dark:bg-[#0b0f17] px-4">
      <div className="w-full max-w-md overflow-hidden bg-white dark:bg-[#131b26] rounded-3xl shadow-xl border border-neutral-100 dark:border-neutral-800">
        
        {/* Header Block */}
        <div className="p-8 pb-4 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 dark:bg-sky-500 text-white font-bold text-2xl shadow-md mb-4 animate-bounce">
            D
          </div>
          <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-50 tracking-tight">
            Sign in to DevSamp
          </h2>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
            Manage Leads. Close More Deals. Grow Faster.
          </p>
        </div>

        {/* Quick Credentials Block */}
        <div className="px-8 pb-4">
          <p className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">
            Quick fill credentials
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button 
              type="button"
              onClick={() => handleQuickFill('admin@crm.com', 'admin123')}
              className="px-2 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-[10px] font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[#1a2330] transition-all"
            >
              Super Admin
            </button>
            <button 
              type="button"
              onClick={() => handleQuickFill('manager@crm.com', 'manager123')}
              className="px-2 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-[10px] font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[#1a2330] transition-all"
            >
              Sales Manager
            </button>
            <button 
              type="button"
              onClick={() => handleQuickFill('executive@crm.com', 'executive123')}
              className="px-2 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-[10px] font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[#1a2330] transition-all"
            >
              Executive
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="px-8 pb-8 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" 
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#1c2635] text-xs text-neutral-800 dark:text-neutral-100 focus:bg-white dark:focus:bg-[#131b26] transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Password
              </label>
              <button 
                type="button"
                onClick={() => {
                  setForgotStep(1);
                  setForgotEmail('');
                  setOtp('');
                  setNewPassword('');
                  setShowForgotModal(true);
                }}
                className="text-[10px] text-blue-600 dark:text-sky-400 hover:underline font-semibold"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <Key className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#1c2635] text-xs text-neutral-800 dark:text-neutral-100 focus:bg-white dark:focus:bg-[#131b26] transition-all"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input 
              id="remember" 
              type="checkbox" 
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 bg-neutral-50 border-neutral-300 dark:bg-[#1c2635] dark:border-neutral-800"
            />
            <label htmlFor="remember" className="ml-2 text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">
              Remember me on this device
            </label>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white dark:text-[#0b0f17] py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>

      {/* Forgot Password Flow Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/45 backdrop-blur-xs">
          <div className="w-full max-w-sm overflow-hidden bg-white dark:bg-[#131b26] border border-neutral-100 dark:border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-50">
              {forgotStep === 1 && 'Reset Password'}
              {forgotStep === 2 && 'Verify Code'}
              {forgotStep === 3 && 'Success!'}
            </h3>
            
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              {forgotStep === 1 && (
                <>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    Enter your email address and we'll send you an OTP to reset your credentials.
                  </p>
                  <input 
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs dark:bg-[#1c2635]"
                  />
                  <div className="flex gap-2 justify-end">
                    <button 
                      type="button" 
                      onClick={() => setShowForgotModal(false)}
                      className="px-3 py-1.5 rounded-lg border border-neutral-200 text-[10px] dark:border-neutral-800"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px]"
                    >
                      Send OTP
                    </button>
                  </div>
                </>
              )}

              {forgotStep === 2 && (
                <>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    We sent a code to your inbox. Enter <strong>1234</strong> to verify and enter a new password.
                  </p>
                  <input 
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP (e.g. 1234)"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs dark:bg-[#1c2635]"
                  />
                  <input 
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password (min 6 chars)"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs dark:bg-[#1c2635]"
                  />
                  <div className="flex gap-2 justify-end">
                    <button 
                      type="button" 
                      onClick={() => setForgotStep(1)}
                      className="px-3 py-1.5 rounded-lg border border-neutral-200 text-[10px] dark:border-neutral-800"
                    >
                      Back
                    </button>
                    <button 
                      type="submit"
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px]"
                    >
                      Reset Password
                    </button>
                  </div>
                </>
              )}

              {forgotStep === 3 && (
                <div className="text-center py-4 space-y-3">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                    Your password has been successfully reset. You can now log in.
                  </p>
                  <button 
                    type="button" 
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-[10px]"
                  >
                    Close
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
