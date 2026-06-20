/**
 * Formatting and helper utilities.
 */

/**
 * Formats a number to Indian Rupees (INR) format.
 * Example: 5000000 -> ₹50,00,000
 * @param {number} value - The number to format
 * @param {boolean} includeDecimals - Whether to include decimals (.00)
 * @returns {string} Formatted currency
 */
export function formatCurrency(value, includeDecimals = false) {
  if (value === undefined || value === null || isNaN(value)) {
    return '₹0';
  }
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  }).format(value);
}

/**
 * Formats a tenure number into Years and Months for better UI readability.
 * Example: 242 -> 20 Yrs 2 Mos
 * @param {number} months - Tenure in months
 * @returns {string} Formatted tenure
 */
export function formatTenure(months) {
  if (!months || months <= 0) return '0 months';
  const yrs = Math.floor(months / 12);
  const mos = months % 12;
  
  if (yrs === 0) return `${mos} Mos`;
  if (mos === 0) return `${yrs} Yrs`;
  return `${yrs} Yrs ${mos} Mos`;
}

/**
 * Helper to download structured data as a CSV file.
 * @param {string} filename - Output file name
 * @param {Array<object>} rows - Array of objects containing data
 * @param {Array<string>} headers - Array of header display names
 * @param {Array<string>} keys - Array of keys in objects matching the headers
 */
export function downloadCSV(filename, rows, headers, keys) {
  if (!rows || rows.length === 0) return;
  
  const csvContent = [
    headers.join(','), // Header row
    ...rows.map(row => 
      keys.map(key => {
        let val = row[key];
        // Handle currency formatting or string wrapping
        if (typeof val === 'string') {
          // Escape quotes
          val = `"${val.replace(/"/g, '""')}"`;
        } else if (val === undefined || val === null) {
          val = '';
        }
        return val;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
