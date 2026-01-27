// src/App.tsx

import { useEffect, useState, type JSX } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { recalcTimeLeftFromEstado } from './tournamentState';
import type { TournamentState } from './tournamentState';
import { createTvSocket } from './services/ws';

const THEME = {
  bgPrimary: '#020617',
  cardMain: 'rgba(15,23,42,0.92)',
  border: 'rgba(148,163,184,0.5)',
};

function Card({
  children,
  bg = THEME.cardMain,
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
        borderRadius: '14px',
        border: `1px solid ${THEME.border}`,
        boxShadow: '0 18px 40px rgba(15,23,42,0.8)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        padding: '0.75rem',
        boxSizing: 'border-box',
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {children}
    </div>
  );
}


function ClubWidget() {
  return (
    <Card bg="#2a2a3e">
      <div
        style={{
          fontSize: 'clamp(0.8rem, 1.5vh, 1.8rem)',
          fontWeight: 700,
        }}
      >
        LOGO CLUB
      </div>
    </Card>
  );
}

function TournamentInfoWidget({ t }: { t: TournamentState }) {
  return (
    <Card bg="#1a3a4e">
      <div
        style={{
          fontSize: 'clamp(0.8rem, 1.5vh, 1.8rem)',
          fontWeight: 700,
          textAlign: 'center',
        }}
      >
        {t.tournamentName}
      </div>
    </Card>
  );
}


function LevelWidget({ t }: { t: TournamentState }) {
  const nb = Math.max(t.nextBreakSeconds ?? 0, 0);
  const mm = Math.floor(nb / 60).toString().padStart(2, '0');
  const ss = (nb % 60).toString().padStart(2, '0');

  return (
    <Card bg="#3a1a2e">
      {/* NIVEL X */}
      <div
        style={{
          fontSize: 'clamp(0.8rem, 1.5vh, 1.7rem)',
          fontWeight: 700,
          marginBottom: '0.25rem',
        }}
      >
        NIVEL {t.level}
      </div>

      {/* Texto pequeño opcional (blinds resumidas) */}
      <div
        style={{
          fontSize: 'clamp(0.55rem, 1vh, 1.1rem)',
          marginBottom: '0.2rem',
        }}
      >
        {t.sb.toLocaleString()}/{t.bb.toLocaleString()} Ante{' '}
        {t.ante.toLocaleString()}
      </div>

      {/* BREAK EN */}
      <div
        style={{
          fontSize: 'clamp(0.6rem, 1.1vh, 1.3rem)',
          fontWeight: 600,
        }}
      >
        BREAK EN: {mm}:{ss}
      </div>
    </Card>
  );
}


function ClockWidget({ t, seconds }: { t: TournamentState; seconds: number }) {
  const mm = Math.floor(seconds / 60).toString().padStart(2, '0');
  const ss = (seconds % 60).toString().padStart(2, '0');

  return (
    <Card bg="#0a4a5e">
      {/* Tiempo grande */}
      <div
        style={{
          fontSize: 'clamp(1.8rem, 4vh, 4.5rem)',
          fontWeight: 700,
          letterSpacing: '0.08em',
          marginBottom: '0.4rem',
        }}
      >
        {mm}:{ss}
      </div>

      {/* Blinds/ante debajo */}
      <div
        style={{
          fontSize: 'clamp(0.7rem, 1.4vh, 1.6rem)',
          fontWeight: 600,
        }}
      >
        {t.sb.toLocaleString()}/{t.bb.toLocaleString()} Ante{' '}
        {t.ante.toLocaleString()}
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
          fontSize: 'clamp(0.7rem, 1.2vh, 1.4rem)',
          fontWeight: 700,
          marginBottom: '0.3rem',
        }}
      >
        JUGADORES
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.1rem 0.5rem',
          fontSize: 'clamp(0.5rem, 0.8vh, 0.9rem)',
          width: '100%',
          padding: '0 0.5rem',
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

function NextLevelWidget({ t, seconds }: { t: TournamentState; seconds: number }) {
  const mm = Math.floor(seconds / 60).toString().padStart(2, '0');
  const ss = (seconds % 60).toString().padStart(2, '0');

  return (
    <Card bg="#2a2a3e">
      <div
        style={{
          fontSize: 'clamp(0.7rem, 1.2vh, 1.4rem)',
          fontWeight: 700,
          marginBottom: '0.3rem',
        }}
      >
        NEXT LEVEL
      </div>

      <div
        style={{
          fontSize: 'clamp(0.55rem, 0.9vh, 1rem)',
          marginBottom: '0.2rem',
        }}
      >
        {t.nextLevelSb.toLocaleString()}/{t.nextLevelBb.toLocaleString()} Ante{' '}
        {t.nextLevelAnte.toLocaleString()}
      </div>

      <div
        style={{
          fontSize: 'clamp(0.5rem, 0.8vh, 0.9rem)',
          opacity: 0.9,
        }}
      >
        CAMBIO EN: {mm}:{ss}
      </div>
    </Card>
  );
}


function PayoutsWidget({ t }: { t: TournamentState }) {
  const prizes = t.prizes ?? [];

  return (
    <Card bg="#2a2a3e">
      <div
        style={{
          fontSize: 'clamp(0.7rem, 1.2vh, 1.4rem)',
          fontWeight: 700,
          marginBottom: '0.3rem',
        }}
      >
        PRIZES
      </div>

      <div
        style={{
          fontSize: 'clamp(0.5rem, 0.9vh, 1rem)',
          lineHeight: 1.4,
          width: '100%',
          padding: '0 0.3rem',
        }}
      >
        {prizes.slice(0, 8).map((p) => (
          <div
            key={p.position}
            style={{ display: 'flex', justifyContent: 'space-between' }}
          >
            <span>{p.position}º</span>
            <span>{p.amount.toLocaleString()}</span>
          </div>
        ))}
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
  const cols = 32;
  const rows = 18;
  const cellWidth = dimensions.width / cols;
  const cellHeight = dimensions.height / rows;

  type WidgetConfig = {
    id: 'club' | 'torneo' | 'nivel' | 'reloj' | 'players' | 'next' | 'payouts';
    x: number;
    y: number;
    w: number;
    h: number;
  };

  const isEditMode = window.location.search.includes('edit=1');

  const gridOverlay = isEditMode ? (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(to right, rgba(148,163,184,0.12) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(148,163,184,0.12) 1px, transparent 1px)
        `,
        backgroundSize: `${cellWidth}px ${cellHeight}px`,
        zIndex: 0,
      }}
    />
  ) : null;

  const [layout, setLayout] = useState<WidgetConfig[]>([
    { id: 'club',    x: 1,  y: 0,  w: 7,  h: 3 },
    { id: 'torneo',  x: 8,  y: 0,  w: 10, h: 3 },
    { id: 'nivel',   x: 18, y: 0,  w: 13, h: 3 },
    { id: 'reloj',   x: 1,  y: 4,  w: 30, h: 5 },
    { id: 'players', x: 1,  y: 10, w: 10, h: 4 },
    { id: 'next',    x: 11, y: 10, w: 10, h: 4 },
    { id: 'payouts', x: 21, y: 10, w: 10, h: 4 },
  ]);

  const [hoverCell, setHoverCell] = useState<{ x: number; y: number } | null>(
    null
  );
  const [draggingId, setDraggingId] = useState<WidgetConfig['id'] | null>(null);

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
            tournamentName: '',
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
            prizes: [],
          };

          const nuevo = updater(base);
          const initialTime = recalcTimeLeftFromEstado(nuevo);
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
          fontSize: 'clamp(1rem, 2vh, 2rem)',
        }}
      >
        Esperando datos del torneo...
      </div>
    );
  }

  

  const widgetRender: Record<WidgetConfig['id'], JSX.Element> = {
    club:    <ClubWidget />,
    torneo:  <TournamentInfoWidget t={tournament} />,
    nivel:   <LevelWidget t={tournament} />,
    reloj:   <ClockWidget t={tournament} seconds={timeLeft} />,
    players: <PlayersWidget t={tournament} />,
    next:    <NextLevelWidget t={tournament} seconds={timeLeft} />,
    payouts: <PayoutsWidget t={tournament} />,
  };


  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background:
          'radial-gradient(circle at top, #0f172a 0, #020617 55%, #000 100%)',
        overflow: 'hidden',
        margin: 0,
        padding: 0,
        position: 'relative',
      }}
      onDragOver={(e) => {
        if (!isEditMode || !draggingId) return;
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        const gx = Math.floor(cx / cellWidth);
        const gy = Math.floor(cy / cellHeight);
        setHoverCell({ x: gx, y: gy });
      }}
      onDrop={(e) => {
        if (!isEditMode || !draggingId) return;
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        const gx = Math.floor(cx / cellWidth);
        const gy = Math.floor(cy / cellHeight);

        setLayout((prev) =>
          prev.map((item) =>
            item.id === draggingId ? { ...item, x: gx, y: gy } : item
          )
        );
        setHoverCell(null);
        setDraggingId(null);
      }}
    >
      {isEditMode && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            backgroundImage: `
              linear-gradient(to right, rgba(148,163,184,0.12) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(148,163,184,0.12) 1px, transparent 1px)
            `,
            backgroundSize: `${cellWidth}px ${cellHeight}px`,
            zIndex: 0,
          }}
        />
      )}

      {isEditMode && hoverCell && draggingId && (
        (() => {
          const cfg = layout.find((w) => w.id === draggingId)!;
          return (
            <div
              style={{
                position: 'absolute',
                left: `${hoverCell.x * cellWidth}px`,
                top: `${hoverCell.y * cellHeight}px`,
                width: `${cfg.w * cellWidth}px`,
                height: `${cfg.h * cellHeight}px`,
                borderRadius: '10px',
                border: '2px dashed rgba(251,191,36,0.9)',
                background: 'rgba(251,191,36,0.08)',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            />
          );
        })()
      )}

      {layout.map((w) => (
        <div
          key={w.id}
          draggable={isEditMode}
          onDragStart={(e) => {
            if (!isEditMode) return;
            e.dataTransfer.setData('text/plain', w.id);
            setDraggingId(w.id);
          }}
          onDragOver={(e) => {
            if (!isEditMode || !draggingId) return;
            e.preventDefault();
          }}
          style={{
            position: 'absolute',
            left: `${w.x * cellWidth}px`,
            top: `${w.y * cellHeight}px`,
            width: `${w.w * cellWidth}px`,
            height: `${w.h * cellHeight}px`,
            padding: '4px',
            boxSizing: 'border-box',
            cursor: isEditMode ? 'move' : 'default',
            zIndex: 2,
          }}
        >
          {widgetRender[w.id]}
        </div>
      ))}
    </div>
  );
}

export default App;