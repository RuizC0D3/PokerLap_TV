// src/components/common/format.ts
export function formatChips(value: number): string {
  if (!value) return '0';
  if (value >= 1000000) {
    return `${Math.round(value / 1000000)}M`;
  }
  if (value >= 1000) {
    return `${Math.round(value / 1000)}K`;
  }
  return value.toString();
}
