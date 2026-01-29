// src/layouts/grid.ts
import type { Theme, UiSettings } from '../common/Card';

export type WidgetId =
  | 'club'
  | 'torneo'
  | 'nivel'
  | 'reloj'
  | 'players'
  | 'next'
  | 'payouts';

export type WidgetConfig = {
  id: WidgetId;
  x: number;
  y: number;
  w: number;
  h: number;
};

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function rectanglesOverlap(a: WidgetConfig, b: WidgetConfig) {
  return !(
    a.x + a.w <= b.x ||
    b.x + b.w <= a.x ||
    a.y + a.h <= b.y ||
    b.y + b.h <= a.y
  );
}

export function placeWidgetWithCollision(
  prev: WidgetConfig[],
  movingId: WidgetId,
  gx: number,
  gy: number,
  cols: number,
  rows: number,
): WidgetConfig[] {
  const current = prev.find((w) => w.id === movingId);
  if (!current) return prev;

  const others = prev.filter((w) => w.id !== movingId);

  const targetX = clamp(gx, 0, cols - current.w);
  const targetY = clamp(gy, 0, rows - current.h);

  const candidateAtTarget: WidgetConfig = {
    ...current,
    x: targetX,
    y: targetY,
  };

  if (!others.some((o) => rectanglesOverlap(candidateAtTarget, o))) {
    return prev.map((w) => (w.id === movingId ? candidateAtTarget : w));
  }

  const freeSpots: { x: number; y: number; dist: number }[] = [];

  for (let y = 0; y <= rows - current.h; y++) {
    for (let x = 0; x <= cols - current.w; x++) {
      const candidate: WidgetConfig = { ...current, x, y };
      if (!others.some((o) => rectanglesOverlap(candidate, o))) {
        const dx = x - targetX;
        const dy = y - targetY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        freeSpots.push({ x, y, dist });
      }
    }
  }

  if (freeSpots.length === 0) return prev;

  freeSpots.sort((a, b) => a.dist - b.dist);
  const bestSpot = freeSpots[0];

  const best: WidgetConfig = {
    ...current,
    x: bestSpot.x,
    y: bestSpot.y,
  };

  const next = prev.map((w) => (w.id === movingId ? best : w));

  return next.map((w) => ({
    ...w,
    x: clamp(w.x, 0, cols - w.w),
    y: clamp(w.y, 0, rows - w.h),
  }));
}
