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

const THEMES = {
  deepBlue: {
    name: 'Deep Blue',
    bgGradient:
      'radial-gradient(circle at top, #0f172a 0, #020617 55%, #000 100%)',
    cardBg: 'rgba(15,23,42,0.96)',
    accent: '#0ea5e9',
  },
  burgundy: {
    name: 'Burgundy',
    bgGradient:
      'radial-gradient(circle at top, #3b0210 0, #0b0210 55%, #000 100%)',
    cardBg: 'rgba(24,10,20,0.96)',
    accent: '#f97316',
  },
};


function Card({
  children,
  bg = THEME.cardMain,
}: {
  children: React.ReactNode;
  bg?: string;
}) {
  const defaultBg = THEMES.deepBlue.cardBg;
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: bg ?? defaultBg,
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
  const [themeKey, setThemeKey] = useState<keyof typeof THEMES>('deepBlue');
  const theme = THEMES[themeKey];
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

  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl+E para togglear edición
      if (e.key.toLowerCase() === 'e' && e.ctrlKey) {
        e.preventDefault();
        setIsEditMode((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

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

  function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
  }

  function rectanglesOverlap(a: WidgetConfig, b: WidgetConfig) {
    return !(
      a.x + a.w <= b.x ||
      b.x + b.w <= a.x ||
      a.y + a.h <= b.y ||
      b.y + b.h <= a.y
    );
  }

  function placeWidgetWithCollision(
    prev: WidgetConfig[],
    movingId: WidgetConfig['id'],
    gx: number,
    gy: number,
    cols: number,
    rows: number
  ): WidgetConfig[] {
    const current = prev.find((w) => w.id === movingId);
    if (!current) return prev;

    const others = prev.filter((w) => w.id !== movingId);

    // posición propuesta dentro de la grilla
    const targetX = clamp(gx, 0, cols - current.w);
    const targetY = clamp(gy, 0, rows - current.h);

    const candidateAtTarget: WidgetConfig = {
      ...current,
      x: targetX,
      y: targetY,
    };

    if (!others.some((o) => rectanglesOverlap(candidateAtTarget, o))) {
      return prev.map((w) => (w.id === movingId ? candidateAtTarget : w));
    }

    // buscar TODOS los huecos posibles y quedarnos con el más cercano a (targetX, targetY)
    const freeSpots: { x: number; y: number; dist: number }[] = [];

    for (let y = 0; y <= rows - current.h; y++) {
      for (let x = 0; x <= cols - current.w; x++) {
        const candidate: WidgetConfig = { ...current, x, y };
        if (!others.some((o) => rectanglesOverlap(candidate, o))) {
          const dx = x - targetX;
          const dy = y - targetY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          freeSpots.push({ x, y, dist });
        }
      }
    }

    if (freeSpots.length === 0) {
      // no hay hueco: cancelamos movimiento
      return prev;
    }

    // hueco más cercano al punto donde soltaste
    freeSpots.sort((a, b) => a.dist - b.dist);
    const bestSpot = freeSpots[0];

    const best: WidgetConfig = {
      ...current,
      x: bestSpot.x,
      y: bestSpot.y,
    };

    const next = prev.map((w) => (w.id === movingId ? best : w));

    // clamp de seguridad
    return next.map((w) => ({
      ...w,
      x: clamp(w.x, 0, cols - w.w),
      y: clamp(w.y, 0, rows - w.h),
    }));
  }



  const [hoverCell, setHoverCell] = useState<{ x: number; y: number } | null>(
    null
  );
  const [draggingId, setDraggingId] = useState<WidgetConfig['id'] | null>(null);

  const [resizingId, setResizingId] = useState<WidgetConfig['id'] | null>(null);
  const [resizeStart, setResizeStart] = useState<{
    mouseX: number;
    mouseY: number;
    w: number;
    h: number;
  } | null>(null);

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
  if (!isEditMode || !resizingId || !resizeStart) return;

  const handleMove = (e: MouseEvent) => {
    const dx = e.clientX - resizeStart.mouseX;
    const dy = e.clientY - resizeStart.mouseY;

    const deltaCols = Math.round(dx / cellWidth);
    const deltaRows = Math.round(dy / cellHeight);

    const newW = clamp(resizeStart.w + deltaCols, 2, cols); // mínimo 2 celdas
    const newH = clamp(resizeStart.h + deltaRows, 2, rows);

    setLayout((prev) =>
      prev.map((w) =>
        w.id === resizingId
          ? {
              ...w,
              w: clamp(newW, 1, cols - w.x),
              h: clamp(newH, 1, rows - w.y),
            }
          : w
      )
    );
  };

  const handleUp = () => {
    setResizingId(null);
    setResizeStart(null);
  };

  window.addEventListener('mousemove', handleMove);
  window.addEventListener('mouseup', handleUp);
  return () => {
    window.removeEventListener('mousemove', handleMove);
    window.removeEventListener('mouseup', handleUp);
  };
}, [isEditMode, resizingId, resizeStart, cellWidth, cellHeight, cols, rows]);


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
        background: theme.bgGradient,
        overflow: 'hidden',
        margin: 0,
        padding: 0,
        position: 'relative',
      }}
      onDragOver={(e) => {
        if (!isEditMode || !draggingId) return;
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        const moving = layout.find((w) => w.id === draggingId);
        if (!moving) return;

        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;

        const originX = cx - (moving.w * cellWidth) / 2;
        const originY = cy - (moving.h * cellHeight) / 2;

        const gx = Math.round(originX / cellWidth);
        const gy = Math.round(originY / cellHeight);

        setHoverCell({ x: gx, y: gy });
      }}
      onDrop={(e) => {
        if (!isEditMode || !draggingId) return;
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        const moving = layout.find((w) => w.id === draggingId);
        if (!moving) return;

        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;

        const originX = cx - (moving.w * cellWidth) / 2;
        const originY = cy - (moving.h * cellHeight) / 2;

        const gx = Math.round(originX / cellWidth);
        const gy = Math.round(originY / cellHeight);

        setLayout((prev) =>
          placeWidgetWithCollision(prev, draggingId, gx, gy, cols, rows)
        );
        setHoverCell(null);
        setDraggingId(null);
      }}
    >
      {isEditMode && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 3,
            padding: '6px 10px',
            borderRadius: 999,
            background: 'rgba(15,23,42,0.9)',
            border: '1px solid rgba(148,163,184,0.6)',
            color: 'white',
            fontSize: 12,
            display: 'flex',
            gap: 8,
            alignItems: 'center',
          }}
        >
          <span style={{ opacity: 0.8 }}>Theme:</span>
          {Object.entries(THEMES).map(([key, value]) => (
            <button
              key={key}
              onClick={() => setThemeKey(key as keyof typeof THEMES)}
              style={{
                borderRadius: 999,
                border:
                  themeKey === key
                    ? '1px solid white'
                    : '1px solid rgba(148,163,184,0.6)',
                background:
                  themeKey === key ? value.accent : 'rgba(15,23,42,0.9)',
                color: 'white',
                padding: '2px 8px',
                cursor: 'pointer',
                fontSize: 11,
              }}
            >
              {value.name}
            </button>
          ))}
        </div>
      )}

      {isEditMode && hoverCell && draggingId && (() => {
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
      })()}

      {layout.map((w) => (
        <div
          key={w.id}
          draggable={isEditMode && !resizingId}
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

          {isEditMode && (
            <div
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setResizingId(w.id);
                setResizeStart({
                  mouseX: e.clientX,
                  mouseY: e.clientY,
                  w: w.w,
                  h: w.h,
                });
              }}
              style={{
                position: 'absolute',
                right: 4,
                bottom: 4,
                width: 14,
                height: 14,
                borderRadius: 4,
                background: 'rgba(148,163,184,0.9)',
                border: '1px solid rgba(15,23,42,0.9)',
                cursor: 'nwse-resize',
                zIndex: 3,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );

}

export default App;