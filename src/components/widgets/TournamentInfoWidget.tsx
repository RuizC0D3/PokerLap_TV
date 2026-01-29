import type { Theme, UiSettings } from '../common/Card';
import { Card } from '../common/Card';
import type { TournamentState } from '../../tournamentState';

type Props = {
  t: TournamentState;
  theme: Theme;
  ui: UiSettings;
};

export function TournamentInfoWidget({ t, theme, ui }: Props) {
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
          Tournament
        </div>
        <div
          style={{
            fontSize: `${16 * ui.fontScale}px`,
            fontWeight: 600,
            color: theme.textColor,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {t.tournamentName || 'Loading...'}
        </div>
      </div>
    </Card>
  );
}
