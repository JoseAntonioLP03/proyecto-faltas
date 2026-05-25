export type AttendanceType = 'Falta' | 'Retraso' | 'Salida de antes';

export interface AttendanceIncidentModel {
  id: number;
  idUsuario: number;
  idCurso: number;
  fechaIncidencia: string;
  tipoFalta: AttendanceType;
  esJustificada: boolean;
  comentario?: string | null;
}