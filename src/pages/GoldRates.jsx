import React, { useState } from 'react';
import { useGoldRate } from '../context/GoldRateContext';
import { formatCurrency } from '../utils/formatters';
import { FiRefreshCw, FiClock, FiShield } from 'react-icons/fi';

export const GoldRates = () => {
  const {
    rate24K,
    rate22K,
    rate18K,
    silverRate,
    silverRate925,
    silverRate916,
    silverRate900,
    sourceUpdate,
    source,
    ratesData,
    status,
    refreshGoldRates,
    isLoading,
  } = useGoldRate();

  const [refreshing, setRefreshing] = useState(false);
  const [calcMetal, setCalcMetal] = useState('22K');
  const [calcWeight, setCalcWeight] = useState(8);
  const [calcMakingChargesPercent, setCalcMakingChargesPercent] = useState(10);
  const [includeGst, setIncludeGst] = useState(true);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshGoldRates();
    setTimeout(() => setRefreshing(false), 500);
  };

  let activeRatePerGram = rate22K;
  if (calcMetal === '24K') activeRatePerGram = rate24K;
  else if (calcMetal === '18K') activeRatePerGram = rate18K;
  else if (calcMetal === '999') activeRatePerGram = silverRate;
  else if (calcMetal === '925') activeRatePerGram = silverRate925;

  const rawBullionValue = (Number(calcWeight) || 0) * activeRatePerGram;
  const makingChargesAmount = rawBullionValue * ((Number(calcMakingChargesPercent) || 0) / 100);
  const subtotalWithMaking = rawBullionValue + makingChargesAmount;
  const gstAmount = includeGst ? subtotalWithMaking * 0.03 : 0;
  const totalEstimatedCost = subtotalWithMaking + gstAmount;

  const goldRates = [
    { name: '24K Gold', purity: '99.9%', rate: rate24K },
    { name: '22K Gold', purity: '91.6%', rate: rate22K },
    { name: '18K Gold', purity: '75.0%', rate: rate18K },
  ];

  const silverRates = [
    { name: '999 Silver', purity: '99.9%', rate: silverRate },
    { name: '925 Silver', purity: '92.5%', rate: silverRate925 },
    { name: '916 Silver', purity: '91.6%', rate: silverRate916 },
    { name: '900 Silver', purity: '90.0%', rate: silverRate900 },
  ];

  return (
    <div className="relative space-y-6 pb-24 animate-fade-in max-w-lg mx-auto px-4 mt-2 overflow-hidden">
      
      {/* Decorative Floating Elements */}
      <div className="absolute top-10 -right-8 text-amber-500/20 dark:text-amber-500/10 animate-float-bob text-6xl -rotate-12 pointer-events-none select-none z-0">
        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M48 208v160l64 64h384l-64-64V208l-64-64H64l-16 64zm48-32h256l48 48H128l-32-48zm352 192L384 432H96l48-48h304v-16z"></path></svg>
      </div>
      <div className="absolute top-40 left-4 text-slate-400/20 dark:text-slate-400/10 animate-float-bob text-4xl rotate-45 pointer-events-none select-none z-0" style={{ animationDelay: '2.5s', animationDuration: '4s' }}>
        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M48 208v160l64 64h384l-64-64V208l-64-64H64l-16 64zm48-32h256l48 48H128l-32-48zm352 192L384 432H96l48-48h304v-16z"></path></svg>
      </div>
      <div className="absolute top-80 -left-10 text-slate-400/20 dark:text-slate-400/10 animate-float-bob text-6xl rotate-12 pointer-events-none select-none z-0" style={{ animationDelay: '1.5s' }}>
        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M48 208v160l64 64h384l-64-64V208l-64-64H64l-16 64zm48-32h256l48 48H128l-32-48zm352 192L384 432H96l48-48h304v-16z"></path></svg>
      </div>
      <div className="absolute top-96 right-2 text-amber-500/15 dark:text-amber-500/10 animate-float-bob text-5xl rotate-[60deg] pointer-events-none select-none z-0" style={{ animationDelay: '0.5s', animationDuration: '3.8s' }}>
        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M48 208v160l64 64h384l-64-64V208l-64-64H64l-16 64zm48-32h256l48 48H128l-32-48zm352 192L384 432H96l48-48h304v-16z"></path></svg>
      </div>
      <div className="absolute bottom-60 -left-6 text-slate-400/15 dark:text-slate-400/10 animate-float-bob text-5xl -rotate-[30deg] pointer-events-none select-none z-0" style={{ animationDelay: '1.1s', animationDuration: '4.2s' }}>
        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M48 208v160l64 64h384l-64-64V208l-64-64H64l-16 64zm48-32h256l48 48H128l-32-48zm352 192L384 432H96l48-48h304v-16z"></path></svg>
      </div>
      <div className="absolute bottom-40 -right-6 text-amber-500/10 dark:text-amber-500/5 animate-float-bob text-5xl -rotate-45 pointer-events-none select-none z-0" style={{ animationDelay: '0.8s' }}>
        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M48 208v160l64 64h384l-64-64V208l-64-64H64l-16 64zm48-32h256l48 48H128l-32-48zm352 192L384 432H96l48-48h304v-16z"></path></svg>
      </div>
      <div className="absolute bottom-10 left-10 text-amber-500/15 dark:text-amber-500/10 animate-float-bob text-4xl rotate-[15deg] pointer-events-none select-none z-0" style={{ animationDelay: '2.2s', animationDuration: '3.5s' }}>
        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M48 208v160l64 64h384l-64-64V208l-64-64H64l-16 64zm48-32h256l48 48H128l-32-48zm352 192L384 432H96l48-48h304v-16z"></path></svg>
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/60">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)] dark:text-white tracking-tight">Market Rates</h1>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${status.includes('Live') || status.includes('Success') ? 'bg-[var(--profit-green)] text-[var(--profit-green)]' : 'bg-amber-500 text-amber-500'}`} />
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] dark:text-slate-500">● {source} · {sourceUpdate ? `Updated ${sourceUpdate}` : 'Updated recently'}</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing || isLoading}
          className="p-3 rounded-full bg-slate-50 dark:bg-slate-800 shadow-sm text-slate-600 dark:text-slate-300 transition-all active:scale-95"
        >
          <FiRefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin text-amber-500' : ''}`} />
        </button>
      </div>

      {/* Gold Rates Grid */}
      <div className="relative z-10 space-y-3">
        <div className="bg-[var(--gold-1)]/30 dark:bg-transparent rounded-lg px-2 py-1 inline-block mb-1">
          <h2 className="text-[11px] font-black text-[var(--text-gold)] dark:text-amber-500 uppercase tracking-widest flex items-center gap-2 animate-fade-in" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
            <span>🥇</span> Physical Gold
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {goldRates.map((item, idx) => (
            <div 
              key={item.name} 
              className="flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-card)] dark:bg-gradient-to-r dark:from-amber-900/10 dark:to-transparent border border-[var(--border-color)] dark:border-amber-900/20 hover:scale-[1.02] hover:shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:hover:shadow-lg dark:hover:shadow-amber-500/10 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${150 + idx * 50}ms`, animationFillMode: 'both' }}
            >
              <div>
                <p className="text-base font-bold text-[var(--text-primary)] dark:text-white">{item.name}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] dark:text-slate-500">{item.purity} Purity</p>
              </div>
              <p className="text-xl font-black text-[var(--text-primary)] dark:text-white tabular-nums tracking-tight">
                {formatCurrency(item.rate)}<span className="text-xs text-[var(--text-muted)] dark:text-slate-400 font-medium ml-0.5">/g</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Silver Rates Grid */}
      <div className="relative z-10 space-y-3 pt-2">
        <h2 className="text-[11px] font-black text-[var(--text-primary)] dark:text-slate-400 uppercase tracking-widest flex items-center gap-2 animate-fade-in" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
          <span>🥈</span> Physical Silver
        </h2>
        <div className="grid grid-cols-1 gap-3">
          {silverRates.map((item, idx) => (
            <div 
              key={item.name} 
              className="flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-card)] dark:bg-gradient-to-r dark:from-slate-800/30 dark:to-transparent border border-[var(--border-silver)] dark:border-slate-800/50 hover:scale-[1.02] hover:shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:hover:shadow-lg dark:hover:shadow-slate-500/10 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${350 + idx * 50}ms`, animationFillMode: 'both' }}
            >
              <div>
                <p className="text-base font-bold text-[var(--text-primary)] dark:text-white">{item.name}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] dark:text-slate-500">{item.purity} Purity</p>
              </div>
              <p className="text-xl font-black text-[var(--text-primary)] dark:text-white tabular-nums tracking-tight">
                {formatCurrency(item.rate)}<span className="text-xs text-[var(--text-muted)] dark:text-slate-400 font-medium ml-0.5">/g</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Premium Calculator Widget */}
      <div className="relative z-10 pt-6">
        <h2 className="text-base font-bold text-[var(--text-primary)] dark:text-white flex items-center gap-2 mb-0.5">
          Purchase Estimator
        </h2>
        <p className="text-xs text-[var(--text-secondary)] dark:text-slate-400 mb-4">
          Estimate the value of your Gold or Silver ›
        </p>
        
        <div className="bg-[var(--bg-card)] dark:bg-slate-900/40 rounded-3xl p-5 border border-[var(--border-color)] dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-sm space-y-5">
          
          {/* Metal Selector */}
          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar -mx-2 px-2">
            {['24K', '22K', '18K', '999', '925'].map(m => (
              <button
                key={m}
                onClick={() => setCalcMetal(m)}
                className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-transform active:scale-95 ${
                  calcMetal === m 
                    ? 'bg-[var(--gold-3)] text-white dark:bg-white dark:text-slate-900 shadow-md' 
                    : 'bg-[var(--bg-subtle)] dark:bg-slate-800/50 text-[var(--text-secondary)] dark:text-slate-400'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[var(--bg-subtle)] dark:bg-slate-800/30 rounded-2xl p-3 border border-[var(--border-color)] dark:border-slate-800/50 focus-within:border-[var(--gold-3)] dark:focus-within:border-amber-400 transition-colors">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] dark:text-slate-400 mb-1">Weight (grams)</label>
              <input
                type="number"
                value={calcWeight}
                onChange={e => setCalcWeight(e.target.value)}
                className="w-full bg-transparent text-lg font-black text-[var(--text-primary)] dark:text-white outline-none tabular-nums"
                placeholder="0"
              />
            </div>
            <div className="bg-[var(--bg-subtle)] dark:bg-slate-800/30 rounded-2xl p-3 border border-[var(--border-color)] dark:border-slate-800/50 focus-within:border-[var(--gold-3)] dark:focus-within:border-amber-400 transition-colors">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] dark:text-slate-400 mb-1">Making Chg. (%)</label>
              <input
                type="number"
                value={calcMakingChargesPercent}
                onChange={e => setCalcMakingChargesPercent(e.target.value)}
                className="w-full bg-transparent text-lg font-black text-[var(--text-primary)] dark:text-white outline-none tabular-nums"
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${includeGst ? 'bg-[var(--profit-green)]' : 'bg-[var(--border-color)] dark:bg-slate-700'}`}>
                {includeGst && <span className="text-white text-xs font-bold">✓</span>}
              </div>
              <input 
                type="checkbox" 
                checked={includeGst}
                onChange={e => setIncludeGst(e.target.checked)}
                className="hidden"
              />
              <span className="text-xs font-bold text-[var(--text-secondary)] dark:text-slate-400 group-hover:text-[var(--text-primary)] dark:group-hover:text-white transition-colors">Add 3% GST</span>
            </label>
          </div>

          <div className="bg-[var(--bg-subtle)] dark:bg-gradient-to-br dark:from-amber-900/30 dark:to-orange-900/10 rounded-2xl p-4 flex flex-col justify-center items-center mt-2 relative overflow-hidden border border-[var(--border-color)] dark:border-transparent">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] dark:text-amber-500/80 mb-1 relative z-10">Estimated Total Cost</span>
            <span className="text-3xl font-black text-[var(--text-primary)] dark:text-white tabular-nums tracking-tighter relative z-10 dark:text-gold-gradient">
              {formatCurrency(totalEstimatedCost)}
            </span>
          </div>

        </div>
      </div>

    </div>
  );
};

export default GoldRates;