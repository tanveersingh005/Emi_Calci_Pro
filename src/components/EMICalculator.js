'use client';

import React, { useContext, useMemo } from 'react';
import { WorkspaceContext } from '../context/WorkspaceContext';
import { UPDATE_INPUTS } from '../constants/actionTypes';
import { calculateEMI, calculateTotals, generateAmortizationSchedule } from '../engines/financialEngine';
import { formatCurrency, formatTenure } from '../utils/formatters';
import AmortizationSchedule from './AmortizationSchedule';

// Recharts imports
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function EMICalculator() {
  const { state, dispatch } = useContext(WorkspaceContext);
  const { amount, rate, tenure } = state.inputs;

  // 1. Calculate values instantly using pure engines
  const emi = useMemo(() => calculateEMI(amount, rate, tenure), [amount, rate, tenure]);
  const totals = useMemo(() => calculateTotals(amount, emi, tenure), [amount, emi, tenure]);
  const amortizationData = useMemo(() => generateAmortizationSchedule(amount, rate, tenure), [amount, rate, tenure]);

  const principalPercent = useMemo(() => {
    const total = amount + totals.totalInterest;
    return total > 0 ? (amount / total) * 100 : 0;
  }, [amount, totals.totalInterest]);

  const interestPercent = useMemo(() => 100 - principalPercent, [principalPercent]);

  const handleInputChange = (field, val) => {
    let numVal = parseFloat(val);
    if (isNaN(numVal)) numVal = 0;
    
    // Boundary checks
    if (field === 'amount') {
      numVal = Math.min(Math.max(numVal, 0), 500000000); // Max 50 Cr
    } else if (field === 'rate') {
      numVal = Math.min(Math.max(numVal, 0), 50); // Max 50%
    } else if (field === 'tenure') {
      numVal = Math.min(Math.max(numVal, 0), 600); // Max 50 Years (600 months)
    }

    dispatch({
      type: UPDATE_INPUTS,
      payload: { [field]: numVal },
    });
  };

  // Pie chart data preparation
  const chartData = useMemo(() => [
    { name: 'Principal Loan Amount', value: amount, color: '#4f46e5' }, // Indigo-600
    { name: 'Total Interest Payable', value: totals.totalInterest, color: '#10b981' }, // Solid Emerald
  ], [amount, totals.totalInterest]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
          <p className="font-semibold text-slate-800 dark:text-slate-100">{payload[0].name}</p>
          <p className="text-brand-primary font-bold mt-1">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Inputs & Sliders */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold mb-1 tracking-tight text-slate-800 dark:text-slate-100">Loan Parameters</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Modify parameters in real-time. Changes sync across all open tabs.</p>
            </div>

            {/* Amount input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <div className="flex items-baseline gap-2">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Loan Amount</span>
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">({formatCurrency(amount)})</span>
                </div>
                <div className="flex items-center bg-slate-100 dark:bg-[#030712] border border-slate-200 dark:border-[#1e2230] rounded-lg px-2.5 py-1 focus-within:ring-2 focus-within:ring-indigo-500/30 transition-all">
                  <span className="text-slate-400 dark:text-slate-500 text-xs font-bold mr-1">₹</span>
                  <input
                    type="number"
                    value={amount || ''}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    className="bg-transparent font-bold text-sm w-28 outline-none text-slate-800 dark:text-slate-100"
                    min="0"
                    max="500000000"
                  />
                </div>
              </div>
              <input
                type="range"
                min="100000"
                max="20000000" // 2 Crores
                step="50000"
                value={amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className="w-full cursor-pointer accent-brand-primary"
              />
              <div className="flex justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                <span>₹1 Lakh</span>
                <span>₹2 Crore</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mr-1">Presets:</span>
                {[500000, 1000000, 5000000, 10000000, 20000000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleInputChange('amount', val)}
                    className={`px-2 py-0.5 rounded text-[9px] font-bold border transition-colors ${
                      amount === val
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {val >= 10000000 ? `₹${val / 10000000} Cr` : `₹${val / 100000} L`}
                  </button>
                ))}
              </div>
            </div>

            {/* Rate input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <div className="flex items-baseline gap-2">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Interest Rate</span>
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">({rate}% p.a.)</span>
                </div>
                <div className="flex items-center bg-slate-100 dark:bg-[#030712] border border-slate-200 dark:border-[#1e2230] rounded-lg px-2.5 py-1 focus-within:ring-2 focus-within:ring-indigo-500/30 transition-all">
                  <input
                    type="number"
                    step="0.05"
                    value={rate || ''}
                    onChange={(e) => handleInputChange('rate', e.target.value)}
                    className="bg-transparent font-bold text-sm w-12 text-right outline-none text-slate-800 dark:text-slate-100"
                    min="0"
                    max="50"
                  />
                  <span className="text-slate-400 dark:text-slate-500 text-xs font-bold ml-1">%</span>
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                step="0.05"
                value={rate}
                onChange={(e) => handleInputChange('rate', e.target.value)}
                className="w-full cursor-pointer accent-brand-primary"
              />
              <div className="flex justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                <span>1%</span>
                <span>25%</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mr-1">Presets:</span>
                {[7.5, 8.5, 9.5, 10.5, 12.0].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleInputChange('rate', val)}
                    className={`px-2 py-0.5 rounded text-[9px] font-bold border transition-colors ${
                      rate === val
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {val}%
                  </button>
                ))}
              </div>
            </div>

            {/* Tenure input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <div className="flex items-baseline gap-2">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Loan Tenure</span>
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">({formatTenure(tenure)})</span>
                </div>
                <div className="flex items-center bg-slate-100 dark:bg-[#030712] border border-slate-200 dark:border-[#1e2230] rounded-lg px-2.5 py-1 focus-within:ring-2 focus-within:ring-indigo-500/30 transition-all">
                  <input
                    type="number"
                    value={tenure || ''}
                    onChange={(e) => handleInputChange('tenure', e.target.value)}
                    className="bg-transparent font-bold text-sm w-12 text-right outline-none text-slate-800 dark:text-slate-100"
                    min="0"
                    max="600"
                  />
                  <span className="text-slate-400 dark:text-slate-500 text-xs font-bold ml-1">mo</span>
                </div>
              </div>
              <input
                type="range"
                min="12"
                max="360"
                step="12"
                value={tenure}
                onChange={(e) => handleInputChange('tenure', e.target.value)}
                className="w-full cursor-pointer accent-brand-primary"
              />
              <div className="flex justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                <span>1 Yr (12 Mos)</span>
                <span>30 Yrs (360 Mos)</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mr-1">Presets:</span>
                {[60, 120, 180, 240, 360].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleInputChange('tenure', val)}
                    className={`px-2 py-0.5 rounded text-[9px] font-bold border transition-colors ${
                      tenure === val
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {val / 12} Yrs
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dynamic Cost Distribution Bar (utilizes space beautifully and enhances visual richness) */}
          <div className="pt-5 mt-5 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <span>Cost Distribution</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-mono text-[11px]">
                {principalPercent.toFixed(0)}% Principal / {interestPercent.toFixed(0)}% Interest
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden flex border border-slate-200/50 dark:border-slate-800/50">
              <div 
                className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-300"
                style={{ width: `${principalPercent}%` }}
              />
              <div 
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${interestPercent}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-500" />
                <span>Principal ({formatCurrency(amount)})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Total Interest ({formatCurrency(totals.totalInterest)})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Outputs & Recharts visualization */}
        <div className="lg:col-span-5 grid grid-cols-1 gap-6">
          <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold mb-6 tracking-tight text-slate-800 dark:text-slate-100">Summary Dashboard</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Monthly Installment (EMI)</p>
                <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{formatCurrency(emi, true)}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Total Interest Payable</p>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-1">{formatCurrency(totals.totalInterest)}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Total Amount Payable</p>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-1">{formatCurrency(totals.totalPayable)}</p>
              </div>
            </div>

            {/* Ratio Pie Chart */}
            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconSize={10} 
                    iconType="circle"
                    formatter={(value) => <span className="text-[11px] text-slate-600 dark:text-slate-400">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>

      {/* Amortization Schedule Table and Chart */}
      <AmortizationSchedule schedule={amortizationData} />
    </div>
  );
}
