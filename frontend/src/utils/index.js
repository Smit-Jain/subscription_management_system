/**
 * Format a number as Indian Rupee currency.
 * TODO(D): Update locale/currency symbol here if targeting multiple currencies.
 */
export function formatCurrency(amount, opts = {}) {
  const { compact = false } = opts;
  if (compact && Math.abs(amount) >= 1_00_000) {
    return '₹' + (amount / 1_00_000).toFixed(1) + 'L';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a date string or Date object.
 * @param {string|Date} date
 * @param {object} opts
 */
export function formatDate(date, opts = {}) {
  if (!date) return '—';
  const { short = false, time = false } = opts;
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d)) return '—';

  if (short) {
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  }
  if (time) {
    return d.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Returns a random element from an array (for mock data variety).
 */
export function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Truncate text to a given length.
 */
export function truncate(str, max = 40) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '…' : str;
}

/**
 * Generate initials from a name.
 */
export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .slice(0, 2)
    .join('');
}

/**
 * Days since a given date.
 */
export function daysSince(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.floor((now - d) / (1000 * 60 * 60 * 24));
}
