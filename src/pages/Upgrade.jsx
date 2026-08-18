import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiCheck, FiShield, FiStar, FiArrowRight, FiRepeat } from 'react-icons/fi';
import {
  createMonthlySubscription,
  verifyMonthlySubscription,
  getSubscriptionPricing,
  getEntitlementStatus,
} from '../services/api';
import { useAuth } from '../context/AuthContext';

const Upgrade = () => {
  const navigate = useNavigate();
  const { user, refreshUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const [planPrice, setPlanPrice] = useState(199);
  const [loadingPrice, setLoadingPrice] = useState(true);
  const [entitlement, setEntitlement] = useState(null);

  useEffect(() => {
    // Load dynamic pricing and entitlement status from backend
    const fetchData = async () => {
      try {
        setLoadingPrice(true);
        const [pricingRes, statusRes] = await Promise.allSettled([
          getSubscriptionPricing(),
          getEntitlementStatus(),
        ]);

        if (pricingRes.status === 'fulfilled' && pricingRes.value?.data?.price) {
          setPlanPrice(pricingRes.value.data.price);
        }
        if (statusRes.status === 'fulfilled' && statusRes.value?.data) {
          setEntitlement(statusRes.value.data);
        }
      } catch (err) {
        console.error('Failed to load plan pricing or status:', err);
      } finally {
        setLoadingPrice(false);
      }
    };

    fetchData();

    // Load Razorpay Checkout Script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setIsRazorpayLoaded(true);
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleStartMonthlySubscription = async () => {
    if (!isRazorpayLoaded) {
      toast.error('Payment gateway is still initializing. Please wait a moment.');
      return;
    }

    try {
      setLoading(true);
      const toastId = toast.loading('Setting up Monthly AutoPay...');

      // 1. Create Razorpay Subscription on Backend
      const res = await createMonthlySubscription();
      toast.dismiss(toastId);

      if (res?.data?.alreadyActive) {
        toast.success('You already have an active Premium Subscription!');
        if (refreshUserProfile) await refreshUserProfile();
        navigate('/my-gold');
        return;
      }

      const { subscriptionId, keyId, amount, planName, description } = res.data;

      // 2. Open Razorpay Checkout for Subscription Mandate
      const options = {
        key: keyId,
        subscription_id: subscriptionId,
        name: 'Aurum Vault',
        description: description || 'Monthly Premium Vault Subscription',
        theme: {
          color: '#f59e0b', // amber-500
        },
        handler: async function (response) {
          try {
            toast.loading('Verifying AutoPay authorization...', { id: 'verify-sub' });
            await verifyMonthlySubscription({
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success('Monthly AutoPay Activated! Premium Vault Unlocked 🪙', { id: 'verify-sub' });
            if (refreshUserProfile) await refreshUserProfile();
            navigate('/my-gold');
          } catch (error) {
            toast.error(error.response?.data?.message || 'Subscription verification failed.', { id: 'verify-sub' });
          }
        },
        prefill: {
          name: user?.username || 'Aurum Member',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        notes: {
          service: 'gold_live_track_vault',
        },
      };

      const rzp1 = new window.Razorpay(options);

      rzp1.on('payment.failed', function (response) {
        toast.error(`AutoPay Authorization Failed: ${response.error?.description || 'Transaction declined'}`);
      });

      rzp1.open();
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Failed to initialize subscription');
    } finally {
      setLoading(false);
    }
  };

  const entriesUsed = entitlement?.entriesUsed ?? (user?.free_entries_used || 0);

  return (
    <div className="max-w-md mx-auto space-y-6 pb-24 px-4 pt-8 animate-fade-in text-center">
      <div className="space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-heading uppercase tracking-wider">
          <FiStar className="w-3.5 h-3.5 text-amber-500" />
          <span>Premium Vault</span>
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-heading">
          Monthly AutoPay Subscription
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm px-4">
          The first 10 combined Gold & Silver asset entries are free. Upgrade to continue tracking beyond 10 entries with automatic monthly renewal.
        </p>
      </div>

      {/* Free Tier Usage Tracker */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3.5 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiRepeat className="w-4 h-4 text-amber-500" />
          <span className="font-semibold">Free Entries Status:</span>
        </div>
        <span className="font-bold font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-100">
          {entriesUsed} / 10 Entries Used
        </span>
      </div>

      <div className="rounded-3xl p-6 text-left border border-amber-500/30 relative overflow-hidden shadow-2xl bg-[var(--bg-card)] dark:bg-slate-900/90">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/15 blur-3xl rounded-full z-0 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/15 blur-3xl rounded-full z-0 pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between mb-2">
          <h2 className="text-xl font-black text-[var(--text-primary)] dark:text-white font-heading">
            Premium Monthly Vault
          </h2>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[10px] font-black font-heading">
            MONTHLY AUTOPAY
          </span>
        </div>

        <div className="flex items-baseline gap-1.5 mb-6 relative z-10">
          <span className="text-4xl font-black text-amber-600 dark:text-amber-400 font-heading tabular-nums">
            {loadingPrice ? '—' : `₹${planPrice.toLocaleString('en-IN')}`}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">/ month</span>
        </div>

        <ul className="space-y-3.5 mb-8 relative z-10">
          {[
            'Continue beyond 10 free Gold & Silver entries',
            'Real-time live bullion portfolio valuation',
            'Encrypted cloud invoice & jewelry photo storage',
            'Automated monthly AutoPay with cancel anytime option',
            'Multi-city rate differential & profit/loss calculator',
          ].map((feature, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <FiCheck className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 stroke-[3]" />
              <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">{feature}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={handleStartMonthlySubscription}
          disabled={loading || !isRazorpayLoaded}
          className="w-full py-4 rounded-2xl bg-gold-metallic hover:bg-gold-metallic-hover text-slate-950 font-black text-sm shadow-[0_4px_14px_rgba(217,154,0,0.3)] relative z-10 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-transform font-heading border-none disabled:opacity-50"
        >
          {loading ? 'Initializing AutoPay...' : `Start Monthly Premium (₹${planPrice.toLocaleString('en-IN')}/mo)`}
          {!loading && <FiArrowRight className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <FiShield className="w-4 h-4" />
        <span>Secure recurring subscription via Razorpay AutoPay</span>
      </div>

      <button
        onClick={() => navigate('/my-gold')}
        className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-amber-500 transition-colors"
      >
        Return to Dashboard
      </button>
    </div>
  );
};

export default Upgrade;

