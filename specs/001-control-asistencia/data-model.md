# Data Model: Control de Asistencia Tajamar

## Entities

### RoleMirror

- **Purpose**: Local reference for the fixed API role mapping.
- **Key fields**: `IdRole`, `Rolename`
- **Rules**: `IdRole` is restricted to `1`, `2`, and `3`.

### UserMirror

- **Purpose**: Local mirrored catalog of API users for attendance relationships.
- **Key fields**: `Id`, `Nombre`, `Apellidos`, `Email`, `EstadoUsuario`, `Imagen`, `IdRole`
- **Relationships**: Many `UserMirror` records belong to one `RoleMirror`.
- **Rules**: `Email` should be unique; inactive users remain in the mirror to preserve historical incidents.

### CourseMirror

- **Purpose**: Local mirrored catalog of API courses.
- **Key fields**: `IdCurso`, `Nombre`, `DuracionHoras`, `Activo`
- **Rules**: `DuracionHoras` is a positive integer; inactive courses remain in the mirror for historical reporting.

### AttendanceIncident

- **Purpose**: Local attendance fact table for absences, delays, and early departures.
- **Key fields**: `Id`, `IdUsuario`, `IdCurso`, `FechaIncidencia`, `TipoFalta`, `EsJustificada`, `Comentario`
- **Relationships**: Each incident belongs to one student in `UserMirror` and one course in `CourseMirror`.
- **Rules**:
  - `TipoFalta` accepts only `Falta`, `Retraso`, or `Salida de antes`.
  - `EsJustificada` defaults to `false` when a teacher records the incident.
  - `Comentario` is optional free text.

## State Transitions

### AttendanceIncident

1. **Created**: Teacher records the incident, `EsJustificada = false`.
2. **Justified**: Administrator validates documents and changes `EsJustificada = true`.

## Relationship Summary

- `RoleMirror 1 -> many UserMirror`
- `UserMirror 1 -> many AttendanceIncident`
- `CourseMirror 1 -> many AttendanceIncident`