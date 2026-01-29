// src/App.tsx
import { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { recalcTimeLeftFromEstado } from './tournamentState';
import type { TournamentState } from './tournamentState';
import { createTvSocket } from './services/ws';

import type { Theme, UiSettings } from './components/common/Card';
import {
  ClubWidget,
  TournamentInfoWidget,
  NivelWidget,
  RelojWidget,
  PlayersWidget,
  NextLevelWidget,
  PayoutsWidget,
} from './components/widgets';
import {
  type WidgetId,
  type WidgetConfig,
  clamp,
  placeWidgetWithCollision,
} from './components/layouts/grid';

const THEMES: Record<string, Theme> = {
  deepBlue: {
    name: 'Deep Blue',
    bgGradient:
      'radial-gradient(circle at top, #0f172a 0, #020617 55%, #000 100%)',
    cardBg: 'rgba(15,23,42,0.96)',
    cardBorder: 'rgba(148,163,184,0.5)',
    cardShadow: '0 18px 40px rgba(15,23,42,0.8)',
    textColor: '#ffffff',
    accent: '#0ea5e9',
  },
  burgundy: {
    name: 'Burgundy',
    bgGradient:
      'radial-gradient(circle at top, #3b0210 0, #0b0210 55%, #000 100%)',
    cardBg: 'rgba(24,10,20,0.96)',
    cardBorder: 'rgba(248,113,113,0.5)',
    cardShadow: '0 18px 40px rgba(127,29,29,0.9)',
    textColor: '#fef2f2',
    accent: '#f97316',
  },
  bone: {
    name: 'Bone',
    bgGradient:
      'radial-gradient(circle at top, #f9fafb 0, #e5e7eb 55%, #d1d5db 100%)',
    cardBg: '#f3f4f6',
    cardBorder: 'rgba(148,163,184,0.6)',
    cardShadow: '0 18px 40px rgba(148,163,184,0.45)',
    textColor: '#020617',
    accent: '#0f766e',
  },
};

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
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
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

function renderWidget(
  id: WidgetId,
  theme: Theme,
  ui: UiSettings,
  t: TournamentState,
  timeLeft: number,
  nextBreakLeft: number,
) {
  switch (id) {
    case 'club':
      return <ClubWidget theme={theme} ui={ui} />;

    case 'torneo':
      return <TournamentInfoWidget t={t} theme={theme} ui={ui} />;

    case 'nivel':
      return (
        <NivelWidget
          t={t}
          theme={theme}
          ui={ui}
          nextBreakLeft={nextBreakLeft}
        />
      );

    case 'reloj':
      return <RelojWidget t={t} seconds={timeLeft} theme={theme} ui={ui} />;

    case 'players':
      return <PlayersWidget t={t} theme={theme} ui={ui} />;

    case 'next':
      return <NextLevelWidget t={t} theme={theme} ui={ui} />;

    case 'payouts':
      return <PayoutsWidget t={t} theme={theme} ui={ui} />;

    default:
      return null;
  }
}

function App() {
  const [themeKey, setThemeKey] =
    useState<keyof typeof THEMES>('deepBlue');
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

  const [tournament, setTournament] = useState<TournamentState | null>(
    null,
  );
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [nextBreakLeft, setNextBreakLeft] = useState<number>(0);

  const cols = 32;
  const rows = 18;
  const cellWidth = dimensions.width / cols;
  const cellHeight = dimensions.height / rows;

  const [uiSettings, setUiSettings] = useState<UiSettings>({
    fontScale: 1,
    fontFamily: 'system',
  });
  const [isEditMode, setIsEditMode] = useState(false);

  const [layout, setLayout] = useState<WidgetConfig[]>([
    { id: 'club', x: 1, y: 0, w: 7, h: 3 },
    { id: 'torneo', x: 8, y: 0, w: 10, h: 3 },
    { id: 'nivel', x: 18, y: 0, w: 13, h: 3 },
    { id: 'reloj', x: 1, y: 4, w: 30, h: 5 },
    { id: 'players', x: 1, y: 10, w: 10, h: 4 },
    { id: 'next', x: 11, y: 10, w: 10, h: 4 },
    { id: 'payouts', x: 21, y: 10, w: 10, h: 4 },
  ]);

  const [hoverCell, setHoverCell] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [draggingId, setDraggingId] = useState<WidgetId | null>(null);

  const [resizingId, setResizingId] = useState<WidgetId | null>(null);
  const [resizeStart, setResizeStart] = useState<{
    mouseX: number;
    mouseY: number;
    w: number;
    h: number;
  } | null>(null);

  // atajos teclado
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'e' && e.ctrlKey) {
        e.preventDefault();
        setIsEditMode((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // resize de ventana
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

  // resize de widgets (drag de esquina)
  useEffect(() => {
    if (!isEditMode || !resizingId || !resizeStart) return;

    const handleMove = (e: MouseEvent) => {
      const dx = e.clientX - resizeStart.mouseX;
      const dy = e.clientY - resizeStart.mouseY;

      const deltaCols = Math.round(dx / cellWidth);
      const deltaRows = Math.round(dy / cellHeight);

      const newW = clamp(resizeStart.w + deltaCols, 2, cols);
      const newH = clamp(resizeStart.h + deltaRows, 2, rows);

      setLayout((prev) =>
        prev.map((w) =>
          w.id === resizingId
            ? {
                ...w,
                w: clamp(newW, 1, cols - w.x),
                h: clamp(newH, 1, rows - w.y),
              }
            : w,
        ),
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

  // WebSocket TV
  useEffect(() => {
    const ws = createTvSocket({
      onEstado: (updater) => {
        setTournament((prev) => {
          const base: TournamentState =
            prev ?? {
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
          setNextBreakLeft(nuevo.nextBreakSeconds);
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

  // timer de nivel + break
  useEffect(() => {
    if (!tournament) return;

    const id = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
      setNextBreakLeft((prev) => Math.max(prev - 1, 0));
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
          placeWidgetWithCollision(prev, draggingId, gx, gy, cols, rows),
        );
        setHoverCell(null);
        setDraggingId(null);
      }}
    >
      {gridOverlay}

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

          <div
            style={{
              marginLeft: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span style={{ fontSize: 11, opacity: 0.8 }}>Font:</span>

            <input
              type="range"
              min={0.6}
              max={1.6}
              step={0.05}
              value={uiSettings.fontScale}
              onChange={(e) =>
                setUiSettings((prev) => ({
                  ...prev,
                  fontScale: Number(e.target.value),
                }))
              }
            />

            <select
              value={uiSettings.fontFamily}
              onChange={(e) =>
                setUiSettings((prev) => ({
                  ...prev,
                  fontFamily: e.target.value,
                }))
              }
              style={{
                borderRadius: 999,
                border: '1px solid rgba(148,163,184,0.6)',
                background: 'rgba(15,23,42,0.9)',
                color: 'white',
                padding: '2px 8px',
                cursor: 'pointer',
                fontSize: 11,
                outline: 'none',
                appearance: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
              }}
            >
              <option value="system">System</option>
              <option value='"Segoe UI", system-ui, sans-serif'>Segoe UI</option>
              <option value="Roboto, system-ui, sans-serif">Roboto</option>
              <option value="Montserrat, system-ui, sans-serif">Montserrat</option>
              <option value='"Open Sans", system-ui, sans-serif'>Open Sans</option>
              <option value='"Lato", system-ui, sans-serif'>Lato</option>
              <option value='"Poppins", system-ui, sans-serif'>Poppins</option>
              <option value='"Oswald", system-ui, sans-serif'>Oswald</option>
              <option value='"Raleway", system-ui, sans-serif'>Raleway</option>
              <option value='"Nunito", system-ui, sans-serif'>Nunito</option>
              <option value='"Source Sans 3", system-ui, sans-serif'>
                Source Sans 3
              </option>
              <option value='"Fira Sans", system-ui, sans-serif'>Fira Sans</option>
              <option value='"Inconsolata", monospace'>Inconsolata</option>
              <option value='"JetBrains Mono", monospace'>JetBrains Mono</option>
            </select>
          </div>
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
          {renderWidget(
            w.id,
            theme,
            uiSettings,
            tournament,
            timeLeft,
            nextBreakLeft,
          )}

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

