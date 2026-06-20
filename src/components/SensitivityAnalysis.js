'use client';

import React, { useMemo } from 'react';
import { useSensitivityGrid } from '../hooks/useSensitivityGrid';
import { formatCurrency, formatTenure } from '../utils/formatters';
import { Info, HelpCircle } from 'lucide-react';

export default function SensitivityAnalysis() {
  const { rates, tenures, grid, currentRate, currentTenure } = useSensitivityGrid();

  // Find the exact current EMI to calculate variance in the grid cells
  const currentEMI = useMemo(() => {
    const currentRow = grid.find(row => row.rate === currentRate);
    return currentRow ? currentRow[currentTenure] : null;
  }, [grid, currentRate, currentTenure]);

  return (
    <div className="space-y-6">
      
      {/* Intro Description */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">What-If Sensitivity Grid</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Simulate how changes in the interest rate (±1%, ±2%, ±3%) and tenure (±6, ±12, ±24 months) impact your monthly EMI.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500">
          <Info className="h-3.5 w-3.5" />
          <span>Active parameters highlighted in emerald green.</span>
        </div>
      </div>

      {/* Grid Matrix Container */}
      <div className="glass-panel p-6 rounded-2xl overflow-hidden">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-6">EMI Sensitivity Matrix (Interest Rate vs. Tenure)</h3>
        
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-center border-collapse">
            <thead>
              {/* Table Column Headers: Tenures */}
              <tr className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                <th className="py-4 px-4 border-r border-slate-200 dark:border-slate-800 text-left font-black">
                  Rate \ Tenure
                </th>
                {tenures.map((t) => {
                  const isCurrentT = t === currentTenure;
                  return (
                    <th
                      key={t}
                      className={`py-4 px-4 font-bold text-xs border-r border-slate-200 dark:border-slate-800 ${
                        isCurrentT ? 'text-brand-primary font-black bg-brand-primary/5 dark:bg-brand-primary/[0.02]' : ''
                      }`}
                    >
                      {formatTenure(t)}
                    </th>
                  );
                })}
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {grid.map((row) => {
                const isCurrentR = row.rate === currentRate;
                
                return (
                  <tr
                    key={row.rate}
                    className={`transition-colors ${
                      isCurrentR ? 'bg-brand-primary/5 dark:bg-brand-primary/[0.01]' : 'hover:bg-slate-100/30 dark:hover:bg-slate-900/30'
                    }`}
                  >
                    {/* Row Header: Rate */}
                    <td
                      className={`py-3 px-4 font-mono font-bold text-xs border-r border-slate-200 dark:border-slate-800 text-left ${
                        isCurrentR ? 'text-brand-primary font-black' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {row.rate.toFixed(2)}%
                    </td>

                    {/* Grid Cells: EMI and Variance */}
                    {tenures.map((t) => {
                      const cellValue = row[t];
                      const isCurrentT = t === currentTenure;
                      const isActiveCell = isCurrentR && isCurrentT;

                      // Variance calculation
                      let varianceText = '';
                      let isPositive = false;
                      let isNegative = false;

                      if (currentEMI && cellValue && !isActiveCell) {
                        const diffPercent = ((cellValue - currentEMI) / currentEMI) * 100;
                        if (diffPercent > 0) {
                          varianceText = `+${diffPercent.toFixed(1)}%`;
                          isPositive = true;
                        } else if (diffPercent < 0) {
                          varianceText = `${diffPercent.toFixed(1)}%`;
                          isNegative = true;
                        } else {
                          varianceText = '0.0%';
                        }
                      }

                      return (
                        <td
                          key={t}
                          className={`py-3 px-4 border-r border-slate-200 dark:border-slate-800 font-mono text-xs ${
                            isActiveCell
                              ? 'bg-brand-primary/20 dark:bg-brand-primary/10 border-2 border-brand-primary font-black text-brand-primary shadow-inner scale-105'
                              : isCurrentR || isCurrentT
                              ? 'bg-slate-100/30 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300'
                              : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          <div className="flex flex-col items-center">
                            <span className="font-bold">{formatCurrency(cellValue)}</span>
                            {isActiveCell ? (
                              <span className="text-[9px] text-brand-secondary font-black uppercase tracking-wider mt-0.5">
                                Current
                              </span>
                            ) : varianceText ? (
                              <span
                                className={`text-[9px] font-semibold mt-0.5 ${
                                  isPositive ? 'text-red-500 dark:text-red-400' : 'text-emerald-500'
                                }`}
                              >
                                {varianceText}
                              </span>
                            ) : null}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
