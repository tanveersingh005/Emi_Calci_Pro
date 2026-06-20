'use client';

import React, { useContext } from 'react';
import { WorkspaceContext } from '../context/WorkspaceContext';
import { useThemeSync } from '../hooks/useThemeSync';
import * as types from '../constants/actionTypes';
import { Sun, Moon, RotateCcw, Users, Crown, Sparkles } from 'lucide-react';

export default function Header({ presenceInfo }) {
  const { state, dispatch } = useContext(WorkspaceContext);
  const { theme, toggleTheme, isDark } = useThemeSync();
  const { history } = state;
  const historyCount = history ? history.length : 0;

  const handleUndo = () => {
    dispatch({ type: types.UNDO });
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-200 dark:border-slate-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-primary to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Sparkles className="h-5 w-5 text-slate-900" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              Groww<span className="text-brand-primary">Workspace</span>
            </h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">FINTECH SHARED STUDIO</p>
          </div>
        </div>

        {/* Workspace Presence & Shared Actions */}
        <div className="flex items-center gap-3 sm:gap-6">
          
          {/* Active Tabs Indicators */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
            <Users className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            <span className="font-semibold">{presenceInfo.activeCount}</span>
            <span className="hidden sm:inline text-slate-400 dark:text-slate-500">active tabs</span>
          </div>

          {/* Current Tab Metadata */}
          <div className="hidden md:flex flex-col text-right">
            <span className="text-[10px] text-slate-400 dark:text-slate-500">Tab ID</span>
            <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">{presenceInfo.tabId || 'Connecting...'}</span>
          </div>

          {/* Leader Indicator */}
          {presenceInfo.isLeader ? (
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold shadow-sm animate-pulse">
              <Crown className="h-3.5 w-3.5" />
              <span>Workspace Leader</span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-600" />
              <span>Workspace Member</span>
            </div>
          )}

          {/* Vertical Divider */}
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

          {/* Workspace History Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleUndo}
              disabled={historyCount === 0}
              title={`Undo workspace action (${historyCount} available)`}
              className={`p-2 rounded-lg transition-all duration-200 border flex items-center justify-center ${
                historyCount > 0
                  ? 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:scale-105 active:scale-95'
                  : 'bg-transparent border-transparent text-slate-300 dark:text-slate-700 cursor-not-allowed'
              }`}
            >
              <RotateCcw className={`h-4.5 w-4.5 ${historyCount > 0 ? 'animate-spin-slow' : ''}`} />
              {historyCount > 0 && (
                <span className="ml-1 text-[10px] bg-brand-primary text-slate-900 px-1.5 py-0.2 rounded-full font-bold">
                  {historyCount}
                </span>
              )}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center"
            >
              {isDark ? <Sun className="h-4.5 w-4.5 text-amber-400" /> : <Moon className="h-4.5 w-4.5 text-slate-600" />}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
