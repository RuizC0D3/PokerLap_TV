import type { Theme, UiSettings } from '../common/Card';
import { Card } from '../common/Card';
import type { TournamentState } from '../../tournamentState';

type Props = {
  t: TournamentState;
  theme: Theme;
  ui: UiSettings;
};

export function PayoutsWidget({ t, theme, ui }: Props) {
  const topPrizes = (t.prizes ?? []).slice(0, 3);

  return (
    <Card theme={theme} ui={ui}>
      <div style={{ width: '100%' }}>
        <div
          style={{
            fontSize: `${10 * ui.fontScale}px`,
            opacity: 0.6,
            textAlign: 'center',
            marginBottom: '0.75rem',
          }}
        >
          Payouts (Top 3)
        </div>

        {topPrizes.length > 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            {topPrizes.map((prize, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.5rem',
                  background: `rgba(${[
                    theme.accent === '#0ea5e9'
                      ? '14, 165, 233'
                      : theme.accent === '#f97316'
                        ? '249, 115, 22'
                        : '15, 118, 110',
                  ].join(',')}, 0.1)`,
                  borderRadius: '6px',
                }}
              >
                <div
                  style={{
                    fontSize: `${10 * ui.fontScale}px`,
                    fontWeight: 600,
                    color: theme.accent,
                  }}
                >
                  #{prize.position}
                </div>
                <div
                  style={{
                    fontSize: `${12 * ui.fontScale}px`,
                    fontWeight: 600,
                    color: theme.textColor,
                  }}
                >
                  {Math.floor(prize.amount).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              fontSize: `${11 * ui.fontScale}px`,
              opacity: 0.5,
              padding: '1rem 0',
            }}
          >
            No payouts set
          </div>
        )}

        {t.prizes.length > 3 && (
          <div
            style={{
              marginTop: '0.5rem',
              paddingTop: '0.5rem',
              borderTop: `1px solid ${theme.cardBorder}`,
              textAlign: 'center',
              fontSize: `${9 * ui.fontScale}px`,
              opacity: 0.5,
            }}
          >
            +{t.prizes.length - 3} more places
          </div>
        )}
      </div>
    </Card>
  );
}