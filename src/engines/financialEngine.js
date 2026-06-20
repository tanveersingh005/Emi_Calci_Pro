/**
 * Pure functions for financial calculations.
 * Avoids any React dependency or state. High precision floating point handling.
 */

/**
 * Calculates the monthly EMI (Equated Monthly Installment)
 * Formula: [P x r x (1+r)^n]/[(1+r)^n - 1]
 * @param {number} amount - Principal Loan Amount (P)
 * @param {number} annualRate - Annual Interest Rate in percentage (R)
 * @param {number} tenureMonths - Tenure in months (n)
 * @returns {number} Monthly EMI
 */
export function calculateEMI(amount, annualRate, tenureMonths) {
  if (!amount || amount <= 0 || !tenureMonths || tenureMonths <= 0) return 0;
  if (!annualRate || annualRate <= 0) {
    return Math.round((amount / tenureMonths) * 100) / 100;
  }
  
  const monthlyRate = annualRate / 12 / 100; // r
  const emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
              (Math.pow(1 + monthlyRate, tenureMonths) - 1);
              
  return Math.round(emi * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculates totals for a standard loan without prepayments
 * @param {number} amount - Principal Amount
 * @param {number} emi - Monthly EMI
 * @param {number} tenureMonths - Tenure in months
 * @returns {object} Total Payable and Total Interest
 */
export function calculateTotals(amount, emi, tenureMonths) {
  const totalPayable = Math.round(emi * tenureMonths * 100) / 100;
  const totalInterest = Math.max(0, Math.round((totalPayable - amount) * 100) / 100);
  return {
    totalPayable,
    totalInterest,
  };
}

/**
 * Generates the full amortization schedule, incorporating prepayments.
 * If prepayments are present, the EMI remains constant, but the tenure is reduced.
 * @param {number} amount - Principal Amount
 * @param {number} annualRate - Annual Interest Rate (%)
 * @param {number} tenureMonths - Original Tenure (Months)
 * @param {Array} prepayments - Array of { month: number, amount: number }
 * @returns {Array} Schedule of payments
 */
export function generateAmortizationSchedule(amount, annualRate, tenureMonths, prepayments = []) {
  const schedule = [];
  if (!amount || amount <= 0 || !tenureMonths || tenureMonths <= 0) return schedule;

  const monthlyRate = annualRate > 0 ? (annualRate / 12 / 100) : 0;
  const standardEMI = calculateEMI(amount, annualRate, tenureMonths);
  
  let balance = amount;
  let cumulativePrincipal = 0;
  let cumulativeInterest = 0;
  
  // Create a map for quick prepayment lookups
  // Support multiple prepayments in the same month by summing them up
  const prepaymentMap = {};
  prepayments.forEach(p => {
    const m = parseInt(p.month, 10);
    const amt = parseFloat(p.amount);
    if (!isNaN(m) && !isNaN(amt) && amt > 0) {
      prepaymentMap[m] = (prepaymentMap[m] || 0) + amt;
    }
  });

  // We loop month-by-month. It can run up to tenureMonths, but can terminate earlier if balance hits 0.
  for (let month = 1; month <= tenureMonths; month++) {
    if (balance <= 0) break;

    const interestPaid = Math.round((balance * monthlyRate) * 100) / 100;
    
    // Standard EMI payment is capped at interest + remaining balance
    let emiPaid = Math.min(standardEMI, balance + interestPaid);
    let principalPaid = Math.round((emiPaid - interestPaid) * 100) / 100;
    
    if (principalPaid < 0) {
      principalPaid = 0;
    }

    // Get prepayments for this month
    let prepaymentPaid = prepaymentMap[month] || 0;
    
    // Cap prepayment to remaining balance after standard principal payment
    const remainingAfterEmi = Math.round((balance - principalPaid) * 100) / 100;
    if (prepaymentPaid > remainingAfterEmi) {
      prepaymentPaid = remainingAfterEmi;
    }

    balance = Math.round((balance - principalPaid - prepaymentPaid) * 100) / 100;
    
    cumulativePrincipal = Math.round((cumulativePrincipal + principalPaid + prepaymentPaid) * 100) / 100;
    cumulativeInterest = Math.round((cumulativeInterest + interestPaid) * 100) / 100;

    schedule.push({
      month,
      emi: emiPaid,
      principalPaid: Math.round((principalPaid + prepaymentPaid) * 100) / 100,
      basePrincipalPaid: principalPaid,
      prepaymentPaid,
      interestPaid,
      remainingBalance: Math.max(0, balance),
      cumulativePrincipal,
      cumulativeInterest,
    });

    if (balance <= 0) break;
  }

  return schedule;
}

/**
 * Finds the break-even month in an amortization schedule.
 * Break-even month is defined as the month where the principal portion paid in that month
 * becomes greater than the interest portion paid in that month.
 * @param {Array} schedule - Amortization schedule
 * @returns {number|null} Break-even month, or null if none
 */
export function calculateBreakEvenMonth(schedule) {
  if (!schedule || schedule.length === 0) return null;
  const breakEvenRow = schedule.find(row => row.basePrincipalPaid > row.interestPaid);
  return breakEvenRow ? breakEvenRow.month : null;
}

/**
 * Generates the sensitivity grid (Interest Rate variations vs Tenure variations)
 * Rate variation: Current Rate ± 1%, 2%, 3%
 * Tenure variation: Current Tenure ± 6, 12, 24 months
 * @param {number} amount - Principal Amount
 * @param {number} annualRate - Current Annual Rate (%)
 * @param {number} tenureMonths - Current Tenure (Months)
 * @returns {object} Grid structure with rates, tenures and EMIs
 */
export function generateSensitivityGrid(amount, annualRate, tenureMonths) {
  const rateVariations = [-3, -2, -1, 0, 1, 2, 3]
    .map(v => Math.round((annualRate + v) * 100) / 100)
    .filter(r => r > 0 && r <= 100); // Sanitize rates
    
  const tenureVariations = [-24, -12, -6, 0, 6, 12, 24]
    .map(v => tenureMonths + v)
    .filter(t => t > 0); // Sanitize tenures

  // Remove duplicates and sort
  const uniqueRates = Array.from(new Set(rateVariations)).sort((a, b) => a - b);
  const uniqueTenures = Array.from(new Set(tenureVariations)).sort((a, b) => a - b);

  const grid = uniqueRates.map(rate => {
    const row = { rate };
    uniqueTenures.forEach(tenure => {
      row[tenure] = calculateEMI(amount, rate, tenure);
    });
    return row;
  });

  return {
    rates: uniqueRates,
    tenures: uniqueTenures,
    grid,
  };
}

/**
 * Calculates the impact of prepayments on interest and tenure.
 * @param {number} amount - Principal Amount
 * @param {number} annualRate - Annual Rate (%)
 * @param {number} tenureMonths - Original Tenure (Months)
 * @param {Array} prepayments - Array of prepayments
 * @returns {object} Summary of impact
 */
export function calculatePrepaymentImpact(amount, annualRate, tenureMonths, prepayments = []) {
  const standardEMI = calculateEMI(amount, annualRate, tenureMonths);
  const standardTotals = calculateTotals(amount, standardEMI, tenureMonths);
  
  const prepaySchedule = generateAmortizationSchedule(amount, annualRate, tenureMonths, prepayments);
  
  if (prepaySchedule.length === 0) {
    return {
      originalInterest: standardTotals.totalInterest,
      newInterest: standardTotals.totalInterest,
      interestSaved: 0,
      originalTenure: tenureMonths,
      newTenure: tenureMonths,
      tenureReduced: 0,
    };
  }

  const newInterest = prepaySchedule.reduce((sum, row) => sum + row.interestPaid, 0);
  const newTenure = prepaySchedule.length;
  const interestSaved = Math.max(0, Math.round((standardTotals.totalInterest - newInterest) * 100) / 100);
  const tenureReduced = Math.max(0, tenureMonths - newTenure);

  return {
    originalInterest: standardTotals.totalInterest,
    newInterest: Math.round(newInterest * 100) / 100,
    interestSaved,
    originalTenure: tenureMonths,
    newTenure,
    tenureReduced,
  };
}
