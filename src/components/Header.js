'use client';

import React, { useContext } from 'react';
import { WorkspaceContext } from '../context/WorkspaceContext';
import { useThemeSync } from '../hooks/useThemeSync';
import * as types from '../constants/actionTypes';
import { Sun, Moon, RotateCcw, Users, Calculator } from 'lucide-react';

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
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center shadow-sm">
            <Calculator className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
              EMI <span className="text-indigo-600 dark:text-indigo-400">Workspace</span>
            </h1>
            <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Shared Financial Studio</p>
          </div>
        </div>

        {/* Workspace Presence & Shared Actions */}
        <div className="flex items-center gap-3 sm:gap-6">
          
          {/* Active Tabs Indicators */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 font-medium">
            <Users className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <span className="font-bold">{presenceInfo.activeCount}</span>
            <span className="hidden sm:inline text-slate-500 dark:text-slate-400">active tabs</span>
          </div>

          {/* Current Tab Metadata */}
          <div className="hidden md:flex flex-col text-right">
            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Tab ID</span>
            <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">{presenceInfo.tabId || 'Connecting...'}</span>
          </div>

          {/* Leader Indicator */}
          {presenceInfo.isLeader ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 text-indigo-700 dark:text-indigo-400 text-xs font-bold shadow-sm flex-shrink-0">
              <span className="h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-500" />
              <span><span className="hidden sm:inline">Workspace </span>Leader</span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800/80 text-xs font-semibold flex-shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-600" />
              <span>Member</span>
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
                <span className="ml-1 text-[10px] bg-brand-primary text-white px-1.5 py-0.5 rounded-full font-bold">
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
