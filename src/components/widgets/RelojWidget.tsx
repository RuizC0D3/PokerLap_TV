// src/components/widgets/RelojWidget.tsx
import type { Theme, UiSettings } from '../common/Card';
import { Card } from '../common/Card';
import type { TournamentState } from '../../tournamentState';
import { formatChips } from '../common/format';

type Props = {
  t: TournamentState;
  seconds: number;
  theme: Theme;
  ui: UiSettings;
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs
    .toString()
    .padStart(2, '0')}`;
}

export function RelojWidget({ t, seconds, theme, ui }: Props) {
  const isBreak =
    t.estado === 2 || t.estado === 3 || t.estado === 4 || t.estado === 5;
  const levelTime = `${t.levelMinutes}:00`;

  const blindsLine = `${formatChips(t.sb)} / ${formatChips(t.bb)}`;
  const anteLine = t.ante > 0 ? ` Ante ${formatChips(t.ante)}` : '';



  return (
    <Card theme={theme} ui={ui}>
      <div style={{ textAlign: 'center', width: '100%' }}>
        <div
          style={{
            fontSize: `${12 * ui.fontScale}px`,
            opacity: 0.6,
            marginBottom: '0.5rem',
          }}
        >
          {isBreak ? 'BREAK' : 'Level Time'}
        </div>

        <div
          style={{
            fontSize: `${48 * ui.fontScale}px`,
            fontWeight: 700,
            color: isBreak ? '#ff6b6b' : theme.accent,
            fontFamily: 'monospace',
            letterSpacing: '2px',
          }}
        >
          {formatTime(seconds)}
        </div>

        <div
          style={{
            fontSize: `${13 * ui.fontScale}px`,
            marginTop: '0.6rem',
            fontWeight: 600,
          }}
        >
          {blindsLine}
          {anteLine}
        </div>

        <div
          style={{
            fontSize: `${11 * ui.fontScale}px`,
            opacity: 0.6,
            marginTop: '0.3rem',
          }}
        >
          Level: {levelTime}
        </div>
      </div>
    </Card>
  );
}
