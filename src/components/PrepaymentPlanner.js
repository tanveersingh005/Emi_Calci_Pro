'use client';

import React, { useState, useContext } from 'react';
import { usePrepaymentPlanner } from '../hooks/usePrepaymentPlanner';
import { WorkspaceContext } from '../context/WorkspaceContext';
import { formatCurrency, formatTenure, downloadCSV } from '../utils/formatters';
import AmortizationSchedule from './AmortizationSchedule';
import { PiggyBank, Calendar, Plus, Trash, Download, Info } from 'lucide-react';

export default function PrepaymentPlanner() {
  const { state } = useContext(WorkspaceContext);
  const { inputs } = state;
  const {
    prepayments,
    addPrepayment,
    removePrepayment,
    clearPrepayments,
    impact,
    schedule,
  } = usePrepaymentPlanner();

  const [inputMonth, setInputMonth] = useState('');
  const [inputAmount, setInputAmount] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const monthNum = parseInt(inputMonth, 10);
    const amountNum = parseFloat(inputAmount);

    if (isNaN(monthNum) || monthNum <= 0 || monthNum > inputs.tenure) {
      setErrorMsg(`Month must be between 1 and the original tenure (${inputs.tenure}).`);
      return;
    }

    if (isNaN(amountNum) || amountNum <= 0) {
      setErrorMsg('Prepayment amount must be greater than 0.');
      return;
    }

    // Call addPrepayment from hook
    addPrepayment(monthNum, amountNum);
    
    // Clear input forms
    setInputMonth('');
    setInputAmount('');
  };

  const handleExportPrepayments = () => {
    if (prepayments.length === 0) return;
    const headers = ['Month', 'Prepayment Amount (INR)'];
    const keys = ['month', 'amount'];
    downloadCSV('Prepayments_List.csv', prepayments, headers, keys);
  };

  return (
    <div className="space-y-6">
      
      {/* Overview explanation */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Prepayment Planner</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            See how extra lump sum payments reduce your remaining tenure and total interest expense.
          </p>
        </div>
        
        {/* Prepayments List CSV Downloader */}
        {prepayments.length > 0 && (
          <button
            onClick={handleExportPrepayments}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all duration-150 active:scale-95"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Prepayments List</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Setup Forms, Prepayment list, and Impact summary */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Add form */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Add Prepayment</h3>

            <form onSubmit={handleAdd} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Target Month</label>
                <input
                  type="number"
                  placeholder="e.g. 12 (Year 1)"
                  value={inputMonth}
                  onChange={(e) => setInputMonth(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all text-slate-800 dark:text-slate-100"
                  min="1"
                  max={inputs.tenure}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Prepayment Amount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 100000"
                  value={inputAmount}
                  onChange={(e) => setInputAmount(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all text-slate-800 dark:text-slate-100"
                  min="1"
                />
              </div>

              {errorMsg && (
                <p className="text-[10px] text-red-500 dark:text-red-400 font-bold">{errorMsg}</p>
              )}

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-bold text-xs shadow-sm transition-all duration-150 active:scale-95"
              >
                <Plus className="h-4 w-4" />
                <span>Add Prepayment</span>
              </button>
            </form>
          </div>

          {/* Impact Dashboard */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Financial Impact Summary</h3>
            
            <div className="space-y-3.5">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 flex justify-between items-center">
                <div>
                  <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Interest Saved</p>
                  <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{formatCurrency(impact.interestSaved)}</p>
                </div>
                <PiggyBank className="h-8 w-8 text-emerald-600 dark:text-emerald-400 opacity-80" />
              </div>

              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 flex justify-between items-center">
                <div>
                  <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tenure Shortened</p>
                  <p className="text-base font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">{formatTenure(impact.tenureReduced)}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">({impact.newTenure} months remaining)</p>
                </div>
                <Calendar className="h-8 w-8 text-indigo-600 dark:text-indigo-400 opacity-80" />
              </div>
            </div>
          </div>

          {/* List of prepayments */}
          {prepayments.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl space-y-3">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Planned Prepayments ({prepayments.length})</h3>
                <button
                  onClick={clearPrepayments}
                  className="text-[10px] font-bold text-red-500 dark:text-red-400 hover:underline"
                >
                  Clear All
                </button>
              </div>

              <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                {prepayments.map((prep, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-700 dark:text-slate-300">Month {prep.month}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">Amount: {formatCurrency(prep.amount)}</p>
                    </div>
                    <button
                      onClick={() => removePrepayment(idx)}
                      className="p-1 rounded text-slate-400 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Render schedule with prepayments */}
        <div className="lg:col-span-8">
          <AmortizationSchedule schedule={schedule} />
        </div>

      </div>

    </div>
  );
}
