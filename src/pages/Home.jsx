import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getPortfolio } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useGoldRate } from '../context/GoldRateContext';
import { formatCurrency, formatGrams } from '../utils/formatters';
import PurchaseCard from '../components/PurchaseCard';
import { FiPlus, FiArrowRight, FiRefreshCw } from 'react-icons/fi';

export const Home = () => {
  const { user } = useAuth();
  const { 
    rate24K, 
    rate22K, 
    silverRate, 
    silverRate925,
    sourceUpdate, 
    isStale, 
    getLiveRate,
    refreshGoldRates, 
  } = useGoldRate();

  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getPortfolio();
      if (res?.data) {
        setPortfolioData(res.data);
      }
    } catch (err) {
      console.error('Failed to load portfolio:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadDashboard(), refreshGoldRates()]);
    setTimeout(() => setRefreshing(false), 500);
  };

  const liveSummary = useMemo(() => {
    const rawPurchases = portfolioData?.purchases || [];
    let totalInvested = 0;
    let currentLiveValue = 0;

    let goldWeight = 0;
    let goldValue = 0;

    let silverWeight = 0;
    let silverValue = 0;

    rawPurchases.forEach((p) => {
      const isSilver = (p.asset_type || '').toUpperCase() === 'SILVER';
      const purity = (p.gold_purity || p.purity || (isSilver ? '999' : '22K')).toUpperCase();
      const weight = Number(p.weight) || 0;
      const purchaseRate = Number(p.purchase_rate) || 0;
      const purchaseVal = weight * purchaseRate;

      totalInvested += purchaseVal;
      const liveRate = getLiveRate(isSilver ? 'SILVER' : 'GOLD', purity);
      const itemLiveValue = weight * liveRate;
      currentLiveValue += itemLiveValue;

      if (isSilver) {
        silverWeight += weight;
        silverValue += itemLiveValue;
      } else {
        goldWeight += weight;
        goldValue += itemLiveValue;
      }
    });

    const totalProfit = rawPurchases.length > 0 ? currentLiveValue - totalInvested : 0;
    const totalProfitPercentage = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

    return {
      total_items: rawPurchases.length,
      current_value: currentLiveValue,
      total_profit: totalProfit,
      total_profit_percentage: totalProfitPercentage,
      is_profit: totalProfit >= 0,
      gold: { weight: goldWeight, currentValue: goldValue },
      silver: { weight: silverWeight, currentValue: silverValue },
    };
  }, [portfolioData, getLiveRate]);

  const recentPurchases = portfolioData?.recent_purchases || portfolioData?.purchases?.slice(0, 3) || [];
  const freeAssetsUsed = portfolioData?.purchases?.length || 0;
  const maxFreeAssets = 10;
  const isPaid = false; // Add real user logic here if user.plan exists

  return (
    <div className="space-y-8 pb-24 animate-fade-in max-w-lg mx-auto">
      
      {/* 1. Welcome & Header */}
      <div className="flex justify-between items-start px-4 pt-4">
        <div>
          <p className="text-sm font-medium text-[var(--text-secondary)] dark:text-slate-500 mb-1">Hello, {user?.username || 'Investor'}</p>
          <h1 className="text-2xl font-black text-[var(--text-primary)] dark:text-white tracking-tight">Your Vault</h1>
        </div>
        <button
          onClick={handleManualRefresh}
          disabled={refreshing || loading}
          className={`p-2.5 rounded-full bg-[var(--bg-card)] dark:bg-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-sm text-[var(--text-secondary)] dark:text-slate-300 transition-all active:scale-95 ${refreshing ? 'animate-spin' : ''}`}
        >
          <FiRefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Hero Portfolio (No heavy borders, huge typography) */}
      <div className="px-4 text-center space-y-2 mt-4">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] dark:text-slate-400">Total Portfolio Value</p>
        {loading ? (
          <div className="h-12 w-48 bg-[var(--border-color)] dark:bg-slate-800 animate-pulse rounded-lg mx-auto"></div>
        ) : (
          <h2 className="text-5xl sm:text-6xl font-black tabular-nums tracking-tighter text-[var(--text-primary)] dark:text-white text-gold-gradient py-2">
            {formatCurrency(liveSummary.current_value)}
          </h2>
        )}

        {!loading && liveSummary.total_items > 0 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2">
            <span className={`text-sm font-bold ${liveSummary.is_profit ? 'text-[var(--profit-green)] dark:text-emerald-500' : 'text-[var(--loss-red)] dark:text-rose-500'}`}>
              {liveSummary.is_profit ? '↑' : '↓'} {formatCurrency(Math.abs(liveSummary.total_profit))}
            </span>
            <span className="text-sm text-[var(--text-secondary)] dark:text-slate-500 font-medium">
              ({liveSummary.is_profit ? '+' : ''}{liveSummary.total_profit_percentage.toFixed(2)}%)
            </span>
          </div>
        )}
      </div>

      {/* 3. Asset Split Pills */}
      <div className="px-4 flex gap-3">
        <div className="flex-1 bg-[var(--bg-card)] dark:bg-slate-900/50 rounded-2xl p-4 flex items-center justify-between border border-[var(--border-color)] dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--gold-1)] dark:bg-amber-900/30 flex items-center justify-center text-lg">🥇</div>
            <div>
              <p className="text-xs font-semibold text-[var(--text-secondary)] dark:text-slate-500">Gold</p>
              <p className="text-sm font-bold text-[var(--text-primary)] dark:text-white tabular-nums">{formatCurrency(liveSummary.gold.currentValue)}</p>
            </div>
          </div>
        </div>
        <div className="flex-1 bg-[var(--bg-card)] dark:bg-slate-900/50 rounded-2xl p-4 flex items-center justify-between border border-[var(--border-silver)] dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg">🥈</div>
            <div>
              <p className="text-xs font-semibold text-[var(--text-secondary)] dark:text-slate-500">Silver</p>
              <p className="text-sm font-bold text-[var(--text-primary)] dark:text-white tabular-nums">{formatCurrency(liveSummary.silver.currentValue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Action Buttons */}
      <div className="px-4 flex gap-3">
        <Link 
          to="/add-gold" 
          className="flex-1 flex justify-center items-center gap-2 py-4 rounded-2xl bg-gold-metallic hover:bg-gold-metallic-hover text-slate-950 font-bold text-sm shadow-[0_4px_14px_rgba(217,154,0,0.3)] dark:shadow-white/10 active:scale-[0.98] transition-transform"
        >
          <FiPlus className="w-5 h-5" />
          <span>Add Asset</span>
        </Link>
        <Link 
          to="/my-gold" 
          className="flex-1 flex justify-center items-center gap-2 py-4 rounded-2xl bg-[var(--bg-card)] dark:bg-slate-800 text-[var(--text-primary)] dark:text-white font-bold text-sm active:scale-[0.98] transition-transform border border-[var(--border-color)] dark:border-transparent"
        >
          <span>Vault Details</span>
        </Link>
      </div>

      {/* 5. Live Rates Section */}
      <div className="px-4 space-y-3 pt-2">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-[var(--text-primary)] dark:text-white">Live Market Rates</h3>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] dark:text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--profit-green)] animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            {isStale ? 'Delayed' : 'Live'}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[var(--bg-card)] dark:bg-gradient-to-br dark:from-amber-900/20 dark:to-orange-900/10 rounded-2xl p-4 border border-[var(--border-color)] dark:border-amber-900/30 shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-sm">
            <p className="text-xs font-bold text-[var(--text-gold)] dark:text-amber-500 mb-1 uppercase tracking-wider">24K Gold</p>
            <p className="text-lg font-black text-[var(--text-primary)] dark:text-white tabular-nums">{formatCurrency(rate24K)}<span className="text-[10px] font-semibold text-[var(--text-secondary)] dark:text-slate-500 ml-1">/g</span></p>
          </div>
          <div className="bg-[var(--bg-card)] dark:bg-gradient-to-br dark:from-slate-800/40 dark:to-zinc-800/20 rounded-2xl p-4 border border-[var(--border-silver)] dark:border-slate-700/50 shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-sm">
            <p className="text-xs font-bold text-[var(--text-secondary)] dark:text-slate-400 mb-1 uppercase tracking-wider">999 Silver</p>
            <p className="text-lg font-black text-[var(--text-primary)] dark:text-white tabular-nums">{formatCurrency(silverRate)}<span className="text-[10px] font-semibold text-[var(--text-secondary)] dark:text-slate-500 ml-1">/g</span></p>
          </div>
        </div>
      </div>

      {/* 6. Recent Assets */}
      <div className="px-4 space-y-3 pt-2">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-[var(--text-primary)] dark:text-white">Recent Additions</h3>
          <Link to="/my-gold" className="text-xs font-bold text-[var(--text-gold)] dark:text-amber-500 flex items-center gap-1">
            See all <FiArrowRight />
          </Link>
        </div>
        
        {loading ? (
          <div className="h-20 bg-[var(--border-color)] dark:bg-slate-800/50 rounded-2xl animate-pulse"></div>
        ) : recentPurchases.length > 0 ? (
          <div className="space-y-3">
            {recentPurchases.map((purchase) => {
              const isSilver = (purchase.asset_type || '').toUpperCase() === 'SILVER';
              const purity = purchase.gold_purity || purchase.purity || (isSilver ? '999' : '22K');
              const weight = Number(purchase.weight) || 0;
              const liveRate = getLiveRate(isSilver ? 'SILVER' : 'GOLD', purity);
              const currentValue = weight * liveRate;
              const purchaseValue = weight * Number(purchase.purchase_rate);
              const profit = currentValue - purchaseValue;

              return (
                <Link to="/my-gold" key={purchase.id} className="flex justify-between items-center p-4 rounded-2xl bg-[var(--bg-card)] dark:bg-slate-900/40 border border-[var(--border-color)] dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-none transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--bg-subtle)] dark:bg-slate-800 flex items-center justify-center text-lg border border-[var(--border-color)] dark:border-slate-700">
                      {isSilver ? '🥈' : '🥇'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[var(--text-primary)] dark:text-white">{purchase.item_name || 'Asset'}</p>
                      <p className="text-[10px] font-semibold text-[var(--text-secondary)] dark:text-slate-500 uppercase tracking-wider">{purity} • {weight}g</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold tabular-nums text-[var(--text-primary)] dark:text-white">{formatCurrency(currentValue)}</p>
                    <p className={`text-[11px] font-bold tabular-nums ${profit >= 0 ? 'text-[var(--profit-green)] dark:text-emerald-500' : 'text-[var(--loss-red)] dark:text-rose-500'}`}>
                      {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl bg-[var(--bg-subtle)] dark:bg-slate-900/30">
            <div className="w-12 h-12 bg-[var(--border-color)] dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">
              📦
            </div>
            <p className="text-sm font-medium text-[var(--text-primary)] dark:text-white mb-1">Your vault is empty</p>
            <p className="text-xs text-[var(--text-secondary)] dark:text-slate-500 mb-4">Add your first gold or silver asset to start tracking.</p>
            <Link to="/add-gold" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--text-primary)] dark:text-slate-900 bg-[var(--gold-2)] dark:bg-amber-400 px-4 py-2 rounded-full shadow-[0_4px_14px_rgba(217,154,0,0.3)] dark:shadow-none">
              <FiPlus /> Add Asset
            </Link>
          </div>
        )}
      </div>

    </div>
  );
};

export default Home;