import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiTrendingUp, FiPlus, FiUser } from 'react-icons/fi';
import { GiGoldBar } from 'react-icons/gi';
import { useAuth } from '../context/AuthContext';

export const BottomNavigation = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <nav aria-label="Mobile Bottom Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-card)]/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-[var(--border-color)] dark:border-slate-800 px-4 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] dark:shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {/* Home */}
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all ${
              isActive
                ? 'bg-[var(--gold-1)]/50 dark:bg-transparent text-[var(--gold-4)] dark:text-amber-500 font-bold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] dark:text-slate-500 dark:hover:text-slate-200 font-medium'
            }`
          }
        >
          <FiHome className="w-6 h-6" />
          <span className="text-[10px] font-semibold">Home</span>
        </NavLink>

        {/* Assets */}
        <NavLink
          to="/my-gold"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all ${
              isActive
                ? 'bg-[var(--gold-1)]/50 dark:bg-transparent text-[var(--gold-4)] dark:text-amber-500 font-bold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] dark:text-slate-500 dark:hover:text-slate-200 font-medium'
            }`
          }
        >
          <GiGoldBar className="w-6 h-6" />
          <span className="text-[10px] font-semibold">Assets</span>
        </NavLink>

        {/* Add Gold (Visually Highlighted Center Button) */}
        <NavLink
          to="/add-gold"
          className={({ isActive }) =>
            `relative -top-4 flex flex-col items-center transition-all group ${
              isActive ? 'scale-105' : 'hover:scale-105'
            }`
          }
        >
          <div className="w-13 h-13 rounded-full bg-[var(--gold-3)] dark:bg-gradient-to-tr dark:from-amber-500 dark:via-amber-400 dark:to-amber-300 flex items-center justify-center text-white dark:text-slate-950 shadow-[0_4px_14px_rgba(217,154,0,0.3)] dark:shadow-md dark:shadow-amber-500/40 ring-4 ring-[var(--bg-main)] dark:ring-[#0A0E17] group-active:scale-95 transition-transform border border-white/20">
            <FiPlus className="w-6 h-6 stroke-[3]" />
          </div>
          <span className="text-[10px] font-extrabold text-[var(--text-gold)] dark:text-amber-400 mt-1 font-heading tracking-wide uppercase">
            Add
          </span>
        </NavLink>

        {/* Gold Rate */}
        <NavLink
          to="/gold-rates"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all ${
              isActive
                ? 'bg-[var(--gold-1)]/50 dark:bg-transparent text-[var(--gold-4)] dark:text-amber-500 font-bold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] dark:text-slate-500 dark:hover:text-slate-200 font-medium'
            }`
          }
        >
          <FiTrendingUp className="w-6 h-6" />
          <span className="text-[10px] font-semibold">Rates</span>
        </NavLink>

        {/* Profile */}
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all ${
              isActive
                ? 'bg-[var(--gold-1)]/50 dark:bg-transparent text-[var(--gold-4)] dark:text-amber-500 font-bold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] dark:text-slate-500 dark:hover:text-slate-200 font-medium'
            }`
          }
        >
          <FiUser className="w-6 h-6" />
          <span className="text-[10px] font-semibold">Profile</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default BottomNavigation;
