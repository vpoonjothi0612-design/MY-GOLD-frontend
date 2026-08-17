import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  FiLogOut,
  FiShield,
  FiChevronRight,
  FiUser,
  FiLock,
  FiBell,
  FiAward,
  FiPhone,
  FiX
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getAssets, requestChangeMobileOtp, verifyChangeMobileOtp } from '../services/api';

export const Profile = () => {
  const { user, setAuthSession, logout } = useAuth();
  const navigate = useNavigate();
  
  const [assetCount, setAssetCount] = useState(0);
  const [loadingAssets, setLoadingAssets] = useState(true);

  // Change Mobile State
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [mobileStep, setMobileStep] = useState(1);
  const [newMobile, setNewMobile] = useState('');
  const [mobileOtp, setMobileOtp] = useState('');
  const [mobileLoading, setMobileLoading] = useState(false);

  useEffect(() => {
    const fetchAssetCount = async () => {
      try {
        setLoadingAssets(true);
        // We only need the count, so limit 1 is fine if the API supports it, 
        // but just getting all purchases is safe enough for small portfolios
        const response = await getAssets();
        const count = response?.data?.length || response?.length || 0;
        setAssetCount(count);
      } catch (error) {
        console.error("Failed to fetch asset count", error);
        setAssetCount(0);
      } finally {
        setLoadingAssets(false);
      }
    };
    fetchAssetCount();
  }, []);

  const handleRequestChangeMobile = async (e) => {
    e.preventDefault();
    if (!newMobile || newMobile.length < 10) return toast.error('Enter a valid mobile number');
    try {
      setMobileLoading(true);
      const res = await requestChangeMobileOtp(newMobile);
      if (res.success) {
        toast.success('OTP sent to new mobile');
        setMobileStep(2);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request OTP');
    } finally {
      setMobileLoading(false);
    }
  };

  const handleVerifyChangeMobile = async (e) => {
    e.preventDefault();
    if (!mobileOtp || mobileOtp.length !== 6) return toast.error('Enter a 6-digit OTP');
    try {
      setMobileLoading(true);
      const res = await verifyChangeMobileOtp(newMobile, mobileOtp);
      if (res.success) {
        toast.success('Mobile number updated successfully');
        setShowMobileModal(false);
        setMobileStep(1);
        setNewMobile('');
        setMobileOtp('');
        window.location.reload(); // Quick refresh to update Context
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to verify OTP');
    } finally {
      setMobileLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Successfully locked vault and logged out 🔒');
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'G';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const isFreePlan = user?.plan !== 'paid';
  const MAX_FREE_ASSETS = 10;
  const progressPercentage = isFreePlan ? Math.min((assetCount / MAX_FREE_ASSETS) * 100, 100) : 100;

  return (
    <div className="max-w-md mx-auto space-y-6 pb-24 md:pb-12 animate-in fade-in duration-300">
      
      {/* 1. Header Profile Section */}
      <div className="flex flex-col items-center justify-center text-center space-y-4 pt-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[var(--gold-2)] via-[var(--gold-3)] to-[var(--gold-4)] dark:from-amber-400 dark:via-amber-500 dark:to-amber-600 text-[var(--text-primary)] dark:text-slate-950 flex items-center justify-center font-heading font-black text-3xl shadow-[0_4px_14px_rgba(217,154,0,0.3)] dark:shadow-xl dark:shadow-amber-500/20">
            {getInitials(user?.username || user?.name)}
          </div>
          <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-[var(--profit-green)] dark:bg-emerald-500 border-2 border-[var(--bg-main)] dark:border-slate-900 flex items-center justify-center text-white text-[10px] shadow-sm">
            ✓
          </div>
        </div>
        
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)] dark:text-white font-heading">
            {user?.username || user?.name || 'Vault Member'}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] dark:text-slate-400 font-medium">
            {user?.email || 'N/A'}
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--profit-green)]/10 dark:bg-emerald-500/10 text-[var(--profit-green)] dark:text-emerald-400 border border-[var(--profit-green)]/20 dark:border-emerald-500/20 text-xs font-bold font-heading">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--profit-green)] dark:bg-emerald-500 animate-pulse"></span>
            Account Verified
          </div>
        </div>
      </div>

      {/* 2. Account Details */}
      <div className="bg-[var(--bg-card)] dark:bg-slate-900/80 rounded-3xl border border-[var(--border-color)] dark:border-slate-800/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] dark:shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border-color)] dark:border-slate-800/80">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)] dark:text-slate-400 font-heading">
            Account Information
          </h2>
        </div>
        <div className="divide-y divide-[var(--border-color)] dark:divide-slate-800/80">
          <div className="px-5 py-3 flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--text-secondary)] dark:text-slate-400">Username</span>
            <span className="text-sm font-bold text-[var(--text-primary)] dark:text-white">{user?.username || user?.name}</span>
          </div>
          <div className="px-5 py-3 flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--text-secondary)] dark:text-slate-400">Email</span>
            <span className="text-sm font-bold text-[var(--text-primary)] dark:text-white">{user?.email || 'N/A'}</span>
          </div>
          <div className="px-5 py-3 flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--text-secondary)] dark:text-slate-400">Mobile Number</span>
            <span className="text-sm font-bold text-[var(--text-primary)] dark:text-white">{user?.phone ? `+91 ${user.phone}` : 'Not Linked'}</span>
          </div>
          <div className="px-5 py-3 flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--text-secondary)] dark:text-slate-400">Member Since</span>
            <span className="text-sm font-bold text-[var(--text-primary)] dark:text-white">{formatDate(user?.created_at || user?.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* 3. Your Plan */}
      <div className="bg-[var(--bg-card)] dark:bg-slate-900/80 rounded-3xl border border-[var(--border-color)] dark:border-slate-800/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] dark:shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border-color)] dark:border-slate-800/80 flex items-center justify-between">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)] dark:text-slate-400 font-heading flex items-center gap-2">
            <FiAward className="w-4 h-4 text-[var(--text-gold)] dark:text-amber-500" />
            Your Plan
          </h2>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--bg-subtle)] dark:bg-slate-800 text-[var(--text-secondary)] dark:text-slate-300">
            {isFreePlan ? 'Free Tier' : 'Premium Vault Pro'}
          </span>
        </div>
        
        <div className="p-5 space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm font-bold text-[var(--text-primary)] dark:text-white font-heading">
                Vault Capacity
              </p>
              <p className="text-xs text-[var(--text-secondary)] dark:text-slate-400 mt-0.5">
                {isFreePlan ? 'Track up to 10 physical assets.' : 'Unlimited physical assets tracking.'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-[var(--text-gold)] dark:text-amber-400 font-heading">
                {loadingAssets ? '...' : assetCount}
              </span>
              {isFreePlan && (
                <span className="text-xs text-[var(--text-muted)] dark:text-slate-400 font-medium"> / {MAX_FREE_ASSETS}</span>
              )}
            </div>
          </div>

          {isFreePlan && (
            <div className="space-y-1.5">
              <div className="w-full h-2.5 bg-[var(--bg-subtle)] dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[var(--gold-2)] to-[var(--gold-3)] dark:from-amber-400 dark:to-amber-500 transition-all duration-700 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-[10px] font-medium text-[var(--text-muted)] dark:text-slate-400 text-right">
                {MAX_FREE_ASSETS - assetCount} assets remaining
              </p>
            </div>
          )}

          {isFreePlan && (
            <button 
              onClick={() => navigate('/subscription')}
              className="w-full py-3 rounded-xl bg-[var(--gold-2)] dark:bg-slate-800 text-[var(--text-primary)] dark:text-white font-bold text-sm transition-all shadow-[0_4px_14px_rgba(217,154,0,0.3)] dark:shadow-md font-heading hover:-translate-y-0.5"
            >
              Upgrade to Premium
            </button>
          )}
        </div>
      </div>

      {/* 4. Security Notice */}
      <div className="p-5 rounded-3xl bg-[var(--gold-1)]/10 dark:bg-amber-500/5 border border-[var(--gold-2)]/30 dark:border-amber-500/20 flex gap-4">
        <div className="w-10 h-10 shrink-0 rounded-2xl bg-[var(--gold-1)]/30 dark:bg-amber-500/20 text-[var(--text-gold)] dark:text-amber-400 flex items-center justify-center">
          <FiShield className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[var(--text-primary)] dark:text-white font-heading">Your Vault is Private</h3>
          <p className="text-xs text-[var(--text-secondary)] dark:text-slate-400 mt-1 leading-relaxed font-medium">
            All your gold entries, purchase receipts, and jewellery photos are stored securely. No other user can access your bullion records.
          </p>
        </div>
      </div>

      {/* 5. Account Settings (UI Links) */}
      <div className="bg-[var(--bg-card)] dark:bg-slate-900/80 rounded-3xl border border-[var(--border-color)] dark:border-slate-800/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] dark:shadow-sm overflow-hidden">
        <div className="divide-y divide-[var(--border-color)] dark:divide-slate-800/80">
          <button className="w-full px-5 py-4 flex items-center justify-between hover:bg-[var(--bg-subtle)] dark:hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-3 text-[var(--text-primary)] dark:text-slate-300">
              <FiUser className="w-4 h-4 text-[var(--text-muted)] dark:text-slate-400" />
              <span className="text-sm font-bold">Edit Profile</span>
            </div>
            <FiChevronRight className="w-4 h-4 text-[var(--text-muted)] dark:text-slate-400" />
          </button>
          <button 
            onClick={() => setShowMobileModal(true)}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-[var(--bg-subtle)] dark:hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-3 text-[var(--text-primary)] dark:text-slate-300">
              <FiPhone className="w-4 h-4 text-[var(--text-muted)] dark:text-slate-400" />
              <span className="text-sm font-bold">Change Mobile Number</span>
            </div>
            <FiChevronRight className="w-4 h-4 text-[var(--text-muted)] dark:text-slate-400" />
          </button>
          <button className="w-full px-5 py-4 flex items-center justify-between hover:bg-[var(--bg-subtle)] dark:hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-3 text-[var(--text-primary)] dark:text-slate-300">
              <FiBell className="w-4 h-4 text-[var(--text-muted)] dark:text-slate-400" />
              <span className="text-sm font-bold">Notifications</span>
            </div>
            <FiChevronRight className="w-4 h-4 text-[var(--text-muted)] dark:text-slate-400" />
          </button>
        </div>
      </div>

      {/* 6. Lock & Logout */}
      <div className="pt-4">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-rose-50/50 dark:bg-slate-800/80 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-[var(--loss-red)] dark:text-rose-400 border border-[var(--loss-red)]/20 dark:border-slate-700 hover:border-[var(--loss-red)]/40 dark:hover:border-rose-500/30 py-4 rounded-2xl font-bold transition-all cursor-pointer font-heading"
        >
          <FiLogOut className="w-4 h-4" />
          <span>Lock Vault & Logout</span>
        </button>
      </div>

      {/* Change Mobile Modal */}
      {showMobileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[var(--bg-card)] dark:bg-slate-900 w-full max-w-sm rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden animate-in slide-in-from-bottom-4 duration-300 border border-[var(--border-color)] dark:border-slate-800">
            <div className="px-6 py-5 border-b border-[var(--border-color)] dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-black text-[var(--text-primary)] dark:text-white font-heading">
                Change Mobile
              </h3>
              <button 
                onClick={() => { setShowMobileModal(false); setMobileStep(1); setNewMobile(''); setMobileOtp(''); }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--bg-subtle)] dark:bg-slate-800 text-[var(--text-muted)] hover:text-[var(--text-primary)] dark:hover:text-slate-300 transition-colors"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6">
              {mobileStep === 1 ? (
                <form onSubmit={handleRequestChangeMobile} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] dark:text-slate-500 ml-1">New Mobile Number</label>
                    <div className="relative flex items-center">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <FiPhone className="w-4 h-4 text-slate-400" />
                        <span className="text-[var(--text-secondary)] dark:text-slate-500 font-bold text-sm">+91</span>
                        <div className="w-px h-4 bg-[var(--border-color)] dark:bg-slate-700 ml-1"></div>
                      </div>
                      <input
                        type="tel"
                        value={newMobile}
                        onChange={(e) => setNewMobile(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter 10-digit number"
                        maxLength="10"
                        className="w-full pl-[88px] pr-4 py-3.5 bg-[var(--bg-subtle)] dark:bg-slate-950/50 border border-[var(--border-color)] dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-[var(--border-glow)] dark:focus:ring-amber-500/20 focus:border-[var(--text-gold)] dark:focus:border-amber-500 outline-none transition-all text-sm font-bold tracking-wide text-[var(--text-primary)] dark:text-white placeholder:font-medium placeholder:text-slate-400 placeholder:tracking-normal"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={mobileLoading || newMobile.length !== 10}
                    className="w-full bg-[var(--gold-2)] dark:bg-white text-[var(--text-primary)] dark:text-slate-900 py-3.5 rounded-xl font-bold text-sm hover:-translate-y-0.5 disabled:opacity-50 transition-all font-heading"
                  >
                    {mobileLoading ? 'Sending...' : 'Send OTP'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyChangeMobile} className="space-y-5">
                  <p className="text-sm text-[var(--text-secondary)] dark:text-slate-400 text-center">
                    Enter the code sent to +91 {newMobile.slice(-4).padStart(10, '*')}
                  </p>
                  <div className="relative">
                    <input
                      type="text"
                      value={mobileOtp}
                      onChange={(e) => setMobileOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="_ _ _ _ _ _"
                      className="w-full px-4 py-4 bg-[var(--bg-subtle)] dark:bg-slate-950/50 border border-[var(--border-color)] dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-[var(--border-glow)] dark:focus:ring-amber-500/20 focus:border-[var(--text-gold)] dark:focus:border-amber-500 outline-none transition-all text-2xl font-black text-[var(--text-primary)] dark:text-white text-center tracking-[0.5em] placeholder:tracking-normal"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={mobileLoading || mobileOtp.length !== 6}
                    className="w-full bg-[var(--gold-2)] dark:bg-gradient-to-r dark:from-amber-500 dark:to-amber-600 text-[var(--text-primary)] dark:text-white py-3.5 rounded-xl font-bold text-sm hover:-translate-y-0.5 disabled:opacity-50 transition-all font-heading"
                  >
                    {mobileLoading ? 'Verifying...' : 'Verify & Update'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
