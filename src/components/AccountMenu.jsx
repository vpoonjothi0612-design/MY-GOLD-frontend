import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePWA } from '../context/PWAContext';
import { FiUser, FiLogOut, FiChevronDown, FiDownload } from 'react-icons/fi';
import { GiGoldBar } from 'react-icons/gi';

export const AccountMenu = () => {
  const { user, logout } = useAuth();
  const { isInstalled, promptInstall } = usePWA();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-amber-400 text-slate-900 dark:text-slate-200 transition-all cursor-pointer shadow-xs group"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-bold text-xs font-heading">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <div className="text-left hidden sm:block">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block -mb-0.5 font-heading uppercase">
            Hi,
          </span>
          <span className="text-xs font-bold text-slate-900 dark:text-white font-heading truncate max-w-[100px] block">
            {user.username}
          </span>
        </div>
        <FiChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? 'rotate-180 text-amber-500' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-amber-500/25 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
          {/* User Info Header in Dropdown */}
          <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
            <p className="text-xs font-extrabold text-slate-900 dark:text-white font-heading truncate">
              {user.username}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {user.email}
            </p>
          </div>

          <div className="py-1 space-y-0.5">
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-amber-500/10 dark:hover:bg-amber-500/15 transition-all font-heading"
            >
              <FiUser className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Vault Profile</span>
            </Link>

            <Link
              to="/my-gold"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-amber-500/10 dark:hover:bg-amber-500/15 transition-all font-heading"
            >
              <GiGoldBar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>My Gold Holdings</span>
            </Link>

            {!isInstalled && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  promptInstall();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-500/15 transition-all font-heading text-left cursor-pointer"
              >
                <FiDownload className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Install Aurum App</span>
              </button>
            )}
          </div>

          <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 dark:hover:bg-rose-500/15 transition-all cursor-pointer font-heading"
            >
              <FiLogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountMenu;
