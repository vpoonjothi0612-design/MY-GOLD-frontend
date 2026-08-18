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
    <div className="relative space-y-4 pb-24 animate-fade-in max-w-lg mx-auto px-4 mt-2 overflow-hidden">
      
      {/* Decorative Floating Elements - Hidden on mobile, ultra-subtle on desktop */}
      <div className="hidden md:block absolute top-10 -right-8 text-amber-500/5 dark:text-amber-500/5 animate-float-bob text-6xl -rotate-12 pointer-events-none select-none z-0">
        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M48 208v160l64 64h384l-64-64V208l-64-64H64l-16 64zm48-32h256l48 48H128l-32-48zm352 192L384 432H96l48-48h304v-16z"></path></svg>
      </div>
      <div className="hidden md:block absolute top-40 left-4 text-slate-400/5 dark:text-slate-400/5 animate-float-bob text-4xl rotate-45 pointer-events-none select-none z-0" style={{ animationDelay: '2.5s', animationDuration: '4s' }}>
        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M48 208v160l64 64h384l-64-64V208l-64-64H64l-16 64zm48-32h256l48 48H128l-32-48zm352 192L384 432H96l48-48h304v-16z"></path></svg>
      </div>
      <div className="hidden md:block absolute top-80 -left-10 text-slate-400/5 dark:text-slate-400/5 animate-float-bob text-6xl rotate-12 pointer-events-none select-none z-0" style={{ animationDelay: '1.5s' }}>
        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M48 208v160l64 64h384l-64-64V208l-64-64H64l-16 64zm48-32h256l48 48H128l-32-48zm352 192L384 432H96l48-48h304v-16z"></path></svg>
      </div>
      <div className="hidden md:block absolute top-96 right-2 text-amber-500/5 dark:text-amber-500/5 animate-float-bob text-5xl rotate-[60deg] pointer-events-none select-none z-0" style={{ animationDelay: '0.5s', animationDuration: '3.8s' }}>
        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M48 208v160l64 64h384l-64-64V208l-64-64H64l-16 64zm48-32h256l48 48H128l-32-48zm352 192L384 432H96l48-48h304v-16z"></path></svg>
      </div>
      <div className="hidden md:block absolute bottom-60 -left-6 text-slate-400/5 dark:text-slate-400/5 animate-float-bob text-5xl -rotate-[30deg] pointer-events-none select-none z-0" style={{ animationDelay: '1.1s', animationDuration: '4.2s' }}>
        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M48 208v160l64 64h384l-64-64V208l-64-64H64l-16 64zm48-32h256l48 48H128l-32-48zm352 192L384 432H96l48-48h304v-16z"></path></svg>
      </div>
      <div className="hidden md:block absolute bottom-40 -right-6 text-amber-500/5 dark:text-amber-500/5 animate-float-bob text-5xl -rotate-45 pointer-events-none select-none z-0" style={{ animationDelay: '0.8s' }}>
        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M48 208v160l64 64h384l-64-64V208l-64-64H64l-16 64zm48-32h256l48 48H128l-32-48zm352 192L384 432H96l48-48h304v-16z"></path></svg>
      </div>
      <div className="hidden md:block absolute bottom-10 left-10 text-amber-500/5 dark:text-amber-500/5 animate-float-bob text-4xl rotate-[15deg] pointer-events-none select-none z-0" style={{ animationDelay: '2.2s', animationDuration: '3.5s' }}>
        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M48 208v160l64 64h384l-64-64V208l-64-64H64l-16 64zm48-32h256l48 48H128l-32-48zm352 192L384 432H96l48-48h304v-16z"></path></svg>
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between pb-3">
        <div>
          <h1 className="text-[20px] sm:text-[24px] font-extrabold text-[var(--text-primary)] dark:text-white tracking-tight">Market Rates</h1>
          <p className="text-[12px] sm:text-[13px] font-medium text-[var(--text-muted)] mt-0.5">Live Gold & Silver prices</p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className={`w-1.5 h-1.5 rounded-full ${status.includes('Live') || status.includes('Success') ? 'bg-[var(--profit-green)] shadow-[0_0_6px_var(--profit-green)]' : 'bg-amber-500 shadow-[0_0_6px_#f59e0b]'}`} />
            <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] dark:text-slate-500">
              {status.includes('Live') || status.includes('Success') 
                ? (sourceUpdate ? `UPDATED ${sourceUpdate}` : 'UPDATED RECENTLY')
                : (sourceUpdate ? `LAST UPDATED: ${sourceUpdate}` : 'RATE UPDATE UNAVAILABLE')}
            </p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing || isLoading}
          aria-label="Refresh rates"
          className="w-11 h-11 flex items-center justify-center rounded-full bg-slate-50 dark:bg-[var(--bg-subtle)] border border-transparent dark:border-slate-800/50 shadow-sm text-slate-600 dark:text-slate-400 transition-all active:scale-95 hover:text-[var(--text-gold)]"
        >
          <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[var(--text-gold)]' : ''}`} />
        </button>
      </div>

      {/* Gold Rates Grid */}
      <div className="relative z-10 space-y-3 mt-3">
        <div className="border-b border-amber-500/20 pb-1.5">
          <h2 className="text-[10px] font-bold text-[var(--text-gold)] dark:text-[#E8B331] uppercase tracking-wider flex items-center gap-1.5">
            <span>🥇</span> PHYSICAL GOLD
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
          {goldRates.map((item, idx) => (
            <div 
              key={item.name} 
              className="flex items-center justify-between py-3.5 px-4 rounded-[16px] bg-[var(--bg-card)] dark:bg-gradient-to-br dark:from-[rgba(20,28,43,0.98)] dark:to-[rgba(12,18,30,0.98)] border border-[var(--border-color)] dark:border-[rgba(212,155,35,0.22)] shadow-sm dark:shadow-[0_8px_24px_rgba(0,0,0,0.22)] transition-transform duration-300 animate-fade-in hover:scale-[1.01]"
              style={{ animationDelay: `${150 + idx * 50}ms`, animationFillMode: 'both' }}
            >
              <div>
                <p className="text-[15px] font-bold text-[var(--text-primary)] dark:text-slate-100 leading-tight">{item.name}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] dark:text-amber-500/70 mt-0.5">{item.purity} Purity</p>
              </div>
              <p className="text-[18px] sm:text-[20px] font-extrabold text-[var(--text-primary)] dark:text-white tabular-nums tracking-tight leading-none">
                {formatCurrency(item.rate)}<span className="text-[10px] text-[var(--text-muted)] dark:text-slate-400 font-bold ml-1 opacity-70">/g</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Silver Rates Grid */}
      <div className="relative z-10 space-y-3 pt-4">
        <div className="border-b border-slate-500/20 pb-1.5">
          <h2 className="text-[10px] font-bold text-[var(--text-muted)] dark:text-[#BFC7D5] uppercase tracking-wider flex items-center gap-1.5">
            <span>🥈</span> PHYSICAL SILVER
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
          {silverRates.map((item, idx) => (
            <div 
              key={item.name} 
              className="flex items-center justify-between py-3.5 px-4 rounded-[16px] bg-[var(--bg-card)] dark:bg-gradient-to-br dark:from-[rgba(20,28,43,0.98)] dark:to-[rgba(12,18,30,0.98)] border border-[var(--border-silver)] dark:border-[rgba(160,175,195,0.18)] shadow-sm dark:shadow-[0_8px_24px_rgba(0,0,0,0.22)] transition-transform duration-300 animate-fade-in hover:scale-[1.01]"
              style={{ animationDelay: `${350 + idx * 50}ms`, animationFillMode: 'both' }}
            >
              <div>
                <p className="text-[15px] font-bold text-[var(--text-primary)] dark:text-slate-100 leading-tight">{item.name}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] dark:text-slate-400 mt-0.5">{item.purity} Purity</p>
              </div>
              <p className="text-[18px] sm:text-[20px] font-extrabold text-[var(--text-primary)] dark:text-white tabular-nums tracking-tight leading-none">
                {formatCurrency(item.rate)}<span className="text-[10px] text-[var(--text-muted)] dark:text-slate-400 font-bold ml-1 opacity-70">/g</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Premium Calculator Widget */}
      <div className="relative z-10 pt-2">
        <h2 className="text-[20px] font-[750] text-[var(--text-primary)] dark:text-white mb-0.5">
          Purchase Estimator
        </h2>
        <p className="text-[12px] font-medium text-[var(--text-secondary)] dark:text-slate-400 mb-3 sm:mb-4">
          Estimate the value of your Gold or Silver
        </p>
        
        <div className="rounded-[18px] p-4 flex flex-col gap-3 sm:gap-4 bg-[var(--bg-card)] dark:bg-gradient-to-br dark:from-[#111827] dark:to-[#0b1220] border border-[var(--border-color)] dark:border-amber-500/30 shadow-sm dark:shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
          
          {/* Metal Selector */}
          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {['24K', '22K', '18K', '999', '925'].map(m => (
              <button
                key={m}
                onClick={() => setCalcMetal(m)}
                className={`shrink-0 px-[14px] h-[40px] rounded-[12px] text-[13px] font-bold transition-all active:scale-95 flex items-center justify-center ${
                  calcMetal === m 
                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-500/20' 
                    : 'bg-[var(--bg-subtle)] dark:bg-[#0A0E17] border border-[var(--border-color)] dark:border-slate-800/80 text-[var(--text-secondary)] dark:text-slate-400 hover:text-[var(--text-primary)] dark:hover:text-slate-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[var(--bg-subtle)] dark:bg-[#0A0E17] rounded-[12px] p-3 border border-[var(--border-color)] dark:border-slate-800/80 focus-within:border-amber-500 dark:focus-within:border-[#D49B23] focus-within:ring-2 focus-within:ring-amber-500/10 transition-all flex flex-col justify-center h-[76px]">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] dark:text-slate-400 mb-1">Weight (grams)</label>
              <input
                type="number"
                value={calcWeight}
                onChange={e => setCalcWeight(e.target.value)}
                className="w-full bg-transparent text-[20px] font-bold text-[var(--text-primary)] dark:text-white outline-none tabular-nums placeholder:text-[var(--text-muted)]"
                placeholder="0"
              />
            </div>
            <div className="bg-[var(--bg-subtle)] dark:bg-[#0A0E17] rounded-[12px] p-3 border border-[var(--border-color)] dark:border-slate-800/80 focus-within:border-amber-500 dark:focus-within:border-[#D49B23] focus-within:ring-2 focus-within:ring-amber-500/10 transition-all flex flex-col justify-center h-[76px]">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] dark:text-slate-400 mb-1">Making Chg. (%)</label>
              <input
                type="number"
                value={calcMakingChargesPercent}
                onChange={e => setCalcMakingChargesPercent(e.target.value)}
                className="w-full bg-transparent text-[20px] font-bold text-[var(--text-primary)] dark:text-white outline-none tabular-nums placeholder:text-[var(--text-muted)]"
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex items-center">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <div className={`w-[20px] h-[20px] rounded-[6px] flex items-center justify-center transition-colors border ${includeGst ? 'bg-[var(--profit-green)] border-[var(--profit-green)]' : 'bg-[var(--bg-subtle)] dark:bg-[#0A0E17] border-[var(--border-color)] dark:border-slate-700'}`}>
                {includeGst && <span className="text-white text-[10px] font-bold">✓</span>}
              </div>
              <input 
                type="checkbox" 
                checked={includeGst}
                onChange={e => setIncludeGst(e.target.checked)}
                className="hidden"
              />
              <span className="text-[13px] font-medium text-[var(--text-secondary)] dark:text-slate-300 group-hover:text-[var(--text-primary)] dark:group-hover:text-white transition-colors">Add 3% GST</span>
            </label>
          </div>

          {/* Total Estimated Cost Section */}
          <div className="rounded-[14px] p-4 flex flex-col justify-center mt-1 bg-amber-500/10 dark:bg-gradient-to-r dark:from-amber-500/15 dark:to-[#141923] border border-amber-500/30 dark:border-amber-500/20 shadow-xs">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-[#E8B331] mb-1 font-heading">Estimated Total Cost</span>
            <span className="text-[26px] sm:text-[30px] font-[800] text-amber-600 dark:text-[#E8B331] tabular-nums tracking-tight leading-none">
              {formatCurrency(totalEstimatedCost)}
            </span>
          </div>

        </div>
      </div>

    </div>
  );
};

export default GoldRates;