import { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { recalcTimeLeftFromEstado, applyEstado } from './tournamentState';
import type { TournamentState } from './tournamentState';
import { mapEstadoFromLegacy } from './utils/legacyMappers';
import { createTvSocket } from './services/ws';

function Card({
  children,
  bg = '#1a1a2e',
}: {
  children: React.ReactNode;
  bg?: string;
}) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: bg,
        border: '2px solid white',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        padding: '0.5rem',
        boxSizing: 'border-box',
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      {children}
    </div>
  );
}

// 3) Widgets específicos

function ClubWidget() {
  return (
    <Card bg="#2a2a3e">
      <div
        style={{
          fontSize: 'clamp(1.2rem, 2.2vw, 2.4rem)',
          fontWeight: 700,
        }}
      >
        LOGO CLUB
      </div>
    </Card>
  );
}

function TournamentInfoWidget() {
  return (
    <Card bg="#1a3a4e">
      <div
        style={{
          fontSize: 'clamp(1.1rem, 1.8vw, 2rem)',
          fontWeight: 600,
          marginBottom: '0.3rem',
        }}
      >
        TORNEO PRINCIPAL
      </div>
      <div
        style={{
          fontSize: 'clamp(0.85rem, 1.2vw, 1.2rem)',
          opacity: 0.9,
        }}
      >
        BUY‑IN 150K + 30K · STACK INICIAL 40K
      </div>
    </Card>
  );
}

function LevelWidget({ t }: { t: TournamentState }) {
  return (
    <Card bg="#3a1a2e">
      <div
        style={{
          fontSize: 'clamp(1.1rem, 2vw, 2.2rem)',
          fontWeight: 700,
          marginBottom: '0.4rem',
        }}
      >
        NIVEL {t.level}
      </div>
      <div
        style={{
          fontSize: 'clamp(0.9rem, 1.6vw, 1.6rem)',
        }}
      >
        {t.sb.toLocaleString()}/{t.bb.toLocaleString()} Ante{' '}
        {t.ante.toLocaleString()}
      </div>
    </Card>
  );
}

function ClockWidget({ seconds }: { seconds: number }) {
  const mm = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const ss = (seconds % 60).toString().padStart(2, '0');

  return (
    <Card bg="#0a4a5e">
      <div
        style={{
          fontSize: 'clamp(2rem, 5vw, 4rem)',
          fontWeight: 700,
        }}
      >
        {mm}:{ss}
      </div>
    </Card>
  );
}

function PlayersWidget({ t }: { t: TournamentState }) {
  const eliminated = t.playersTotal - t.playersRemaining;

  return (
    <Card bg="#2a2a3e">
      <div
        style={{
          fontSize: 'clamp(1rem, 1.8vw, 2rem)',
          fontWeight: 700,
          marginBottom: '0.4rem',
        }}
      >
        JUGADORES
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.2rem 1rem',
          fontSize: 'clamp(0.8rem, 1.2vw, 1.1rem)',
        }}
      >
        <span>Entradas</span>
        <span style={{ textAlign: 'right' }}>{t.playersTotal}</span>

        <span>Jugando</span>
        <span style={{ textAlign: 'right' }}>{t.playersRemaining}</span>

        <span>Eliminados</span>
        <span style={{ textAlign: 'right' }}>{eliminated}</span>

        <span>Reentradas</span>
        <span style={{ textAlign: 'right' }}>{t.reentries}</span>

        <span>Addons</span>
        <span style={{ textAlign: 'right' }}>{t.addons}</span>

        <span>Promedio</span>
        <span style={{ textAlign: 'right' }}>
          {t.avgStack.toLocaleString()}
        </span>
      </div>
    </Card>
  );
}

function NextBreakWidget({
  t,
  seconds,
}: {
  t: TournamentState;
  seconds: number;
}) {
  const mm = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const ss = (seconds % 60).toString().padStart(2, '0');

  return (
    <Card bg="#2a2a3e">
      <div
        style={{
          fontSize: 'clamp(1rem, 1.8vw, 2rem)',
          fontWeight: 700,
          marginBottom: '0.4rem',
        }}
      >
        NEXT LEVEL
      </div>
      <div
        style={{
          fontSize: 'clamp(0.85rem, 1.3vw, 1.4rem)',
          marginBottom: '0.2rem',
        }}
      >
        {t.nextLevelSb.toLocaleString()}/{t.nextLevelBb.toLocaleString()} Ante{' '}
        {t.nextLevelAnte.toLocaleString()}
      </div>
      <div
        style={{
          fontSize: 'clamp(0.75rem, 1.1vw, 1.1rem)',
          opacity: 0.9,
        }}
      >
        CAMBIO EN: {mm}:{ss}
      </div>
    </Card>
  );
}

function PayoutsWidget() {
  return (
    <Card bg="#2a2a3e">
      <div
        style={{
          fontSize: 'clamp(1rem, 1.8vw, 2rem)',
          fontWeight: 700,
          marginBottom: '0.4rem',
        }}
      >
        PRIZES
      </div>
      <div
        style={{
          fontSize: 'clamp(0.8rem, 1.1vw, 1.1rem)',
          lineHeight: 1.3,
        }}
      >
        1st  1.000.000  
        <br />
        2nd    600.000  
        <br />
        3rd    400.000
      </div>
    </Card>
  );
}

function QrWidget({ idTv }: { idTv: number }) {
  const value = `pokerlap://ax56${idTv}`;

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
        color: 'black',
      }}
    >
      {/* Aquí podrías meter /images/tv.jpg si quieres igual al viejo */}
      <div style={{ marginBottom: '2rem', fontSize: '1.4rem', fontWeight: 600 }}>
        For activate your TV, please read QR with Pokerlap APP
      </div>
      <QRCodeCanvas
        value={value}
        size={Math.min(window.innerWidth, window.innerHeight) * 0.4}
        bgColor="#ffffff"
        fgColor="#000000"
        level="H"
        includeMargin
      />
    </div>
  );
}

function App() {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [tvMode, setTvMode] = useState<'qr' | 'tournament'>('qr');
  const [idTv, setIdTv] = useState<number | null>(() => {
    const stored = Number(localStorage.getItem('ID_TV') || '0') || 0;
    return stored > 0 ? stored : null;
  }); 
  
  const [tournament, setTournament] = useState<TournamentState | null>(null);

  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const ws = createTvSocket({
      onEstado: (updater) => {
        setTournament((prev) => {
          const base: TournamentState = prev ?? {
            level: 1,
            sb: 0,
            bb: 0,
            ante: 0,
            levelMinutes: 0,
            estado: 0,
            horaEstadoMs: Date.now(),
            segNivel: 0,
            hDifMs: 0,
            nextLevelSb: 0,
            nextLevelBb: 0,
            nextLevelAnte: 0,
            nextBreakSeconds: 0,
            endRegisterSeconds: 0,
            endRebuySeconds: 0,
            endAddonSeconds: 0,
            playersTotal: 0,
            playersRemaining: 0,
            reentries: 0,
            addons: 0,
            avgStack: 0,
          };

          const nuevo = updater(base);

          console.log('DEBUG NEXT', {
            level: nuevo.level,
            segNivel: nuevo.segNivel,
            nextBreakSeconds: nuevo.nextBreakSeconds,
            endRegisterSeconds: nuevo.endRegisterSeconds,
            endRebuySeconds: nuevo.endRebuySeconds,
          });

          const initialTime = recalcTimeLeftFromEstado(nuevo);

          console.log('DEBUG TIME', {
            levelMinutes: nuevo.levelMinutes,
            segNivel: nuevo.segNivel,
            horaEstadoMs: nuevo.horaEstadoMs,
            hDifMs: nuevo.hDifMs,
            initialTime,
          });
          setTimeLeft(initialTime);

          setTvMode('tournament');
          return nuevo;
        });
      },
      onQr: (newIdTv) => {
        if (newIdTv > 0) {
          setIdTv(newIdTv);
          setTvMode('qr');
        } else {
          setTvMode('tournament');
        }
      },
    });

    return () => ws.close();
  }, []);


  useEffect(() => {
    if (!tournament) return;

    const id = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(id);
  }, [tournament?.horaEstadoMs]);

  const cols = 32;
  const rows = 18;
  const cellWidth = dimensions.width / cols;
  const cellHeight = dimensions.height / rows;

  if (tvMode === 'qr' && idTv) {
  return <QrWidget idTv={idTv} />;
  }

  if (!tournament) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          background: 'black',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
        }}
      >
        Esperando datos del torneo...
      </div>
    );
  }

  const widgets = [
    { id: 'club', x: 1, y: 0, w: 7, h: 3, render: <ClubWidget /> },
    { id: 'torneo', x: 8, y: 0, w: 10, h: 3, render: <TournamentInfoWidget /> },
    { id: 'nivel', x: 18, y: 0, w: 13, h: 3, render: <LevelWidget t={tournament} /> },
    { id: 'players', x: 1, y: 10, w: 10, h: 4, render: <PlayersWidget t={tournament} /> },
    { id: 'payouts', x: 21, y: 10, w: 10, h: 4, render: <PayoutsWidget /> },
    { id: 'reloj', x: 1, y: 4, w: 30, h: 5, render: <ClockWidget seconds={timeLeft} /> },
    { id: 'nextLevel', x: 11, y: 10, w: 10, h: 4,
      render: <NextBreakWidget t={tournament} seconds={timeLeft} /> },
  ];

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: 'black',
        overflow: 'hidden',
        margin: 0,
        padding: 0,
        position: 'relative',
      }}
    >
      {widgets.map((w) => (
        <div
          key={w.id}
          style={{
            position: 'absolute',
            left: `${w.x * cellWidth}px`,
            top: `${w.y * cellHeight}px`,
            width: `${w.w * cellWidth}px`,
            height: `${w.h * cellHeight}px`,
            padding: '4px',
            boxSizing: 'border-box',
          }}
        >
          {w.render}
        </div>
      ))}
    </div>
  );
}

export default App;
