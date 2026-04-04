/**
 * Format a number as currency (Indian Rupee style).
 */
export function formatCurrency(amount: number): string {
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return amount < 0 ? `-₹${formatted}` : `₹${formatted}`;
}

/**
 * Format an ISO date string to a readable date.
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Get initials from a person's name.
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
