// src/components/widgets/NextLevelWidget.tsx
import type { Theme, UiSettings } from '../common/Card';
import { Card } from '../common/Card';
import type { TournamentState } from '../../tournamentState';
import { formatChips } from '../common/format';

type Props = {
  t: TournamentState;
  theme: Theme;
  ui: UiSettings;
};

export function NextLevelWidget({ t, theme, ui }: Props) {
  return (
    <Card theme={theme} ui={ui}>
      <div style={{ width: '100%', textAlign: 'center' }}>
        <div
          style={{
            fontSize: `${10 * ui.fontScale}px`,
            opacity: 0.6,
            marginBottom: '0.75rem',
          }}
        >
          Next Level
        </div>

        <div
          style={{
            fontSize: `${24 * ui.fontScale}px`,
            fontWeight: 700,
            color: theme.accent,
            marginBottom: '0.5rem',
          }}
        >
          Level {t.level + 1}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: `${9 * ui.fontScale}px`,
                opacity: 0.6,
                marginBottom: '0.25rem',
              }}
            >
              SB
            </div>
            <div
              style={{
                fontSize: `${18 * ui.fontScale}px`,
                fontWeight: 600,
                color: theme.textColor,
              }}
            >
              {formatChips(t.nextLevelSb)}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: `${9 * ui.fontScale}px`,
                opacity: 0.6,
                marginBottom: '0.25rem',
              }}
            >
              BB
            </div>
            <div
              style={{
                fontSize: `${18 * ui.fontScale}px`,
                fontWeight: 600,
                color: theme.textColor,
              }}
            >
              {formatChips(t.nextLevelBb)}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: `${9 * ui.fontScale}px`, opacity: 0.6, marginBottom: '0.25rem' }}>
              Ante
            </div>
            <div
              style={{
                fontSize: `${18 * ui.fontScale}px`,
                fontWeight: 600,
                color: theme.textColor,
              }}
            >
              {formatChips(t.nextLevelAnte)}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
