// src/utils/legacyMappers.ts
import type { EstadoPayload } from '../tournamentState';

export function mapEstadoFromLegacy(dat: any): EstadoPayload {
  return {
    Nivel: Number(dat.Nivel ?? dat.nivel ?? 0),
    Estado: Number(dat.Estado ?? dat.estado ?? 0),
    HoraEstado: String(dat.HoraEstado ?? dat.horaEstado ?? new Date().toISOString()),
    SegNivel: Number(dat.SegNivel ?? dat.segNivel ?? 0),
  };
}
