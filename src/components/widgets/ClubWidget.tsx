import type { Theme, UiSettings } from '../common/Card';
import { Card } from '../common/Card';

type Props = {
  theme: Theme;
  ui: UiSettings;
};

export function ClubWidget({ theme, ui }: Props) {
  return (
    <Card theme={theme} ui={ui}>
      <div style={{ textAlign: 'center', width: '100%' }}>
        <div
          style={{
            fontSize: `${12 * ui.fontScale}px`,
            opacity: 0.7,
            marginBottom: '0.5rem',
          }}
        >
          Club
        </div>
        <div
          style={{
            fontSize: `${24 * ui.fontScale}px`,
            fontWeight: 600,
            color: theme.accent,
          }}
        >
          PokerLap
        </div>
      </div>
    </Card>
  );
}
