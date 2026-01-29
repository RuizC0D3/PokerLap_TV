// src/utils/text.ts
import type { UiSettings } from '../components/common/Card';

export function formatSeconds(sec: number): string {
  const s = Math.max(sec, 0);
  const mm = Math.floor(s / 60).toString().padStart(2, '0');
  const ss = (s % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

export function scaledFont(base: string, ui: UiSettings): string {
  return `calc(${base} * ${ui.fontScale})`;
}

