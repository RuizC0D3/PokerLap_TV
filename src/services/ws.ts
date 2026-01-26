// src/services/ws.ts
import { mapEstadoFromLegacy } from '../utils/legacyMappers';
import type { TournamentState } from '../tournamentState';

export type EstadoHandler = (
  updater: (prev: TournamentState) => TournamentState
) => void;

export type TvMode = 'qr' | 'tournament';

export type TvHandlers = {
  onEstado: EstadoHandler;
  onQr: (idTv: number) => void;
  onTorneo?: (data: any) => void;
};

function calcEndByNivel(
  estructura: any[],
  desdeIdx: number,
  limiteI: number,
  horaEstadoMs: number,
  segNivel: number
): number {
  if (!estructura.length || limiteI <= 0) return 0;

  let iProx = desdeIdx;
  let nReg = horaEstadoMs + (estructura[desdeIdx].m * 60 - segNivel) * 1000;

  while (estructura[iProx] && Number(estructura[iProx].i) <= limiteI) {
    nReg += estructura[iProx].m * 60000;
    iProx++;
    if (iProx >= estructura.length) break;
  }

  const dHoy = Date.now();
  return Math.max(Math.floor((nReg - dHoy) / 1000), 0);
}

function calcNextBreakSeconds(
  estructura: any[],
  desdeIdx: number,
  horaEstadoMs: number,
  segNivel: number
): number {
  if (!estructura.length) return 0;

  let iProx = desdeIdx;
  let nDesc =
    horaEstadoMs + (estructura[desdeIdx].m * 60 - segNivel) * 1000;

  while (estructura[iProx] && estructura[iProx].t !== 0) {
    nDesc += estructura[iProx].m * 60000;
    iProx++;
    if (iProx >= estructura.length) break;
  }

  const dHoy = Date.now();
  return Math.max(Math.floor((nDesc - dHoy) / 1000), 0);
}


export function createTvSocket(handlers: TvHandlers) {
  const { onEstado, onQr } = handlers;
  const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
  const ws = new WebSocket(protocol + 'wstv.pkti.me');

  ws.onopen = () => {
    console.log('TV socket connected');
    const stored = Number(localStorage.getItem('ID_TV') || '0') || 0;
    ws.send(JSON.stringify({ action: 'ID_TV', valor: stored }));
  };

  ws.onmessage = (ev) => {
    console.log('WS RAW:', ev.data);

    try {
      const msg = JSON.parse(ev.data);

      switch (msg.Tipo) {
        case 'QR': {
          const idTv = Number(msg.Datos) || 0;
          if (idTv > 0) {
            localStorage.setItem('ID_TV', String(idTv));
            onQr(idTv);
          }
          break;
        }

        case 'Torneo': {
            const raw = typeof msg.Datos === 'string' ? JSON.parse(msg.Datos) : msg.Datos;

            console.log('TORNEO RAW DEBUG', { /* ... */ });

            // hora del server
            const serverNowMs = new Date(String(raw.Hora ?? new Date().toISOString())).getTime();
            const clientNowMs = Date.now();
            const hDif = serverNowMs - clientNowMs;

            const nivelBackend = Number(raw.Nivel ?? 0);
            let idx = Math.max(0, nivelBackend - 1);

            const estructura = raw.Estructura ?? [];
            let currentItem = estructura[idx];

            let blindsItem = currentItem;
            if (currentItem && currentItem.t === 0) {
                let j = idx + 1;
                while (estructura[j] && estructura[j].t === 0) {
                j++;
                }
                blindsItem = estructura[j] ?? currentItem;
                idx = j;
            }

            const est = blindsItem;
            const nextEst = estructura[idx + 1];

            const segNivel = Number(raw.SegNivel ?? 0);
            const horaEstadoMs = new Date(
                String(raw.HoraEstado ?? new Date().toISOString())
            ).getTime();

            const nivelVisible =
                est && est.n && est.n !== '-' ? Number(est.n) : nivelBackend;

            const datEst = {
                Nivel: nivelVisible,
                Estado: Number(raw.Estado ?? 0),
                HoraEstado: String(raw.HoraEstado ?? new Date().toISOString()),
                SegNivel: segNivel,
            };

            const payload = mapEstadoFromLegacy(datEst);

            onEstado((prev) => {
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
                    playersTotal: 0,
                    playersRemaining: 0,
                    reentries: 0,
                    addons: 0,
                    avgStack: 0,
                    nextBreakSeconds: 0,
                    endRegisterSeconds: 0,
                    endRebuySeconds: 0,
                    endAddonSeconds: 0,
                };

                // 👇 calcula aquí los nuevos tiempos
                const endRegisterSeconds =
                    Number(raw.RegNivel ?? 0) > 0
                    ? calcEndByNivel(
                        estructura,
                        idx,
                        Number(raw.RegNivel),
                        horaEstadoMs,
                        segNivel
                        )
                    : 0;

                const endRebuySeconds =
                    Number(raw.RecNivel ?? 0) > 0
                    ? calcEndByNivel(
                        estructura,
                        idx,
                        Number(raw.RecNivel),
                        horaEstadoMs,
                        segNivel
                        )
                    : 0;

                const endAddonSeconds =
                    Number(raw.AddNivel ?? 0) > 0
                    ? calcEndByNivel(
                        estructura,
                        idx,
                        Number(raw.AddNivel),
                        horaEstadoMs,
                        segNivel
                        )
                    : 0;

                const nextBreakSeconds = calcNextBreakSeconds(
                    estructura,
                    idx,
                    horaEstadoMs,
                    segNivel
                );

                const nuevo: TournamentState = {
                    ...base,
                    ...payload,
                    level: nivelVisible,
                    sb: est?.s ?? base.sb,
                    bb: est?.b ?? base.bb,
                    ante: est?.a ?? base.ante,
                    levelMinutes: est?.m ?? base.levelMinutes,
                    estado: datEst.Estado,
                    horaEstadoMs,
                    segNivel,
                    hDifMs: hDif,
                    nextLevelSb: nextEst?.s ?? base.nextLevelSb,
                    nextLevelBb: nextEst?.b ?? base.nextLevelBb,
                    nextLevelAnte: nextEst?.a ?? base.nextLevelAnte,
                    playersTotal: raw.Cantidades?.Jugadores ?? base.playersTotal,
                    playersRemaining: raw.Cantidades?.Quedan ?? base.playersRemaining,
                    reentries: raw.Cantidades?.Reentradas ?? base.reentries,
                    addons: raw.Cantidades?.Adiciones ?? base.addons,
                    avgStack:
                    raw.Cantidades?.Fichas && raw.Cantidades?.Quedan
                        ? Math.round(raw.Cantidades.Fichas / raw.Cantidades.Quedan)
                        : base.avgStack,
                    nextBreakSeconds,
                    endRegisterSeconds,
                    endRebuySeconds,
                    endAddonSeconds,
                };

                return nuevo;
                });

            onQr(-1);
            break;
            }
      }
    } catch (e) {
      console.error('WS parse error', e);
    }
  };

  ws.onclose = () => {
    console.log('TV socket closed');
  };

  return ws;
}
