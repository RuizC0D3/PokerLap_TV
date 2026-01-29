// src/components/common/Card.tsx
import type { ReactNode } from 'react';

export type Theme = {
  name: string;
  bgGradient: string;
  cardBg: string;
  cardBorder: string;
  cardShadow: string;
  textColor: string;
  accent: string;
};

export type UiSettings = {
  fontScale: number;
  fontFamily: string;
};

type Props = {
  children: ReactNode;
  theme: Theme;
  bg?: string;
  ui: UiSettings;
};

export function Card({ children, theme, bg, ui }: Props) {
  const background = bg ?? theme.cardBg;

  const fontFamily =
    ui.fontFamily === 'system'
      ? 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      : ui.fontFamily;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background,
        borderRadius: '14px',
        border: `1px solid ${theme.cardBorder}`,
        boxShadow: theme.cardShadow,
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.textColor,
        padding: '0.75rem',
        boxSizing: 'border-box',
        overflow: 'hidden',
        fontFamily,
      }}
    >
      {children}
    </div>
  );
}
