// src/components/widgets/PlayersWidget.tsx
import type { Theme, UiSettings } from '../common/Card';
import { Card } from '../common/Card';
import type { TournamentState } from '../../tournamentState';
import { formatChips } from '../common/format';

type Props = {
  t: TournamentState;
  theme: Theme;
  ui: UiSettings;
};

export function PlayersWidget({ t, theme, ui }: Props) {
  return (
    <Card theme={theme} ui={ui}>
      <div style={{ width: '100%' }}>
        {/* Título principal */}
        <div
          style={{
            fontSize: `${10 * ui.fontScale}px`,
            opacity: 0.6,
            textAlign: 'center',
            marginBottom: '0.75rem',
          }}
        >
          Players
        </div>

        {/* Totales / Players / Avg */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'space-around',
            alignItems: 'center',
          }}
        >
          {/* Entries totales */}
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: `${10 * ui.fontScale}px`,
                opacity: 0.6,
                marginBottom: '0.25rem',
              }}
            >
              Entries
            </div>
            <div
              style={{
                fontSize: `${24 * ui.fontScale}px`,
                fontWeight: 600,
                color: theme.accent,
              }}
            >
              {t.playersTotal}
            </div>
          </div>

          {/* Players activos */}
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: `${10 * ui.fontScale}px`,
                opacity: 0.6,
                marginBottom: '0.25rem',
              }}
            >
              Players
            </div>
            <div
              style={{
                fontSize: `${24 * ui.fontScale}px`,
                fontWeight: 600,
                color: '#fbbf24',
              }}
            >
              {t.playersRemaining}
            </div>
          </div>

          {/* Avg stack */}
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: `${10 * ui.fontScale}px`,
                opacity: 0.6,
                marginBottom: '0.25rem',
              }}
            >
              Avg Stack
            </div>
            <div
              style={{
                fontSize: `${18 * ui.fontScale}px`,
                fontWeight: 600,
                color: theme.textColor,
              }}
            >
              {formatChips(Math.floor(t.avgStack))}
            </div>
          </div>
        </div>

        {/* Reentries / Addons */}
        {(t.reentries > 0 || t.addons > 0) && (
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'space-around',
              marginTop: '0.75rem',
              paddingTop: '0.75rem',
              borderTop: `1px solid ${theme.cardBorder}`,
            }}
          >
            {t.reentries > 0 && (
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: `${9 * ui.fontScale}px`,
                    opacity: 0.5,
                  }}
                >
                  Reentries
                </div>
                <div
                  style={{
                    fontSize: `${16 * ui.fontScale}px`,
                    fontWeight: 600,
                    color: '#60a5fa',
                  }}
                >
                  {t.reentries}
                </div>
              </div>
            )}
            {t.addons > 0 && (
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: `${9 * ui.fontScale}px`,
                    opacity: 0.5,
                  }}
                >
                  Add-ons
                </div>
                <div
                  style={{
                    fontSize: `${16 * ui.fontScale}px`,
                    fontWeight: 600,
                    color: '#34d399',
                  }}
                >
                  {t.addons}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
