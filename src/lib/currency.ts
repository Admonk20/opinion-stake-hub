export const CURRENCY = {
  code: 'TZEE',
  symbol: 'TZEE',
  decimals: 18,
  network: 'BSC',
  tokenAddress: '0x1601C48F1178F1F9A9b0Be5f5bD7bb20CfD157F3',
} as const;

// Format amounts in TZEE for UI display
export function formatTZEE(amount: number | string, options?: { withSymbol?: boolean }) {
  const n = typeof amount === 'string' ? parseFloat(amount) : (amount ?? 0);
  const abs = Math.abs(n);
  const maximumFractionDigits = abs < 1 ? 4 : 2;
  const formatted = (Number.isFinite(n) ? n : 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits,
  });
  return options?.withSymbol === false ? formatted : `${formatted} ${CURRENCY.symbol}`;
}
