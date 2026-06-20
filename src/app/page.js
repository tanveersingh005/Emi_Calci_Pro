'use client';

import React, { useContext, useEffect } from 'react';
import { WorkspaceContext } from '../context/WorkspaceContext';
import { useBroadcastSync } from '../hooks/useBroadcastSync';
import { usePresence } from '../hooks/usePresence';
import { useLeaderElection } from '../hooks/useLeaderElection';
import { useThemeSync } from '../hooks/useThemeSync';
import * as types from '../constants/actionTypes';

// Component Imports
import Header from '../components/Header';
import EMICalculator from '../components/EMICalculator';
import LoanComparison from '../components/LoanComparison';
import PrepaymentPlanner from '../components/PrepaymentPlanner';
import SensitivityAnalysis from '../components/SensitivityAnalysis';

export default function WorkspaceHome() {
  const { state, dispatch } = useContext(WorkspaceContext);
  const { mode } = state;

  // Initialize workspace sync & management hooks
  useBroadcastSync();
  useLeaderElection();
  const presenceInfo = usePresence();
  useThemeSync();

  // 1. Sync URL Query Parameters with Calculator inputs (Amount, Rate, Tenure)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const amount = parseFloat(params.get('amount'));
    const rate = parseFloat(params.get('rate'));
    const tenure = parseInt(params.get('tenure'), 10);

    const updates = {};
    if (!isNaN(amount) && amount > 0) updates.amount = amount;
    if (!isNaN(rate) && rate > 0) updates.rate = rate;
    if (!isNaN(tenure) && tenure > 0) updates.tenure = tenure;

    if (Object.keys(updates).length > 0) {
      dispatch({
        type: types.UPDATE_INPUTS,
        payload: updates,
        meta: { fromSync: true } // Prevent immediate re-broadcast during mount hydration
      });
    }
  }, [dispatch]);

  // Sync inputs change back to URL query parameters
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const { amount, rate, tenure } = state.inputs;
    if (!amount) return;
    
    const params = new URLSearchParams();
    params.set('amount', amount);
    params.set('rate', rate);
    params.set('tenure', tenure);
    
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
  }, [state.inputs]);

  // 2. Global Keyboard listener for Undo shortcut (Ctrl + Z)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        dispatch({ type: types.UNDO });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch]);

  // View renderer based on workspace mode
  const renderWorkspaceView = () => {
    switch (mode) {
      case 'single':
        return <EMICalculator />;
      case 'comparison':
        return <LoanComparison />;
      case 'prepayment':
        return <PrepaymentPlanner />;
      case 'sensitivity':
        return <SensitivityAnalysis />;
      default:
        return <EMICalculator />;
    }
  };

  const handleTabChange = (newMode) => {
    dispatch({
      type: types.SET_MODE,
      payload: newMode
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Shared Presence & Session Header */}
      <Header presenceInfo={presenceInfo} />

      {/* Main Workspace Navigation Tabs */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          {[
            { id: 'single', label: 'EMI Calculator' },
            { id: 'comparison', label: 'Loan Comparison' },
            { id: 'prepayment', label: 'Prepayment Planner' },
            { id: 'sensitivity', label: 'Sensitivity Grid' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`py-3 px-6 text-sm font-semibold tracking-wide border-b-2 transition-all duration-200 -mb-[2px] ${
                mode === tab.id
                  ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Workspace Workspace View */}
        <div className="animate-fade-in">
          {renderWorkspaceView()}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-6 border-t border-slate-200 dark:border-slate-900 text-center text-xs text-slate-400 dark:text-slate-600 bg-slate-100/50 dark:bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>© {new Date().getFullYear()} EMI Workspace. All calculations are subject to standard financial rounding.</p>
          <div className="flex gap-4">
            <span>Press <kbd className="px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-[10px]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-[10px]">Z</kbd> anywhere to Undo changes across tabs</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
