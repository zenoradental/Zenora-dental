/**
 * Indian Rupee formatting, shared by every screen that shows money.
 *
 * Uses the en-IN locale so grouping follows the lakh/crore convention
 * (₹12,34,567 rather than ₹1,234,567).
 */
const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});

const inrWithPaise = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const inrCompactUnits = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 1
});

/** ₹42,500 — for KPI tiles and totals. */
export const formatINR = (value: number): string =>
  inr.format(Number.isFinite(value) ? value : 0);

/** ₹4,250.00 — for invoices and line items. */
export const formatINRExact = (value: number): string =>
  inrWithPaise.format(Number.isFinite(value) ? value : 0);

/** ₹1.2L / ₹3.4Cr / ₹8,500 — for cramped chart axes. */
export const formatINRCompact = (value: number): string => {
  const n = Number.isFinite(value) ? value : 0;
  const abs = Math.abs(n);
  if (abs >= 10000000) return `₹${inrCompactUnits.format(n / 10000000)}Cr`;
  if (abs >= 100000) return `₹${inrCompactUnits.format(n / 100000)}L`;
  if (abs >= 1000) return `₹${inrCompactUnits.format(n / 1000)}K`;
  return formatINR(n);
};
