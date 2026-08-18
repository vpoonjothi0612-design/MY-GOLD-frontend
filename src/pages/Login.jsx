import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/api';
import toast from 'react-hot-toast';
import { FiArrowRight, FiShield, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { setAuthSession } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Username and password are required.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(username, password);
      if (res.success && res.data?.token) {
        toast.success('Welcome back! 🔒');
        setAuthSession(res.data.token, res.data.user);
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
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
          Enter your credentials to access your vault.
        </p>
      </div>

      <div className="bg-[var(--bg-card)] dark:bg-slate-900/80 p-6 rounded-[24px] border border-[var(--border-color)] dark:border-slate-800 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-none">
        <form onSubmit={handleLogin} className="space-y-5">
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
                placeholder="Enter your username"
                className="w-full pl-11 pr-4 py-3.5 bg-[var(--bg-subtle)] dark:bg-slate-950/50 border border-[var(--border-color)] dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-[var(--border-glow)] dark:focus:ring-amber-500/20 focus:border-[var(--text-gold)] dark:focus:border-amber-500 outline-none transition-all text-sm font-bold text-[var(--text-primary)] dark:text-white placeholder:font-medium placeholder:text-slate-400"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] dark:text-slate-500 ml-1">Password</label>
            </div>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-11 pr-11 py-3.5 bg-[var(--bg-subtle)] dark:bg-slate-950/50 border border-[var(--border-color)] dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-[var(--border-glow)] dark:focus:ring-amber-500/20 focus:border-[var(--text-gold)] dark:focus:border-amber-500 outline-none transition-all text-sm font-bold text-[var(--text-primary)] dark:text-white placeholder:font-medium placeholder:text-slate-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[var(--text-gold)] transition-colors"
              >
                {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center pt-1">
            <Link to="/forgot-username" className="text-xs font-bold text-[var(--text-secondary)] dark:text-slate-400 hover:text-[var(--text-gold)] transition-colors">
              Forgot Username?
            </Link>
            <Link to="/forgot-password" className="text-xs font-bold text-[var(--text-gold)] dark:text-amber-400 hover:text-amber-500 transition-colors">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[var(--gold-2)] dark:bg-gradient-to-r dark:from-amber-500 dark:to-amber-600 text-[var(--text-primary)] dark:text-white py-4 rounded-xl font-bold text-sm shadow-md shadow-[var(--border-glow)] dark:hover:shadow-lg dark:hover:shadow-amber-500/20 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 font-heading mt-4"
          >
            {loading ? 'Signing in...' : 'Login'}
            {!loading && <FiArrowRight className="w-4 h-4" />}
          </button>
        </form>
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
