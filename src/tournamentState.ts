// src/tournamentState.ts

export type TournamentState = {
  level: number;
  sb: number;
  bb: number;
  ante: number;
  levelMinutes: number;
  estado: number;
  horaEstadoMs: number;
  segNivel: number;
  hDifMs: number;
  nextLevelSb: number;
  nextLevelBb: number;
  nextLevelAnte: number;
  playersTotal: number;
  playersRemaining: number;
  reentries: number;
  addons: number;
  avgStack: number;
  nextBreakSeconds: number;
  endRegisterSeconds: number;
  endRebuySeconds: number;
  endAddonSeconds: number;
};


export function calcLegacyTimeLeft(
  t: TournamentState,
  ahoraMs: number
): number {
  const totalSeconds = t.levelMinutes * 60;

  const dHoy = ahoraMs;

  const offset = Math.floor((t.horaEstadoMs - dHoy) / 1000);
  const tfalta = totalSeconds - t.segNivel + offset;

  return tfalta > 0 ? tfalta : 0;
}

export function recalcTimeLeftFromEstado(t: TournamentState): number {
  const totalSeconds = t.levelMinutes * 60;
  const dHoy = Date.now() + (t.hDifMs ?? 0);
  const offset = Math.floor((t.horaEstadoMs - dHoy) / 1000);
  const tfalta = totalSeconds - t.segNivel + offset;

  console.log('DEBUG RECALC', {
    totalSeconds,
    dHoy,
    horaEstadoMs: t.horaEstadoMs,
    hDifMs: t.hDifMs,
    offset,
    tfalta,
  });

  return tfalta > 0 ? tfalta : 0;
}

export type EstadoPayload = {
  Nivel: number;
  Estado: number;
  HoraEstado: string;
  SegNivel: number;
};

export function applyEstado(prev: TournamentState, dat: EstadoPayload): TournamentState {
  const hora = new Date(dat.HoraEstado).getTime();

  const nuevo: TournamentState = {
    ...prev,
    level: dat.Nivel,
    estado: dat.Estado,
    horaEstadoMs: hora,
    segNivel: dat.SegNivel,
  };

  return nuevo;
}
