import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { requestRegisterOtp, verifyRegisterOtp, verifyRegisterMsg91 } from '../services/api';
import { initSendOtpWidget, sendOtpViaWidget, verifyOtpViaWidget, retryOtpViaWidget } from '../utils/msg91Otp';
import toast from 'react-hot-toast';
import { FiArrowRight, FiShield, FiPhone, FiUser } from 'react-icons/fi';

export const Register = () => {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const { setAuthSession } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    initSendOtpWidget();
  }, []);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!username || username.length < 3) {
      toast.error('Username must be at least 3 characters.');
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email.');
      return;
    }
    if (!password || password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    const cleanMobile = mobile.replace(/\D/g, '').replace(/^0+/, '');
    if (!cleanMobile || cleanMobile.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number.');
      return;
    }

    try {
      setLoading(true);
      // 1. Trigger MSG91 widget sendOtp (delivers physical SMS via widget DLT template)
      await sendOtpViaWidget(cleanMobile);

      // 2. Also sync with backend
      await requestRegisterOtp(username, cleanMobile).catch(() => {});

      toast.success('OTP sent successfully to your mobile via MSG91.');
      setStep(2);
      setCooldown(60);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const cleanOtp = String(otp || '').trim();
    if (!cleanOtp || cleanOtp.length < 4) {
      toast.error('Please enter the 6-digit OTP.');
      return;
    }

    try {
      setLoading(true);
      const cleanMobile = mobile.replace(/\D/g, '').replace(/^0+/, '');

      // Step 1: Verify with MSG91 Web SDK to acquire Access Token (with 3s timeout)
      let msg91Token = null;
      try {
        const widgetResult = await Promise.race([
          verifyOtpViaWidget(cleanMobile, cleanOtp),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000))
        ]);
        msg91Token = widgetResult?.accessToken;
      } catch (widgetErr) {
        console.warn('[MSG91 Widget Verify Fallback]:', widgetErr.message);
      }

      let res;
      if (msg91Token) {
        res = await verifyRegisterMsg91({
          username,
          email,
          password,
          mobile: cleanMobile,
          accessToken: msg91Token,
        });
      } else {
        res = await verifyRegisterOtp(username, email, password, cleanMobile, cleanOtp);
      }

      if (res.success && res.data?.token) {
        toast.success('Account verified & created! 🎉');
        setAuthSession(res.data.token, res.data.user);
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Invalid OTP. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    try {
      setLoading(true);
      const cleanMobile = mobile.replace(/\D/g, '').replace(/^0+/, '');
      await retryOtpViaWidget(cleanMobile);
      await requestRegisterOtp(username, cleanMobile).catch(() => {});
      toast.success('OTP resent to your mobile via MSG91.');
      setCooldown(60);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  const maskMobile = (num) => {
    if (!num) return '';
    const str = String(num);
    if (str.length < 4) return str;
    return `******${str.slice(-4)}`;
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center max-w-sm mx-auto px-4 py-8 animate-in fade-in duration-300">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-[var(--gold-2)] to-[var(--gold-3)] dark:from-amber-400 dark:to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 mb-6 rotate-3">
          <FiShield className="w-8 h-8 text-white -rotate-3" />
        </div>
        <h1 className="text-3xl font-black text-[var(--text-primary)] dark:text-white font-heading">
          Create Your Vault
        </h1>
        <p className="text-[var(--text-secondary)] dark:text-slate-400 mt-2 text-sm font-medium">
          {step === 1 ? 'Start tracking your physical assets securely.' : 'Verify your mobile number to continue.'}
        </p>
      </div>

      <div className="bg-[var(--bg-card)] dark:bg-slate-900/80 p-6 rounded-[24px] border border-[var(--border-color)] dark:border-slate-800 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-none">
        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] dark:text-slate-500 ml-1">Username</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  name="username"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  className="w-full pl-11 pr-4 py-3.5 bg-[var(--bg-subtle)] dark:bg-slate-950/50 border border-[var(--border-color)] dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-[var(--border-glow)] dark:focus:ring-amber-500/20 focus:border-[var(--text-gold)] dark:focus:border-amber-500 outline-none transition-all text-sm font-bold text-[var(--text-primary)] dark:text-white placeholder:font-medium placeholder:text-slate-400"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] dark:text-slate-500 ml-1">Email</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3.5 bg-[var(--bg-subtle)] dark:bg-slate-950/50 border border-[var(--border-color)] dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-[var(--border-glow)] dark:focus:ring-amber-500/20 focus:border-[var(--text-gold)] dark:focus:border-amber-500 outline-none transition-all text-sm font-bold text-[var(--text-primary)] dark:text-white placeholder:font-medium placeholder:text-slate-400"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] dark:text-slate-500 ml-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 bg-[var(--bg-subtle)] dark:bg-slate-950/50 border border-[var(--border-color)] dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-[var(--border-glow)] dark:focus:ring-amber-500/20 focus:border-[var(--text-gold)] dark:focus:border-amber-500 outline-none transition-all text-sm font-bold text-[var(--text-primary)] dark:text-white placeholder:font-medium placeholder:text-slate-400"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] dark:text-slate-500 ml-1">Mobile Number</label>
              <div className="relative flex items-center">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <FiPhone className="w-4 h-4 text-slate-400" />
                  <span className="text-[var(--text-secondary)] dark:text-slate-500 font-bold text-sm">+91</span>
                  <div className="w-px h-4 bg-[var(--border-color)] dark:bg-slate-700 ml-1"></div>
                </div>
                <input
                  type="tel"
                  name="tel"
                  autoComplete="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 10-digit number"
                  maxLength="10"
                  className="w-full pl-[88px] pr-4 py-3.5 bg-[var(--bg-subtle)] dark:bg-slate-950/50 border border-[var(--border-color)] dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-[var(--border-glow)] dark:focus:ring-amber-500/20 focus:border-[var(--text-gold)] dark:focus:border-amber-500 outline-none transition-all text-sm font-bold tracking-wide text-[var(--text-primary)] dark:text-white placeholder:font-medium placeholder:text-slate-400 placeholder:tracking-normal"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[var(--gold-2)] dark:bg-gradient-to-r dark:from-white dark:to-slate-100 text-[var(--text-primary)] dark:text-slate-900 py-4 rounded-xl font-bold text-sm hover:shadow-[0_4px_14px_rgba(217,154,0,0.3)] dark:hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 font-heading mt-2"
            >
              {loading ? 'Sending OTP...' : 'Continue'}
              {!loading && <FiArrowRight className="w-4 h-4" />}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-[var(--text-secondary)] dark:text-slate-400 font-medium">Code sent to <span className="font-bold text-[var(--text-primary)] dark:text-white">+91 {maskMobile(mobile)}</span></p>
            </div>

            <div className="space-y-1.5">
              <div className="relative">
                <input
                  type="text"
                  name="otp"
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="_ _ _ _ _ _"
                  className="w-full px-4 py-4 bg-[var(--bg-subtle)] dark:bg-slate-950/50 border border-[var(--border-color)] dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-[var(--border-glow)] dark:focus:ring-amber-500/20 focus:border-[var(--text-gold)] dark:focus:border-amber-500 outline-none transition-all text-2xl font-black text-center tracking-[0.5em] text-[var(--text-primary)] dark:text-white placeholder:tracking-normal"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
              >
                Change Number
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={cooldown > 0 || loading}
                className="text-xs font-bold text-[var(--text-gold)] dark:text-amber-400 disabled:text-[var(--text-muted)] dark:disabled:text-slate-400 transition-colors"
              >
                {cooldown > 0 ? `Resend OTP in 00:${cooldown.toString().padStart(2, '0')}` : 'Resend OTP'}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 4}
              className="w-full flex items-center justify-center gap-2 bg-[var(--gold-2)] dark:bg-gradient-to-r dark:from-amber-500 dark:to-amber-600 text-[var(--text-primary)] dark:text-white py-4 rounded-xl font-bold text-sm shadow-md shadow-[var(--border-glow)] dark:hover:shadow-lg dark:hover:shadow-amber-500/20 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 font-heading"
            >
              {loading ? 'Verifying...' : 'Verify & Create Account'}
            </button>
          </form>
        )}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm font-medium text-[var(--text-secondary)] dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-[var(--text-gold)] dark:text-amber-400 hover:underline">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
