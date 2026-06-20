'use client';

import React from 'react';
import { useComparison } from '../hooks/useComparison';
import { formatCurrency, formatTenure } from '../utils/formatters';
import { Sparkles, Calendar, Percent, Landmark } from 'lucide-react';

export default function LoanComparison() {
  const { scenarios, updateScenario } = useComparison();

  const handleFieldChange = (id, field, value) => {
    let numVal = parseFloat(value);
    if (isNaN(numVal)) numVal = 0;
    
    // Bounds limits
    if (field === 'amount') numVal = Math.min(Math.max(numVal, 0), 500000000);
    if (field === 'rate') numVal = Math.min(Math.max(numVal, 0), 50);
    if (field === 'tenure') numVal = Math.min(Math.max(numVal, 0), 600);

    updateScenario(id, { [field]: numVal });
  };

  return (
    <div className="space-y-6">
      
      {/* Intro info */}
      <div className="glass-panel p-6 rounded-2xl">
        <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Loan Comparison Matrix</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Compare up to 3 loan packages side-by-side. The cheapest option is highlighted in real-time based on the lowest total interest paid.
        </p>
      </div>

      {/* Grid of Scenarios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {scenarios.map((scenario) => {
          const { id, label, amount, rate, tenure, emi, totalInterest, totalPayable, isCheapest } = scenario;

          return (
            <div
              key={id}
              className={`relative glass-panel rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between border ${
                isCheapest
                  ? 'border-brand-primary/50 shadow-lg shadow-emerald-500/5 ring-1 ring-brand-primary/20 bg-gradient-to-b from-brand-primary/[0.02] to-transparent'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              
              {/* Cheapest Badge */}
              {isCheapest && (
                <div className="absolute -top-3 right-6 flex items-center gap-1 px-3 py-1 rounded-full bg-brand-primary text-slate-900 text-[10px] font-black uppercase tracking-wider shadow-md">
                  <Sparkles className="h-3 w-3" />
                  <span>Cheapest Loan</span>
                </div>
              )}

              {/* Title & Editable Inputs */}
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-extrabold text-slate-700 dark:text-slate-300">{label}</h3>
                  <div className="h-0.5 w-10 bg-slate-200 dark:bg-slate-800 mt-1.5" />
                </div>

                <div className="space-y-4">
                  {/* Amount input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <Landmark className="h-3 w-3" /> Loan Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={amount || ''}
                      onChange={(e) => handleFieldChange(id, 'amount', e.target.value)}
                      className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all text-slate-800 dark:text-slate-100"
                      min="0"
                    />
                  </div>

                  {/* Rate input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <Percent className="h-3 w-3" /> Interest Rate (% p.a.)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      value={rate || ''}
                      onChange={(e) => handleFieldChange(id, 'rate', e.target.value)}
                      className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all text-slate-800 dark:text-slate-100"
                      min="0"
                    />
                  </div>

                  {/* Tenure input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Tenure (Months)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={tenure || ''}
                        onChange={(e) => handleFieldChange(id, 'tenure', e.target.value)}
                        className="w-2/3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all text-slate-800 dark:text-slate-100"
                        min="0"
                      />
                      <div className="w-1/3 bg-slate-200/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-center text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                        {formatTenure(tenure)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Calculated Outputs Display */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-6 mt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400 dark:text-slate-500">Monthly EMI:</span>
                  <span className="text-base font-black text-brand-primary">{formatCurrency(emi, true)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400 dark:text-slate-500">Interest Payable:</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{formatCurrency(totalInterest)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400 dark:text-slate-500">Total Payable:</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{formatCurrency(totalPayable)}</span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
