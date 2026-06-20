'use client';

import React, { useState, useMemo } from 'react';
import { calculateBreakEvenMonth } from '../engines/financialEngine';
import { formatCurrency, downloadCSV } from '../utils/formatters';
import { Table, BarChart as ChartIcon, Download, AlertTriangle, ArrowLeft, ArrowRight } from 'lucide-react';

// Recharts imports for stacked visualization
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function AmortizationSchedule({ schedule }) {
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'chart'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // 1 year of entries per page

  // 1. Calculate break-even month
  const breakEvenMonth = useMemo(() => calculateBreakEvenMonth(schedule), [schedule]);

  // 2. Paginated schedule data
  const totalPages = Math.ceil(schedule.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return schedule.slice(startIndex, startIndex + itemsPerPage);
  }, [schedule, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // 3. Export CSV handler
  const handleExportCSV = () => {
    const headers = ['Month', 'EMI (INR)', 'Principal Paid (INR)', 'Interest Paid (INR)', 'Remaining Balance (INR)'];
    const keys = ['month', 'emi', 'principalPaid', 'interestPaid', 'remainingBalance'];
    downloadCSV('Amortization_Schedule.csv', schedule, headers, keys);
  };

  // 4. Custom tooltip for Stacked Chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
          <p className="font-bold text-slate-800 dark:text-slate-200">Month {label}</p>
          <p className="text-indigo-500 font-medium">Principal Paid: {formatCurrency(payload[0].value)}</p>
          <p className="text-brand-primary font-medium">Interest Paid: {formatCurrency(payload[1].value)}</p>
          {payload[2] && (
            <p className="text-slate-400 font-medium">Remaining Balance: {formatCurrency(payload[2].value)}</p>
          )}
        </div>
      );
    }
    return null;
  };

  if (!schedule || schedule.length === 0) return null;

  return (
    <div className="glass-panel p-6 rounded-2xl space-y-6">
      
      {/* Header and Toggles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Amortization Schedule</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Detailed month-by-month repayment breakdown.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggles */}
          <div className="flex rounded-lg bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Table className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                viewMode === 'chart'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <ChartIcon className="h-3.5 w-3.5" />
              <span>Chart</span>
            </button>
          </div>

          {/* Export to CSV Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-bold text-xs shadow-sm transition-all duration-150 active:scale-95"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Break-even notification */}
      {breakEvenMonth && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 text-xs text-indigo-700 dark:text-indigo-300">
          <AlertTriangle className="h-4.5 w-4.5 flex-shrink-0" />
          <span>
            <strong>Break-even Month: Month {breakEvenMonth}</strong>. This is when your principal component paid in the EMI starts exceeding the interest component.
          </span>
        </div>
      )}

      {/* Amortization Views */}
      {viewMode === 'table' ? (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
                  <th className="py-3.5 px-4 font-bold">Month</th>
                  <th className="py-3.5 px-4 font-bold">EMI Paid</th>
                  <th className="py-3.5 px-4 font-bold">Principal Paid</th>
                  <th className="py-3.5 px-4 font-bold">Interest Paid</th>
                  <th className="py-3.5 px-4 font-bold">Remaining Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {paginatedData.map((row) => {
                  const isBreakEven = row.month === breakEvenMonth;
                  return (
                    <tr
                      key={row.month}
                      className={`transition-colors ${
                        isBreakEven
                          ? 'bg-indigo-50 dark:bg-indigo-950/20 font-semibold text-indigo-700 dark:text-indigo-300'
                          : 'hover:bg-slate-100/30 dark:hover:bg-slate-900/30 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <td className="py-3 px-4 font-mono">{row.month}</td>
                      <td className="py-3 px-4">{formatCurrency(row.emi, true)}</td>
                      <td className="py-3 px-4 flex items-center gap-1.5">
                        <span>{formatCurrency(row.principalPaid, true)}</span>
                        {row.prepaymentPaid > 0 && (
                          <span className="text-[10px] bg-brand-primary/20 text-brand-secondary font-bold px-1.5 py-0.2 rounded-full">
                            + {formatCurrency(row.prepaymentPaid)} prepay
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">{formatCurrency(row.interestPaid, true)}</td>
                      <td className="py-3 px-4 font-mono">{formatCurrency(row.remainingBalance, true)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4">
              <span className="text-xs text-slate-400 dark:text-slate-500">
                Page <span className="font-bold text-slate-700 dark:text-slate-300">{currentPage}</span> of{' '}
                <span className="font-bold text-slate-700 dark:text-slate-300">{totalPages}</span> (Year{' '}
                {Math.ceil(currentPage)} )
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg border transition-all ${
                    currentPage === 1
                      ? 'border-transparent text-slate-300 dark:text-slate-700 cursor-not-allowed'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg border transition-all ${
                    currentPage === totalPages
                      ? 'border-transparent text-slate-300 dark:text-slate-700 cursor-not-allowed'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Recharts Stacked Area Chart representing payment progress */
        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={schedule}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorPrincipal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
              <XAxis 
                dataKey="month" 
                tickLine={false} 
                stroke="#64748b" 
                fontSize={10} 
                label={{ value: 'Month', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 10 }}
              />
              <YAxis 
                tickLine={false} 
                stroke="#64748b" 
                fontSize={10} 
                tickFormatter={(value) => `₹${value / 1000}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={36} 
                iconSize={10} 
                iconType="circle"
                formatter={(value) => <span className="text-xs text-slate-600 dark:text-slate-400">{value}</span>}
              />
              <Area
                name="Principal Component"
                type="monotone"
                dataKey="principalPaid"
                stackId="1"
                stroke="#4f46e5"
                fillOpacity={1}
                fill="url(#colorPrincipal)"
              />
              <Area
                name="Interest Component"
                type="monotone"
                dataKey="interestPaid"
                stackId="1"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorInterest)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
