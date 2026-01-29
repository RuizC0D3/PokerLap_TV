// src/components/widgets/NivelWidget.tsx
import type { Theme, UiSettings } from '../common/Card';
import { Card } from '../common/Card';
import type { TournamentState } from '../../tournamentState';
import { formatChips } from '../common/format';

type Props = {
  t: TournamentState;
  theme: Theme;
  ui: UiSettings;
  nextBreakLeft: number;   // <-- agregar esta prop
};

function formatDuration(seconds: number): string {
  if (seconds <= 0) return '—';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs
    .toString()
    .padStart(2, '0')}`;
}

export function NivelWidget({ t, theme, ui, nextBreakLeft }: Props) {
  const blindsText = `${formatChips(t.sb)} / ${formatChips(t.bb)}`;
  const anteText = t.ante > 0 ? ` Ante ${formatChips(t.ante)}` : '';
  const nextBreakText = formatDuration(nextBreakLeft);

  return (
    <Card theme={theme} ui={ui}>
      <div style={{ textAlign: 'center', width: '100%' }}>
        <div
          style={{
            fontSize: `${10 * ui.fontScale}px`,
            opacity: 0.6,
            marginBottom: '0.25rem',
          }}
        >
          Level
        </div>

        <div
          style={{
            fontSize: `${28 * ui.fontScale}px`,
            fontWeight: 700,
            color: theme.accent,
          }}
        >
          {t.level}
        </div>

        <div
          style={{
            fontSize: `${11 * ui.fontScale}px`,
            opacity: 0.8,
            marginTop: '0.35rem',
          }}
        >
          {blindsText}
          {anteText}
        </div>

        <div
          style={{
            fontSize: `${10 * ui.fontScale}px`,
            opacity: 0.65,
            marginTop: '0.4rem',
          }}
        >
          Next break: {nextBreakText}
        </div>
      </div>
    </Card>
  );
}
