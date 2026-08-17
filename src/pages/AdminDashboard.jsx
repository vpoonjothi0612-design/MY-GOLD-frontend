import React, { useState, useEffect, useCallback } from 'react';
import {
  getAdminDashboard,
  getAdminUsers,
  getAdminUser,
  updateAdminUserStatus,
  updateAdminPricing,
  getAdminAuditLogs,
  getAdminMetalRates,
  updateAdminMetalRate,
  getHealthDetails,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatReadableDate } from '../utils/formatters';
import {
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiDollarSign,
  FiSearch,
  FiEye,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiEdit3,
  FiShield,
  FiActivity,
  FiChevronLeft,
  FiChevronRight,
  FiPhone,
  FiCreditCard,
  FiClock,
  FiAlertTriangle,
  FiX,
  FiAward,
  FiLayers,
  FiTrendingUp,
} from 'react-icons/fi';
import { GiGoldBar } from 'react-icons/gi';
import { TbCoin } from 'react-icons/tb';
import toast from 'react-hot-toast';

export const AdminDashboard = () => {
  const { user: currentAdmin } = useAuth();

  // Active Main Tab: 'overview' | 'users' | 'pricing' | 'rates' | 'audit'
  const [activeTab, setActiveTab] = useState('overview');

  // Dashboard Stats State
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Metal Rates Management State
  const [metalRatesData, setMetalRatesData] = useState(null);
  const [loadingRates, setLoadingRates] = useState(false);
  const [rateOverrideModal, setRateOverrideModal] = useState({
    isOpen: false,
    metal: 'GOLD',
    purity: '24K',
    rate: '',
    reason: '',
    loading: false,
    error: '',
  });

  // User Management State
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVersion, setFilterVersion] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Selected User for Details Modal
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);

  // User Status Confirmation Modal
  const [statusConfirmModal, setStatusConfirmModal] = useState({
    isOpen: false,
    user: null,
    targetStatus: false,
    loading: false,
  });

  // Price Edit Modal State
  const [priceModal, setPriceModal] = useState({
    isOpen: false,
    newPrice: '',
    confirmStep: false,
    loading: false,
    error: '',
  });

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // System Health State
  const [healthData, setHealthData] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(false);

  // ==========================================
  // Fetch Dashboard Stats
  // ==========================================
  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const res = await getAdminDashboard();
      if (res?.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
      toast.error('Unable to load dashboard metrics.');
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // ==========================================
  // Fetch Users with Search & Filter
  // ==========================================
  const fetchUsers = useCallback(
    async (pageToLoad = 1) => {
      try {
        setLoadingUsers(true);
        const params = {
          page: pageToLoad,
          limit: pagination.limit,
          search: searchQuery,
          version: filterVersion,
          status: filterStatus,
          payment_status: filterPayment,
          date_range: filterDateRange,
          startDate: customStartDate,
          endDate: customEndDate,
        };

        const res = await getAdminUsers(params);
        if (res?.data) {
          setUsers(res.data.users || []);
          setPagination(res.data.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 });
        }
      } catch (err) {
        console.error('Failed to fetch admin users:', err);
        toast.error('Unable to load user list.');
      } finally {
        setLoadingUsers(false);
      }
    },
    [
      pagination.limit,
      searchQuery,
      filterVersion,
      filterStatus,
      filterPayment,
      filterDateRange,
      customStartDate,
      customEndDate,
    ]
  );

  // ==========================================
  // Fetch Audit Logs
  // ==========================================
  const fetchLogs = useCallback(async () => {
    try {
      setLoadingLogs(true);
      const res = await getAdminAuditLogs({ limit: 30 });
      if (res?.data) {
        setAuditLogs(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  // ==========================================
  // Fetch System Health
  // ==========================================
  const fetchHealth = useCallback(async () => {
    try {
      setLoadingHealth(true);
      const data = await getHealthDetails();
      setHealthData(data);
    } catch (err) {
      console.error('Failed to fetch system health:', err);
      setHealthData({ status: 'offline', error: err.message });
    } finally {
      setLoadingHealth(false);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    fetchDashboardStats();
    fetchUsers(1);
    fetchLogs();
  }, [fetchDashboardStats, fetchUsers, fetchLogs]);

  useEffect(() => {
    if (activeTab === 'health' && !healthData) {
      fetchHealth();
    }
  }, [activeTab, healthData, fetchHealth]);

  // Debounced Search & Filter update
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [
    searchQuery,
    filterVersion,
    filterStatus,
    filterPayment,
    filterDateRange,
    customStartDate,
    customEndDate,
    fetchUsers,
  ]);

  // Manual Refresh Handler
  const handleManualRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchDashboardStats(), fetchUsers(pagination.page), fetchLogs(), fetchHealth()]);
    setRefreshing(false);
    toast.success('Admin data synchronized with database.');
  };

  // Open User Details
  const handleViewUser = async (userId) => {
    setSelectedUserId(userId);
    setLoadingUserDetails(true);
    try {
      const res = await getAdminUser(userId);
      if (res?.data) {
        setSelectedUserDetails(res.data);
      }
    } catch (err) {
      toast.error('Failed to load user profile details.');
    } finally {
      setLoadingUserDetails(false);
    }
  };

  // Trigger Status Change Confirmation
  const openStatusConfirmation = (targetUser, targetStatus) => {
    setStatusConfirmModal({
      isOpen: true,
      user: targetUser,
      targetStatus,
      loading: false,
    });
  };

  // Confirm Status Change
  const handleConfirmStatusChange = async () => {
    const { user, targetStatus } = statusConfirmModal;
    if (!user) return;

    setStatusConfirmModal((prev) => ({ ...prev, loading: true }));
    try {
      await updateAdminUserStatus(user.id, targetStatus);
      toast.success(
        `User ${user.username} is now ${targetStatus ? 'Active' : 'Inactive'}.`
      );

      // Refresh data
      setStatusConfirmModal({ isOpen: false, user: null, targetStatus: false, loading: false });
      fetchUsers(pagination.page);
      fetchDashboardStats();
      fetchLogs();

      // If user details modal is open for this user, refresh it
      if (selectedUserId === user.id) {
        handleViewUser(user.id);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user account status.');
      setStatusConfirmModal((prev) => ({ ...prev, loading: false }));
    }
  };

  // Open Price Editor Modal
  const openPriceEditor = () => {
    const currentPrice = stats?.pricing?.currentPaidPrice || 999;
    setPriceModal({
      isOpen: true,
      newPrice: String(currentPrice),
      confirmStep: false,
      loading: false,
      error: '',
    });
  };

  // Save New Price
  const handleSavePrice = async () => {
    const numeric = parseFloat(priceModal.newPrice);
    if (!numeric || numeric <= 0 || isNaN(numeric)) {
      setPriceModal((prev) => ({
        ...prev,
        error: 'Please enter a valid price amount greater than 0.',
      }));
      return;
    }

    if (!priceModal.confirmStep) {
      setPriceModal((prev) => ({ ...prev, confirmStep: true, error: '' }));
      return;
    }

    setPriceModal((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      await updateAdminPricing(numeric);
      toast.success(`Paid version price updated to ₹${numeric.toLocaleString('en-IN')}.`);
      setPriceModal({ isOpen: false, newPrice: '', confirmStep: false, loading: false, error: '' });
      fetchDashboardStats();
      fetchLogs();
    } catch (err) {
      setPriceModal((prev) => ({
        ...prev,
        loading: false,
        error: err.response?.data?.message || 'Failed to update price.',
      }));
    }
  };

  // ==========================================
  // Metal Rates Management Handlers
  // ==========================================
  const fetchAdminRates = useCallback(async () => {
    try {
      setLoadingRates(true);
      const res = await getAdminMetalRates();
      if (res?.data) {
        setMetalRatesData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin metal rates:', err);
      toast.error('Unable to load live bullion quotes.');
    } finally {
      setLoadingRates(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'rates' && !metalRatesData) {
      fetchAdminRates();
    }
  }, [activeTab, metalRatesData, fetchAdminRates]);

  const openRateOverride = (metal = 'GOLD', purity = '24K', currentRate = '') => {
    setRateOverrideModal({
      isOpen: true,
      metal,
      purity,
      rate: String(currentRate || ''),
      reason: '',
      loading: false,
      error: '',
    });
  };

  const handleSaveRateOverride = async () => {
    const numeric = parseFloat(rateOverrideModal.rate);
    if (!numeric || numeric <= 0 || isNaN(numeric)) {
      setRateOverrideModal((prev) => ({
        ...prev,
        error: 'Please enter a valid rate per gram greater than 0.',
      }));
      return;
    }

    setRateOverrideModal((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      await updateAdminMetalRate({
        metal: rateOverrideModal.metal,
        purity: rateOverrideModal.purity,
        rate: numeric,
        reason: rateOverrideModal.reason || 'Manual administrative rate override',
      });
      toast.success(
        `Calibrated ${rateOverrideModal.metal} (${rateOverrideModal.purity}) rate to ₹${numeric.toLocaleString('en-IN')}/g.`
      );
      setRateOverrideModal({
        isOpen: false,
        metal: 'GOLD',
        purity: '24K',
        rate: '',
        reason: '',
        loading: false,
        error: '',
      });
      fetchAdminRates();
      fetchLogs();
    } catch (err) {
      setRateOverrideModal((prev) => ({
        ...prev,
        loading: false,
        error: err.response?.data?.message || 'Failed to update metal rate.',
      }));
    }
  };

  // Clear All Filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterVersion('all');
    setFilterStatus('all');
    setFilterPayment('all');
    setFilterDateRange('all');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-20 animate-in fade-in duration-300">
      {/* 1. Top Header Banner */}
      <div className="bg-white dark:bg-slate-900/60 p-4 rounded-[18px] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-amber-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-heading tracking-wide">
                <FiShield className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Admin Control Center</span>
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                Live Data Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              <span>User & Bullion Management</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-1.5 max-w-2xl font-medium">
              Monitor customer accounts, manage paid version pricing, calibrate live Gold & Silver bullion quotes, and review administrative audit logs.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={refreshing || loadingStats}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 font-heading"
            >
              <FiRefreshCw className={`w-4 h-4 text-amber-600 dark:text-amber-400 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
            </button>

            <button
              type="button"
              onClick={openPriceEditor}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-amber-500/25 hover:shadow-amber-500/40 transition-all transform active:scale-95 cursor-pointer font-heading tracking-wide border border-amber-300/40"
            >
              <FiEdit3 className="w-4 h-4 stroke-[2.5]" />
              <span>Edit Paid Price</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-200 dark:border-slate-800/80 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all font-heading cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-amber-500 text-slate-950 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-400 dark:border-amber-500/40 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
            }`}
          >
            <FiActivity className="w-4 h-4" />
            <span>Dashboard Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all font-heading cursor-pointer whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-amber-500 text-slate-950 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-400 dark:border-amber-500/40 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
            }`}
          >
            <FiUsers className="w-4 h-4" />
            <span>User Management ({stats?.users?.total || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pricing')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all font-heading cursor-pointer whitespace-nowrap ${
              activeTab === 'pricing'
                ? 'bg-amber-500 text-slate-950 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-400 dark:border-amber-500/40 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
            }`}
          >
            <FiDollarSign className="w-4 h-4" />
            <span>Paid Pricing (₹{stats?.pricing?.currentPaidPrice || 999})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rates')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all font-heading cursor-pointer whitespace-nowrap ${
              activeTab === 'rates'
                ? 'bg-amber-500 text-slate-950 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-400 dark:border-amber-500/40 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
            }`}
          >
            <FiTrendingUp className="w-4 h-4" />
            <span>Metal Rates Management</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all font-heading cursor-pointer whitespace-nowrap ${
              activeTab === 'audit'
                ? 'bg-amber-500 text-slate-950 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-400 dark:border-amber-500/40 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
            }`}
          >
            <FiClock className="w-4 h-4" />
            <span>Activity & Audit Logs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('health')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all font-heading cursor-pointer whitespace-nowrap ${
              activeTab === 'health'
                ? 'bg-amber-500 text-slate-950 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-400 dark:border-amber-500/40 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
            }`}
          >
            <FiActivity className="w-4 h-4" />
            <span>System Health</span>
          </button>
        </div>
      </div>

      {/* 2. STATS SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Card 1: Total Users */}
        <div className="bg-white dark:bg-slate-900/60 p-4 rounded-[18px] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-heading">
              Total Users
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FiUsers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-heading">
              {loadingStats ? '—' : (stats?.users?.total || 0).toLocaleString('en-IN')}
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">Registered Accounts</p>
          </div>
        </div>

        {/* Card 2: Paid Users */}
        <div className="bg-white dark:bg-slate-900/60 p-4 rounded-[18px] border border-amber-500/20 shadow-sm flex items-center justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400 font-heading">
              Paid Users
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-300 flex items-center justify-center">
              <FiAward className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-heading">
                {loadingStats ? '—' : (stats?.users?.paid || 0).toLocaleString('en-IN')}
              </h3>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                {stats?.users?.paidPercentage || 0}%
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">Premium Vault Pro</p>
          </div>
        </div>

        {/* Card 3: Free / Non-Paid Users */}
        <div className="bg-white dark:bg-slate-900/60 p-4 rounded-[18px] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-heading">
              Non-Paid
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
              <FiLayers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-heading">
                {loadingStats ? '—' : (stats?.users?.free || 0).toLocaleString('en-IN')}
              </h3>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {stats?.users?.freePercentage || 0}%
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">Free Version</p>
          </div>
        </div>

        {/* Card 4: Active Users */}
        <div className="bg-white dark:bg-slate-900/60 p-4 rounded-[18px] border border-emerald-500/20 shadow-sm flex items-center justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-heading">
              Active
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FiUserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-heading">
                {loadingStats ? '—' : (stats?.users?.active || 0).toLocaleString('en-IN')}
              </h3>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                {stats?.users?.activePercentage || 0}%
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">Operational Status</p>
          </div>
        </div>

        {/* Card 5: Inactive Users */}
        <div className="bg-white dark:bg-slate-900/60 p-4 rounded-[18px] border border-rose-500/20 shadow-sm flex items-center justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-700 dark:text-rose-400 font-heading">
              Inactive
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <FiUserX className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 font-heading">
              {loadingStats ? '—' : (stats?.users?.inactive || 0).toLocaleString('en-IN')}
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">Deactivated Users</p>
          </div>
        </div>

        {/* Card 6: Total Collected Revenue */}
        <div className="bg-white dark:bg-slate-900/80 p-4 sm:p-5 rounded-3xl border border-amber-400/40 dark:border-amber-500/30 shadow-sm dark:shadow-lg relative overflow-hidden group hover:shadow-amber-500/15 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300 font-heading">
              Collected
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-300 flex items-center justify-center">
              <FiDollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-300 font-heading truncate">
              {loadingStats ? '—' : formatCurrency(stats?.payments?.totalRevenue || 0)}
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {stats?.payments?.paidCount || 0} Successful Txns
            </p>
          </div>
        </div>
      </div>

      {/* 3. BULLION & ASSETS QUICK STATUS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: 24K Gold Rate */}
        <div className="bg-white dark:bg-slate-900/80 p-4 rounded-2xl border border-amber-500/20 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 font-heading block">
              🪙 24K Gold Rate
            </span>
            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-heading mt-0.5 tabular-nums">
              {stats?.rates?.goldRate24K ? formatCurrency(stats.rates.goldRate24K) : '—'}
              <span className="text-xs font-normal text-slate-400">/g</span>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 font-heading">
            Live
          </span>
        </div>

        {/* Card 2: 999 Silver Rate */}
        <div className="bg-white dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-300 dark:border-slate-700 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 font-heading block">
              🥈 999 Silver Rate
            </span>
            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-heading mt-0.5 tabular-nums">
              {stats?.rates?.silverRate999 ? formatCurrency(stats.rates.silverRate999) : '—'}
              <span className="text-xs font-normal text-slate-400">/g</span>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-heading">
            Live
          </span>
        </div>

        {/* Card 3: Gold Assets */}
        <div className="bg-white dark:bg-slate-900/80 p-4 rounded-2xl border border-amber-500/20 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 font-heading block">
              🪙 Gold Assets Locked
            </span>
            <div className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400 font-heading mt-0.5">
              {(stats?.assets?.gold ?? 0).toLocaleString('en-IN')}
            </div>
          </div>
          <span className="text-[10px] font-medium text-slate-400">Vault Items</span>
        </div>

        {/* Card 4: Silver Assets */}
        <div className="bg-white dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-300 dark:border-slate-700 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 font-heading block">
              🥈 Silver Assets Locked
            </span>
            <div className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-200 font-heading mt-0.5">
              {(stats?.assets?.silver ?? 0).toLocaleString('en-IN')}
            </div>
          </div>
          <span className="text-[10px] font-medium text-slate-400">Vault Items</span>
        </div>
      </div>

      {/* =========================================================
          TAB 1: DASHBOARD OVERVIEW
          ========================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
          {/* Quick Pricing Banner & Visual Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Paid Version Price Management Widget */}
            <div className="bg-white dark:bg-slate-900/60 p-4 rounded-[18px] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 font-heading">
                    <GiGoldBar className="w-3.5 h-3.5" />
                    <span>Paid Version Price</span>
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Active Rate</span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  Current price charged for new users upgrading to the Premium Vault Pro plan.
                </p>

                <div className="my-6 p-4 rounded-2xl bg-white/80 dark:bg-slate-950/70 border border-slate-200 dark:border-amber-500/20 text-center shadow-xs">
                  <span className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-extrabold font-heading block mb-1">
                    Current Pricing
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-amber-600 dark:text-amber-400 font-heading tracking-tight">
                    ₹{(stats?.pricing?.currentPaidPrice || 999).toLocaleString('en-IN')}
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">/ year</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={openPriceEditor}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition-all transform active:scale-95 cursor-pointer font-heading flex items-center justify-center gap-2"
                >
                  <FiEdit3 className="w-4 h-4" />
                  <span>Update Paid Price</span>
                </button>

                <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center leading-relaxed">
                  🛡️ <strong className="text-slate-700 dark:text-slate-300">Historical Preservation:</strong> Updating price will not overwrite existing users' historical payment records.
                </p>
              </div>
            </div>

            {/* Visual Analytics & Breakdown */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900/80 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white font-heading">
                    Live System Distribution
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Breakdown of user subscriptions, account status, and transaction states.
                  </p>
                </div>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-heading">
                  Real Database Records
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* 1. Paid vs Non-Paid Distribution */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-heading">
                      User Plan Distribution
                    </span>
                    <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                      {stats?.users?.paid || 0} Paid / {stats?.users?.free || 0} Free
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full h-3.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${stats?.users?.paidPercentage || 0}%` }}
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
                      title={`Paid: ${stats?.users?.paidPercentage || 0}%`}
                    />
                    <div
                      style={{ width: `${stats?.users?.freePercentage || 0}%` }}
                      className="h-full bg-slate-400 dark:bg-slate-600 transition-all duration-500"
                      title={`Free: ${stats?.users?.freePercentage || 0}%`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                      <span>Paid ({stats?.users?.paidPercentage || 0}%)</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600 inline-block" />
                      <span>Free ({stats?.users?.freePercentage || 0}%)</span>
                    </span>
                  </div>
                </div>

                {/* 2. Active vs Inactive Distribution */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-heading">
                      Account Operational Status
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      {stats?.users?.active || 0} Active / {stats?.users?.inactive || 0} Inactive
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full h-3.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${stats?.users?.activePercentage || 0}%` }}
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
                      title={`Active: ${stats?.users?.activePercentage || 0}%`}
                    />
                    <div
                      style={{ width: `${stats?.users?.inactivePercentage || 0}%` }}
                      className="h-full bg-rose-500 transition-all duration-500"
                      title={`Inactive: ${stats?.users?.inactivePercentage || 0}%`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                      <span>Active ({stats?.users?.activePercentage || 0}%)</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                      <span>Inactive ({stats?.users?.inactivePercentage || 0}%)</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Payment Status Stats Row */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-heading">
                    Payment Transactions Breakdown
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Total Transactions: {stats?.payments?.totalCount || 0}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                      Successful
                    </span>
                    <span className="text-lg font-extrabold text-slate-900 dark:text-white font-heading">
                      {stats?.payments?.paidCount || 0}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25">
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                      Pending
                    </span>
                    <span className="text-lg font-extrabold text-slate-900 dark:text-white font-heading">
                      {stats?.payments?.pendingCount || 0}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25">
                    <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider block">
                      Failed
                    </span>
                    <span className="text-lg font-extrabold text-slate-900 dark:text-white font-heading">
                      {stats?.payments?.failedCount || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Row -> Jump to User Management */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <FiUsers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white font-heading">
                  Manage Vault Users Directly
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Search, filter, view user portfolios, and activate or deactivate accounts.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-amber-600 dark:text-amber-400 font-bold text-xs sm:text-sm transition-all cursor-pointer font-heading flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 shadow-xs"
            >
              <span>Go to User Management Table</span>
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 2: USER MANAGEMENT (SEARCH, FILTERS, TABLE, PAGINATION)
          ========================================================= */}
      {(activeTab === 'users' || activeTab === 'overview') && (
        <div className="space-y-5 animate-in fade-in duration-200">
          
          {/* Filters & Search Toolbar */}
          <div className="bg-white dark:bg-slate-900/60 p-4 rounded-[18px] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              
              {/* Search Box */}
              <div className="relative flex-1">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Name, Email, Phone, or User ID..."
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-slate-950 transition-all font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Clear Filters Button */}
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer font-heading flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 self-start lg:self-auto"
                title="Reset all filters"
              >
                <FiRefreshCw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            </div>

            {/* Filter Pills Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              
              {/* Filter 1: Plan / Version */}
              <div>
                <label className="text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider font-heading block mb-1.5">
                  Plan / Version
                </label>
                <select
                  value={filterVersion}
                  onChange={(e) => setFilterVersion(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 font-bold focus:outline-none focus:border-amber-500 font-heading cursor-pointer"
                >
                  <option value="all">All Plans</option>
                  <option value="paid">Paid Version</option>
                  <option value="free">Free / Non-Paid</option>
                </select>
              </div>

              {/* Filter 2: Account Status */}
              <div>
                <label className="text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider font-heading block mb-1.5">
                  Account Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 font-bold focus:outline-none focus:border-amber-500 font-heading cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>

              {/* Filter 3: Payment Status */}
              <div>
                <label className="text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider font-heading block mb-1.5">
                  Payment Status
                </label>
                <select
                  value={filterPayment}
                  onChange={(e) => setFilterPayment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 font-bold focus:outline-none focus:border-amber-500 font-heading cursor-pointer"
                >
                  <option value="all">All Payments</option>
                  <option value="paid">Paid / Success</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="na">Not Applicable</option>
                </select>
              </div>

              {/* Filter 4: Registration Date */}
              <div>
                <label className="text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider font-heading block mb-1.5">
                  Registration Date
                </label>
                <select
                  value={filterDateRange}
                  onChange={(e) => setFilterDateRange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 font-bold focus:outline-none focus:border-amber-500 font-heading cursor-pointer"
                >
                  <option value="all">All Time</option>
                  <option value="today">Registered Today</option>
                  <option value="this_week">Past 7 Days</option>
                  <option value="this_month">This Month</option>
                  <option value="custom">Custom Date Range</option>
                </select>
              </div>
            </div>

            {/* Custom Date Range Pickers */}
            {filterDateRange === 'custom' && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1 font-heading">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1 font-heading">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* User Management Table */}
          <div className="bg-white dark:bg-slate-900/60 p-4 rounded-[18px] border border-slate-200 dark:border-slate-800 shadow-sm">
            
            {/* Table Header / Summary */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white font-heading">
                  Registered Accounts
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {pagination.total} total
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Page {pagination.page} of {pagination.totalPages}
              </div>
            </div>

            {/* Responsive Table Area */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-heading">
                    <th className="py-3.5 px-4 sm:px-6">User</th>
                    <th className="py-3.5 px-4 hidden md:table-cell">Contact</th>
                    <th className="py-3.5 px-4">Plan / Version</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 hidden sm:table-cell">Payment</th>
                    <th className="py-3.5 px-4 hidden lg:table-cell">Joined</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-medium">
                  {loadingUsers ? (
                    // Loading Skeletons
                    Array.from({ length: 5 }).map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800" />
                            <div className="space-y-1.5">
                              <div className="w-24 h-3 bg-slate-200 dark:bg-slate-800 rounded" />
                              <div className="w-32 h-2 bg-slate-200 dark:bg-slate-800 rounded" />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 hidden md:table-cell">
                          <div className="w-28 h-3 bg-slate-200 dark:bg-slate-800 rounded" />
                        </td>
                        <td className="py-4 px-4">
                          <div className="w-16 h-6 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                        </td>
                        <td className="py-4 px-4">
                          <div className="w-16 h-6 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                        </td>
                        <td className="py-4 px-4 hidden sm:table-cell">
                          <div className="w-20 h-3 bg-slate-200 dark:bg-slate-800 rounded" />
                        </td>
                        <td className="py-4 px-4 hidden lg:table-cell">
                          <div className="w-20 h-3 bg-slate-200 dark:bg-slate-800 rounded" />
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="w-16 h-7 bg-slate-200 dark:bg-slate-800 rounded-lg ml-auto" />
                        </td>
                      </tr>
                    ))
                  ) : users.length === 0 ? (
                    // Empty State
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
                          <FiSearch className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 font-heading">
                          No users found matching your filters.
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                          Try adjusting your search keyword or resetting the filter options.
                        </p>
                        <button
                          type="button"
                          onClick={handleClearFilters}
                          className="mt-4 px-4 py-2 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold font-heading cursor-pointer hover:bg-amber-500/25"
                        >
                          Clear All Filters
                        </button>
                      </td>
                    </tr>
                  ) : (
                    // Real Users Rows
                    users.map((item) => {
                      const isPaid = item.plan === 'paid';
                      const isActive = item.is_active !== false;
                      const isAdmin = item.role === 'admin';

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-amber-50/40 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          {/* User Avatar + Username + ID */}
                          <td className="py-3.5 px-4 sm:px-6">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-bold text-xs font-heading shadow-xs">
                                  {item.username.charAt(0).toUpperCase()}
                                </div>
                                {isAdmin && (
                                  <span
                                    className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-purple-500 border border-white dark:border-slate-900 flex items-center justify-center text-[8px] text-white"
                                    title="Administrator"
                                  >
                                    ★
                                  </span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-slate-900 dark:text-white font-heading truncate max-w-[140px] sm:max-w-[180px]">
                                    {item.username}
                                  </span>
                                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                    #{item.id}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                                  {item.email}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Contact (Phone / Email) */}
                          <td className="py-3.5 px-4 hidden md:table-cell text-slate-600 dark:text-slate-300">
                            <div className="flex items-center gap-1.5 text-xs">
                              <FiPhone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                              <span>{item.phone || '—'}</span>
                            </div>
                          </td>

                          {/* Plan / Version Chip */}
                          <td className="py-3.5 px-4">
                            {isPaid ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[11px] font-extrabold font-heading shadow-xs">
                                <GiGoldBar className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                <span>Paid</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-bold font-heading">
                                <span>Free</span>
                              </span>
                            )}
                          </td>

                          {/* Account Status Chip */}
                          <td className="py-3.5 px-4">
                            {isActive ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[11px] font-bold font-heading">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span>Active</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30 text-[11px] font-bold font-heading">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                <span>Inactive</span>
                              </span>
                            )}
                          </td>

                          {/* Payment Column */}
                          <td className="py-3.5 px-4 hidden sm:table-cell">
                            {item.latest_payment ? (
                              <div>
                                <span className="font-extrabold text-slate-900 dark:text-white font-heading text-xs">
                                  {formatCurrency(item.latest_payment.amount)}
                                </span>
                                <span
                                  className={`block text-[10px] uppercase font-bold tracking-wider ${
                                    item.latest_payment.status === 'paid'
                                      ? 'text-emerald-600 dark:text-emerald-400'
                                      : item.latest_payment.status === 'pending'
                                      ? 'text-amber-600 dark:text-amber-400'
                                      : 'text-rose-600 dark:text-rose-400'
                                  }`}
                                >
                                  {item.latest_payment.status}
                                </span>
                              </div>
                            ) : isPaid ? (
                              <span className="text-amber-600 dark:text-amber-400 text-xs font-bold">₹999 (Manual)</span>
                            ) : (
                              <span className="text-slate-400 text-xs">—</span>
                            )}
                          </td>

                          {/* Joined Date */}
                          <td className="py-3.5 px-4 hidden lg:table-cell text-slate-500 dark:text-slate-400 text-xs">
                            {formatReadableDate(item.created_at)}
                          </td>

                          {/* Row Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* View Details Button */}
                              <button
                                type="button"
                                onClick={() => handleViewUser(item.id)}
                                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-all cursor-pointer"
                                title="View User Details"
                              >
                                <FiEye className="w-4 h-4" />
                              </button>

                              {/* Toggle Status (Active <-> Inactive) */}
                              <button
                                type="button"
                                disabled={item.id === currentAdmin?.id}
                                onClick={() => openStatusConfirmation(item, !isActive)}
                                className={`p-2 rounded-xl transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                                  isActive
                                    ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                }`}
                                title={
                                  item.id === currentAdmin?.id
                                    ? 'Cannot deactivate your own administrator account'
                                    : isActive
                                    ? 'Deactivate User'
                                    : 'Activate User'
                                }
                              >
                                {isActive ? (
                                  <FiXCircle className="w-4 h-4" />
                                ) : (
                                  <FiCheckCircle className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Bar */}
            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-950/40">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Showing{' '}
                <strong className="text-slate-800 dark:text-slate-200">
                  {users.length === 0
                    ? 0
                    : (pagination.page - 1) * pagination.limit + 1}
                  –
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}
                </strong>{' '}
                of <strong className="text-slate-800 dark:text-slate-200">{pagination.total}</strong> accounts
              </div>

              {/* Page Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!pagination.hasPrev || loadingUsers}
                  onClick={() => fetchUsers(pagination.page - 1)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  title="Previous Page"
                >
                  <FiChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    return (
                      p === 1 ||
                      p === pagination.totalPages ||
                      Math.abs(p - pagination.page) <= 1
                    );
                  })
                  .map((p, idx, arr) => {
                    const prevP = arr[idx - 1];
                    const hasGap = prevP && p - prevP > 1;

                    return (
                      <React.Fragment key={p}>
                        {hasGap && <span className="text-slate-400 text-xs px-1">...</span>}
                        <button
                          type="button"
                          onClick={() => fetchUsers(p)}
                          className={`w-8 h-8 rounded-xl text-xs font-bold font-heading transition-all ${
                            p === pagination.page
                              ? 'bg-amber-500 text-slate-950 shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  })}

                <button
                  type="button"
                  disabled={!pagination.hasNext || loadingUsers}
                  onClick={() => fetchUsers(pagination.page + 1)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  title="Next Page"
                >
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 3: PAID PRICING MANAGEMENT
          ========================================================= */}
      {activeTab === 'pricing' && (
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900/80 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-amber-500/25 shadow-sm dark:shadow-xl space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <FiDollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white font-heading">
                Paid-Version Pricing Configuration
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Set and update the standard rate for the Premium Vault Pro plan.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-amber-50/60 dark:bg-slate-950/70 border border-amber-400/30 text-center space-y-2">
            <span className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-extrabold font-heading">
              Current Active Price
            </span>
            <div className="text-4xl font-black text-amber-600 dark:text-amber-400 font-heading">
              ₹{(stats?.pricing?.currentPaidPrice || 999).toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Currency: Indian Rupee (INR)</p>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
              How Pricing Updates Work
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed list-disc list-inside">
              <li>
                <strong>Future Upgrades:</strong> Newly upgraded or registering users will be charged the updated price.
              </li>
              <li>
                <strong>Strict Historical Rule:</strong> Existing users who paid at older rates (e.g. ₹999) will continue to retain their historical transaction amounts in database records.
              </li>
              <li>
                <strong>Audit Trail:</strong> All price modifications are permanently logged with the modifying administrator's identity and timestamp.
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={openPriceEditor}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 text-slate-950 font-black text-sm shadow-md shadow-amber-500/30 transition-all cursor-pointer font-heading flex items-center justify-center gap-2"
          >
            <FiEdit3 className="w-4 h-4" />
            <span>Modify Paid Version Price</span>
          </button>
        </div>
      )}

      {/* =========================================================
          TAB 4: METAL RATES MANAGEMENT (GOLD & SILVER)
          ========================================================= */}
      {activeTab === 'rates' && (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
          {/* Header Banner for Metal Rates */}
          <div className="bg-white dark:bg-slate-900/80 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-amber-500/25 shadow-sm dark:shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-heading">
                  <FiTrendingUp className="w-3.5 h-3.5" />
                  <span>Bullion Rate Monitor & Calibration</span>
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  {metalRatesData?.status || 'Active'}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading">
                Live Chennai Gold & Silver Market Quotes
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Live market reference quotes used to value user portfolio holdings in real time.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={fetchAdminRates}
                disabled={loadingRates}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 hover:border-amber-500/40 transition-all cursor-pointer font-heading disabled:opacity-50"
              >
                <FiRefreshCw className={`w-3.5 h-3.5 text-amber-600 dark:text-amber-400 ${loadingRates ? 'animate-spin' : ''}`} />
                <span>Sync Live Rates</span>
              </button>

              <button
                type="button"
                onClick={() => openRateOverride('GOLD', '24K', metalRatesData?.gold?.[0]?.rate_per_gram || '')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 text-slate-950 text-xs font-black shadow-md shadow-amber-500/25 transition-all cursor-pointer font-heading"
              >
                <FiEdit3 className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>+ Calibrate Rate</span>
              </button>
            </div>
          </div>

          {/* Quick Rate Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 24K Pure Gold */}
            <div className="bg-white dark:bg-slate-900/80 p-5 rounded-3xl border border-slate-200 dark:border-amber-500/20 shadow-sm relative overflow-hidden group hover:border-amber-400 dark:hover:border-amber-500/40 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 font-heading">
                  🪙 24K Pure Gold
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-500/15 text-amber-800 dark:text-amber-300">
                  99.9%
                </span>
              </div>
              <div className="text-2xl font-black font-heading text-slate-900 dark:text-white tabular-nums">
                {formatCurrency(metalRatesData?.gold?.find((r) => r.purity === '24K')?.rate_per_gram || 0)}
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1">/ g</span>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Per Sovereign (8g):</span>
                <span className="font-bold text-amber-700 dark:text-amber-400 tabular-nums">
                  {formatCurrency((metalRatesData?.gold?.find((r) => r.purity === '24K')?.rate_per_gram || 0) * 8)}
                </span>
              </div>
            </div>

            {/* 22K Standard Gold */}
            <div className="bg-white dark:bg-slate-900/80 p-5 rounded-3xl border border-slate-200 dark:border-emerald-500/20 shadow-sm relative overflow-hidden group hover:border-emerald-400 dark:hover:border-emerald-500/40 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-heading">
                  🪙 22K Standard Gold
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                  916 Hallmark
                </span>
              </div>
              <div className="text-2xl font-black font-heading text-emerald-700 dark:text-emerald-400 tabular-nums">
                {formatCurrency(metalRatesData?.gold?.find((r) => r.purity === '22K')?.rate_per_gram || 0)}
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1">/ g</span>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Per Sovereign (8g):</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                  {formatCurrency((metalRatesData?.gold?.find((r) => r.purity === '22K')?.rate_per_gram || 0) * 8)}
                </span>
              </div>
            </div>

            {/* 999 Fine Silver */}
            <div className="bg-white dark:bg-slate-900/80 p-5 rounded-3xl border border-slate-200 dark:border-sky-500/20 shadow-sm relative overflow-hidden group hover:border-sky-400 dark:hover:border-sky-500/40 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-sky-700 dark:text-sky-400 font-heading">
                  🥈 999 Fine Silver
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-sky-500/15 text-sky-700 dark:text-sky-300">
                  99.9%
                </span>
              </div>
              <div className="text-2xl font-black font-heading text-sky-700 dark:text-sky-300 tabular-nums">
                {formatCurrency(metalRatesData?.silver?.find((r) => r.purity === '999')?.rate_per_gram || 0)}
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1">/ g</span>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Per 1 Kg Bar:</span>
                <span className="font-bold text-sky-700 dark:text-sky-300 tabular-nums">
                  {formatCurrency((metalRatesData?.silver?.find((r) => r.purity === '999')?.rate_per_gram || 0) * 1000)}
                </span>
              </div>
            </div>

            {/* 925 Sterling Silver */}
            <div className="bg-white dark:bg-slate-900/80 p-5 rounded-3xl border border-slate-200 dark:border-purple-500/20 shadow-sm relative overflow-hidden group hover:border-purple-400 dark:hover:border-purple-500/40 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-400 font-heading">
                  🥈 925 Sterling Silver
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-purple-500/15 text-purple-700 dark:text-purple-300">
                  92.5%
                </span>
              </div>
              <div className="text-2xl font-black font-heading text-purple-700 dark:text-purple-300 tabular-nums">
                {formatCurrency(metalRatesData?.silver?.find((r) => r.purity === '925')?.rate_per_gram || 0)}
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1">/ g</span>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Per 10 Grams:</span>
                <span className="font-bold text-purple-700 dark:text-purple-300 tabular-nums">
                  {formatCurrency((metalRatesData?.silver?.find((r) => r.purity === '925')?.rate_per_gram || 0) * 10)}
                </span>
              </div>
            </div>
          </div>

          {/* Master Bullion Rates Table */}
          <div className="bg-white dark:bg-slate-900/60 p-4 rounded-[18px] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h4 className="text-base font-black text-slate-900 dark:text-white font-heading">
                Precious Metal Rate Calibration Master Ledger
              </h4>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Source: {metalRatesData?.source || 'LiveChennai'} • {metalRatesData?.updatedAt || 'Current'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 font-heading uppercase text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Metal</th>
                    <th className="py-3.5 px-4">Purity Standard</th>
                    <th className="py-3.5 px-4">Live Rate (₹/g)</th>
                    <th className="py-3.5 px-4">Standard Denomination</th>
                    <th className="py-3.5 px-4">Source</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {/* Gold Purities */}
                  {(metalRatesData?.gold || []).map((row) => (
                    <tr key={`gold-${row.purity}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-bold flex items-center gap-1.5">
                        <GiGoldBar className="w-4 h-4 text-amber-500" />
                        <span>Gold</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-amber-700 dark:text-amber-300 font-heading">
                          {row.purity}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-1">
                          ({row.purity === '24K' ? '99.9% Pure' : row.purity === '18K' ? '75.0% Standard' : '91.6% Standard'})
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-black font-heading text-amber-700 dark:text-amber-400 tabular-nums">
                        {formatCurrency(row.rate_per_gram)}
                      </td>
                      <td className="py-3.5 px-4 tabular-nums">
                        {formatCurrency(row.rate_per_gram * 8)} <span className="text-slate-400 text-[10px]">/ 8g Sov</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{row.source}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                          {row.status || 'Active'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => openRateOverride('GOLD', row.purity, row.rate_per_gram)}
                          className="px-3 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-xs font-bold font-heading cursor-pointer transition-all"
                        >
                          Calibrate
                        </button>
                      </td>
                    </tr>
                  ))}

                  {/* Silver Purities */}
                  {(metalRatesData?.silver || []).map((row) => (
                    <tr key={`silver-${row.purity}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-bold flex items-center gap-1.5">
                        <TbCoin className="w-4 h-4 text-slate-400" />
                        <span>Silver</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-sky-700 dark:text-sky-300 font-heading">
                          {row.purity}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-1">
                          ({row.purity === '999' ? '99.9% Fine' : row.purity === '925' ? 'Sterling Silver' : 'Silver Standard'})
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-black font-heading text-sky-700 dark:text-sky-400 tabular-nums">
                        {formatCurrency(row.rate_per_gram)}
                      </td>
                      <td className="py-3.5 px-4 tabular-nums">
                        {row.purity === '999'
                          ? `${formatCurrency(row.rate_per_gram * 1000)} / 1 Kg`
                          : `${formatCurrency(row.rate_per_gram * 10)} / 10g`}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{row.source}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                          {row.status || 'Active'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => openRateOverride('SILVER', row.purity, row.rate_per_gram)}
                          className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold font-heading cursor-pointer transition-all"
                        >
                          Calibrate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 5: ACTIVITY & AUDIT LOGS
          ========================================================= */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl overflow-hidden animate-in fade-in duration-200">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FiClock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h3 className="text-base font-black text-slate-900 dark:text-white font-heading">
                Administrative Audit Logs
              </h3>
            </div>
            <button
              type="button"
              onClick={fetchLogs}
              disabled={loadingLogs}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 flex items-center gap-1 font-heading cursor-pointer"
            >
              <FiRefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin' : ''}`} />
              <span>Refresh Logs</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {loadingLogs ? (
              <div className="p-8 text-center text-slate-400 text-xs">Loading audit records...</div>
            ) : auditLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No administrative actions logged yet.
              </div>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-mono">
                        {log.action}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white font-heading">
                        {log.description || `${log.action} on ${log.target_type}`}
                      </span>
                    </div>
                    {(log.old_value || log.new_value) && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Changed from <span className="text-rose-600 dark:text-rose-400">{log.old_value || 'None'}</span> → <span className="text-emerald-600 dark:text-emerald-400">{log.new_value || 'None'}</span>
                      </p>
                    )}
                  </div>

                  <div className="text-right text-[11px] text-slate-500 dark:text-slate-400 self-start sm:self-auto font-mono">
                    <div>{formatReadableDate(log.created_at)}</div>
                    <div className="text-slate-400 dark:text-slate-500">By Admin #{log.admin_id || 'System'}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 6: SYSTEM HEALTH & INFRASTRUCTURE
          ========================================================= */}
      {activeTab === 'health' && (
        <div className="bg-white dark:bg-slate-900/60 p-6 rounded-[18px] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <FiActivity className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white font-heading">
                  System Health &amp; Infrastructure
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Live API, Database &amp; Server Metrics</p>
              </div>
            </div>
            <button
              type="button"
              onClick={fetchHealth}
              disabled={loadingHealth}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer font-heading"
            >
              <FiRefreshCw className={`w-3.5 h-3.5 ${loadingHealth ? 'animate-spin' : ''}`} />
              <span>{loadingHealth ? 'Probing...' : 'Refresh'}</span>
            </button>
          </div>

          {healthData ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-heading">Status</span>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${healthData.status === 'healthy' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                  <span className="text-sm font-black text-slate-900 dark:text-white capitalize font-heading">
                    {healthData.status || 'Unknown'}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-heading">Database</span>
                <div className="flex items-center gap-2 mt-1.5">
                  <FiDatabase className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm font-black text-slate-900 dark:text-white font-heading">
                    {healthData.services?.database?.dialect?.toUpperCase() || 'DB'}: {healthData.services?.database?.latencyMs || 'OK'}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-heading">Uptime</span>
                <p className="text-sm font-black text-slate-900 dark:text-white font-heading mt-1.5">
                  {healthData.system?.uptimeFormatted || `${healthData.uptime?.seconds || 0}s`}
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-heading">Memory (Heap)</span>
                <p className="text-sm font-black text-slate-900 dark:text-white font-heading mt-1.5">
                  {healthData.memory?.heapUsedMB ? `${healthData.memory.heapUsedMB} MB` : healthData.memory?.heapUsed || 'N/A'}
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-heading">Environment</span>
                <p className="text-sm font-black text-slate-900 dark:text-white font-heading mt-1.5 capitalize">
                  {healthData.system?.environment || 'Development'}
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-heading">Node Engine</span>
                <p className="text-sm font-black text-slate-900 dark:text-white font-heading mt-1.5">
                  {healthData.system?.nodeVersion || process?.version || 'v20+'}
                </p>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 text-sm font-medium">
              Loading system metrics...
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          MODAL 1: USER DETAILS DRAWER / MODAL
          ========================================================= */}
      {selectedUserId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedUserId(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-amber-500/25 p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedUserId(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl transition-all cursor-pointer"
            >
              <FiX className="w-5 h-5" />
            </button>

            {loadingUserDetails ? (
              <div className="py-12 text-center text-slate-400 space-y-3">
                <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-400 rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold font-heading">Loading User Profile...</p>
              </div>
            ) : selectedUserDetails ? (
              <div className="space-y-6">
                {/* Header Profile Section */}
                <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-heading font-black text-xl shadow-md">
                    {selectedUserDetails.user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-black text-slate-900 dark:text-white font-heading">
                        {selectedUserDetails.user.username}
                      </h3>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        ID: #{selectedUserDetails.user.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{selectedUserDetails.user.email}</p>
                  </div>
                </div>

                {/* Account & Status Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 block font-heading">
                      Plan / Version
                    </span>
                    <span className="text-xs font-black text-amber-600 dark:text-amber-400 font-heading">
                      {selectedUserDetails.user.plan === 'paid' ? 'Paid Version' : 'Free Version'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 block font-heading">
                      Account Status
                    </span>
                    <span
                      className={`text-xs font-black font-heading ${
                        selectedUserDetails.user.is_active ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {selectedUserDetails.user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 block font-heading">
                      Phone Number
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-heading">
                      {selectedUserDetails.user.phone || 'Not Provided'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 block font-heading">
                      Registration Date
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-heading">
                      {formatReadableDate(selectedUserDetails.user.created_at)}
                    </span>
                  </div>
                </div>

                {/* Vault Holdings Summary */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GiGoldBar className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white font-heading block">
                        Physical Bullion Vault Portfolio
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {selectedUserDetails.portfolioSummary?.totalItems || 0} registered items in personal vault
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-amber-600 dark:text-amber-400 font-heading block">
                      {(selectedUserDetails.portfolioSummary?.totalWeightGrams || 0).toFixed(2)} g
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Total Gold Weight</span>
                  </div>
                </div>

                {/* Payment History Table */}
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-heading mb-3 flex items-center gap-2">
                    <FiCreditCard className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Payment & Subscription History</span>
                  </h4>

                  {selectedUserDetails.payments.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 text-center text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                      No payment transactions on record for this user (Free Account).
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-heading uppercase text-[10px]">
                          <tr>
                            <th className="py-2.5 px-3">Date</th>
                            <th className="py-2.5 px-3">Amount</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3">Method</th>
                            <th className="py-2.5 px-3">Txn ID</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                          {selectedUserDetails.payments.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                              <td className="py-2.5 px-3">{formatReadableDate(p.payment_date || p.created_at)}</td>
                              <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{formatCurrency(p.amount)}</td>
                              <td className="py-2.5 px-3">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    p.status === 'paid'
                                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                                      : p.status === 'pending'
                                      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                                      : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                                  }`}
                                >
                                  {p.status}
                                </span>
                              </td>
                              <td className="py-2.5 px-3">{p.payment_method || 'UPI'}</td>
                              <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                                {p.transaction_id || '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Quick Account Status Toggle in Details Modal */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Account Status:{' '}
                    <strong className={selectedUserDetails.user.is_active ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                      {selectedUserDetails.user.is_active ? 'Active' : 'Inactive'}
                    </strong>
                  </div>

                  <button
                    type="button"
                    disabled={selectedUserDetails.user.id === currentAdmin?.id}
                    onClick={() => {
                      setSelectedUserId(null);
                      openStatusConfirmation(
                        selectedUserDetails.user,
                        !selectedUserDetails.user.is_active
                      );
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold font-heading cursor-pointer transition-all ${
                      selectedUserDetails.user.is_active
                        ? 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                        : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {selectedUserDetails.user.is_active ? 'Deactivate Account' : 'Activate Account'}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: CONFIRM STATUS CHANGE MODAL
          ========================================================= */}
      {statusConfirmModal.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => {
            if (!statusConfirmModal.loading) {
              setStatusConfirmModal((prev) => ({ ...prev, isOpen: false }));
            }
          }}
        >
          <div
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-amber-500/25 p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning Icon Badge */}
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto shadow-sm ${
                statusConfirmModal.targetStatus
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
              }`}
            >
              {statusConfirmModal.targetStatus ? (
                <FiCheckCircle className="w-7 h-7 stroke-[2]" />
              ) : (
                <FiAlertTriangle className="w-7 h-7 stroke-[2]" />
              )}
            </div>

            {/* Content */}
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-slate-900 dark:text-white font-heading">
                {statusConfirmModal.targetStatus ? 'Activate User Account?' : 'Deactivate User Account?'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {statusConfirmModal.targetStatus
                  ? `Are you sure you want to activate ${statusConfirmModal.user?.username}'s account? They will regain full access to log in.`
                  : `Are you sure you want to deactivate ${statusConfirmModal.user?.username}'s account? They will be blocked from logging in until reactivated.`}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={statusConfirmModal.loading}
                onClick={() => setStatusConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="w-full py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all cursor-pointer disabled:opacity-50 font-heading border border-slate-200 dark:border-slate-700"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={statusConfirmModal.loading}
                onClick={handleConfirmStatusChange}
                className={`w-full py-3 px-4 rounded-xl text-white font-black text-xs sm:text-sm shadow-md transition-all transform active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer font-heading ${
                  statusConfirmModal.targetStatus
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 shadow-emerald-600/30'
                    : 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 shadow-rose-600/30'
                }`}
              >
                {statusConfirmModal.loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Updating...</span>
                  </div>
                ) : (
                  <span>{statusConfirmModal.targetStatus ? 'Activate User' : 'Deactivate User'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 3: EDIT PAID VERSION PRICING MODAL
          ========================================================= */}
      {priceModal.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => {
            if (!priceModal.loading) {
              setPriceModal((prev) => ({ ...prev, isOpen: false }));
            }
          }}
        >
          <div
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-amber-500/25 p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Icon */}
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-sm">
              <FiDollarSign className="w-7 h-7 stroke-[2.2]" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-xl font-black text-slate-900 dark:text-white font-heading">
                {priceModal.confirmStep ? 'Confirm Price Update' : 'Manage Paid Version Price'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                {priceModal.confirmStep
                  ? `Update paid version price from ₹${stats?.pricing?.currentPaidPrice || 999} to ₹${priceModal.newPrice}?`
                  : 'Set the new price in INR for future Paid Version upgrades.'}
              </p>
            </div>

            {!priceModal.confirmStep ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 font-heading">
                    Paid Version Price (₹ INR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-600 dark:text-amber-400 font-bold text-base">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={priceModal.newPrice}
                      onChange={(e) =>
                        setPriceModal((prev) => ({
                          ...prev,
                          newPrice: e.target.value,
                          error: '',
                        }))
                      }
                      placeholder="e.g. 1199"
                      className="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-base font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-heading"
                    />
                  </div>
                  {priceModal.error && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 mt-1.5 font-medium">{priceModal.error}</p>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                  <p className="font-bold text-slate-800 dark:text-slate-300">Important Rule:</p>
                  <p>
                    Historical payment amounts will remain unchanged. Only future subscriptions and plan conversions will use this updated price.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-2">
                <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-300 block font-heading">
                  Price Change Summary
                </span>
                <div className="flex items-center justify-center gap-3 text-lg font-black font-heading">
                  <span className="text-slate-400 line-through">
                    ₹{stats?.pricing?.currentPaidPrice || 999}
                  </span>
                  <span className="text-amber-600 dark:text-amber-400">→</span>
                  <span className="text-emerald-600 dark:text-emerald-400">₹{priceModal.newPrice}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={priceModal.loading}
                onClick={() => {
                  if (priceModal.confirmStep) {
                    setPriceModal((prev) => ({ ...prev, confirmStep: false }));
                  } else {
                    setPriceModal((prev) => ({ ...prev, isOpen: false }));
                  }
                }}
                className="w-full py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all cursor-pointer disabled:opacity-50 font-heading border border-slate-200 dark:border-slate-700"
              >
                {priceModal.confirmStep ? 'Back' : 'Cancel'}
              </button>

              <button
                type="button"
                disabled={priceModal.loading}
                onClick={handleSavePrice}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-amber-500/30 transition-all transform active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer font-heading"
              >
                {priceModal.loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  <span>{priceModal.confirmStep ? 'Confirm & Save' : 'Save Changes'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 4: CALIBRATE / MANUAL OVERRIDE METAL RATE MODAL
          ========================================================= */}
      {rateOverrideModal.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => {
            if (!rateOverrideModal.loading) {
              setRateOverrideModal((prev) => ({ ...prev, isOpen: false }));
            }
          }}
        >
          <div
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-amber-500/25 p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Icon */}
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-sm">
              <FiTrendingUp className="w-7 h-7 stroke-[2.2]" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-xl font-black text-slate-900 dark:text-white font-heading">
                Calibrate Metal Rate
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Manually calibrate or override the live market quote for Gold or Silver.
              </p>
            </div>

            <div className="space-y-4">
              {/* Metal Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 font-heading">
                  Precious Metal
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setRateOverrideModal((prev) => ({
                        ...prev,
                        metal: 'GOLD',
                        purity: '24K',
                        error: '',
                      }))
                    }
                    className={`py-2.5 rounded-xl font-heading font-black text-xs border transition-all cursor-pointer ${
                      rateOverrideModal.metal === 'GOLD'
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    🪙 Gold
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setRateOverrideModal((prev) => ({
                        ...prev,
                        metal: 'SILVER',
                        purity: '999',
                        error: '',
                      }))
                    }
                    className={`py-2.5 rounded-xl font-heading font-black text-xs border transition-all cursor-pointer ${
                      rateOverrideModal.metal === 'SILVER'
                        ? 'bg-slate-300 dark:bg-slate-700 text-slate-950 dark:text-white border-slate-400 dark:border-slate-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    🥈 Silver
                  </button>
                </div>
              </div>

              {/* Purity Standards */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 font-heading">
                  Purity / Standard
                </label>
                <select
                  value={rateOverrideModal.purity}
                  onChange={(e) =>
                    setRateOverrideModal((prev) => ({
                      ...prev,
                      purity: e.target.value,
                      error: '',
                    }))
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-heading"
                >
                  {rateOverrideModal.metal === 'GOLD' ? (
                    <>
                      <option value="24K">24K Gold (99.9% Pure)</option>
                      <option value="22K">22K Gold (91.6% Standard)</option>
                      <option value="18K">18K Gold (75.0% Standard)</option>
                    </>
                  ) : (
                    <>
                      <option value="999">999 Fine Silver (99.9%)</option>
                      <option value="925">925 Sterling Silver (92.5%)</option>
                      <option value="916">916 Silver Standard (91.6%)</option>
                      <option value="900">900 Coin Silver (90.0%)</option>
                    </>
                  )}
                </select>
              </div>

              {/* Rate per gram */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 font-heading">
                  Calibrated Rate (₹ / Gram)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-600 dark:text-amber-400 font-bold text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={rateOverrideModal.rate}
                    onChange={(e) =>
                      setRateOverrideModal((prev) => ({
                        ...prev,
                        rate: e.target.value,
                        error: '',
                      }))
                    }
                    placeholder="e.g. 7450"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-heading"
                  />
                </div>
              </div>

              {/* Reason / Notes */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 font-heading">
                  Reason / Administrative Notes
                </label>
                <input
                  type="text"
                  value={rateOverrideModal.reason}
                  onChange={(e) =>
                    setRateOverrideModal((prev) => ({
                      ...prev,
                      reason: e.target.value,
                    }))
                  }
                  placeholder="e.g. Evening market rate update calibration"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-heading"
                />
              </div>

              {rateOverrideModal.error && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                  {rateOverrideModal.error}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={rateOverrideModal.loading}
                onClick={() => setRateOverrideModal((prev) => ({ ...prev, isOpen: false }))}
                className="w-full py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all cursor-pointer disabled:opacity-50 font-heading border border-slate-200 dark:border-slate-700"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={rateOverrideModal.loading}
                onClick={handleSaveRateOverride}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-amber-500/30 transition-all cursor-pointer font-heading flex items-center justify-center gap-2"
              >
                {rateOverrideModal.loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  <span>Apply Override</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

