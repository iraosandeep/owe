/**
 * Calculate simple interest on an amount.
 * @param principal - The original amount
 * @param annualRate - Annual interest rate in percentage (e.g., 5 for 5%)
 * @param fromDate - The date the loan was given/taken
 * @param toDate - The date to calculate interest up to (defaults to now)
 * @returns The interest amount
 */
export function calculateSimpleInterest(
  principal: number,
  annualRate: number,
  fromDate: string,
  toDate: string = new Date().toISOString()
): number {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  const diffMs = to.getTime() - from.getTime();
  const diffDays = Math.max(0, diffMs / (1000 * 60 * 60 * 24));
  const years = diffDays / 365;
  return Math.round(principal * (annualRate / 100) * years * 100) / 100;
}

/**
 * Get total amount including simple interest.
 */
export function getAmountWithInterest(
  principal: number,
  annualRate: number | null,
  fromDate: string,
  toDate?: string
): number {
  if (!annualRate || annualRate <= 0) return principal;
  return principal + calculateSimpleInterest(principal, annualRate, fromDate, toDate);
}
