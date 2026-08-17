import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { requestLoginOtp, verifyLoginOtp } from '../services/api';
import toast from 'react-hot-toast';
import { FiArrowRight, FiShield, FiPhone, FiUser } from 'react-icons/fi';

export const Login = () => {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const { setAuthSession } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!username) {
      toast.error('Username is required.');
      return;
    }
    if (!mobile || mobile.length < 10) {
      toast.error('Please enter a valid mobile number.');
      return;
    }

    try {
      setLoading(true);
      const res = await requestLoginOtp(username, mobile);
      if (res.success) {
        toast.success(res.message);
        setStep(2);
        setCooldown(30);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP.');
      return;
    }

    try {
      setLoading(true);
      const res = await verifyLoginOtp(username, mobile, otp);
      if (res.success && res.data?.token) {
        toast.success('Welcome back! 🔒');
        setAuthSession(res.data.token, res.data.user);
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    try {
      setLoading(true);
      const res = await requestLoginOtp(username, mobile);
      if (res.success) {
        toast.success('OTP resent successfully.');
        setCooldown(30);
      }
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
        <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-[var(--gold-2)] to-[var(--gold-3)] dark:from-amber-400 dark:to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 mb-6">
          <FiShield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-black text-[var(--text-primary)] dark:text-white font-heading">
          Welcome Back
        </h1>
        <p className="text-[var(--text-secondary)] dark:text-slate-400 mt-2 text-sm font-medium">
          {step === 1 ? 'Enter your credentials to access your vault.' : 'Verify your mobile number to continue.'}
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
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full pl-11 pr-4 py-3.5 bg-[var(--bg-subtle)] dark:bg-slate-950/50 border border-[var(--border-color)] dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-[var(--border-glow)] dark:focus:ring-amber-500/20 focus:border-[var(--text-gold)] dark:focus:border-amber-500 outline-none transition-all text-sm font-bold text-[var(--text-primary)] dark:text-white placeholder:font-medium placeholder:text-slate-400"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] dark:text-slate-500 ml-1">Mobile Number</label>
              </div>
              <div className="relative flex items-center">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <FiPhone className="w-4 h-4 text-slate-400" />
                  <span className="text-[var(--text-secondary)] dark:text-slate-500 font-bold text-sm">+91</span>
                  <div className="w-px h-4 bg-[var(--border-color)] dark:bg-slate-700 ml-1"></div>
                </div>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter registered number"
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
              {loading ? 'Sending OTP...' : 'Send OTP'}
              {!loading && <FiArrowRight className="w-4 h-4" />}
            </button>

            <div className="text-center pt-2">
              <Link to="/forgot-username" className="text-xs font-bold text-[var(--text-gold)] dark:text-amber-400 hover:text-amber-500 transition-colors">
                Forgot Username?
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-[var(--text-secondary)] dark:text-slate-400 font-medium">We've sent a verification code to <br/><span className="font-bold text-[var(--text-primary)] dark:text-white">+91 {maskMobile(mobile)}</span></p>
            </div>

            <div className="space-y-1.5">
              <div className="relative">
                <input
                  type="text"
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
                Change Details
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
              disabled={loading || otp.length !== 6}
              className="w-full flex items-center justify-center gap-2 bg-[var(--gold-2)] dark:bg-gradient-to-r dark:from-amber-500 dark:to-amber-600 text-[var(--text-primary)] dark:text-white py-4 rounded-xl font-bold text-sm shadow-md shadow-[var(--border-glow)] dark:hover:shadow-lg dark:hover:shadow-amber-500/20 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 font-heading"
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
          </form>
        )}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm font-medium text-[var(--text-secondary)] dark:text-slate-400">
          New to the vault?{' '}
          <Link to="/register" className="font-bold text-[var(--text-gold)] dark:text-amber-400 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
