# Research Notes: Control de Asistencia Tajamar

## 1. Hybrid Architecture

- **Decision**: Use the external API as the source of truth for authentication, roles, users, and courses, but mirror users and courses locally in SQL Server so `Faltas` can reference them with foreign keys.
- **Rationale**: A pure API-only approach would make the local attendance table depend on live joins to an external system and would weaken referential integrity. A full local replica of everything would add unnecessary sync complexity. Mirrored catalogs provide the smallest reliable boundary for local attendance persistence.
- **Alternatives considered**:
  - Live API lookups only, rejected because local `Faltas` needs durable FKs and the app should not fail its core data model when the external API is slow.
  - Full local ownership of users and courses, rejected because it would duplicate the API of record and increase divergence risk.

## 2. JWT Storage in Angular

- **Decision**: Store the JWT in memory for the active session and mirror it into `sessionStorage` only for tab refresh resilience. Never use `localStorage` for this token.
- **Rationale**: `sessionStorage` reduces persistence exposure compared with `localStorage`, and keeping the live token in memory limits accidental reuse. The interceptor can hydrate from `sessionStorage` after reload and clear both stores on logout or 401.
- **Alternatives considered**:
  - `localStorage`, rejected because it keeps the token available longer than necessary and increases XSS impact.
  - Cookie-only storage, rejected as the external API contract does not currently define an HttpOnly cookie flow.

## 3. Role Enforcement Strategy

- **Decision**: Use the JWT `idrole` claim to drive Angular route guards and view gating.
- **Rationale**: The API already returns the role identifier, and the business rules define a strict mapping of `1=Profesor`, `2=Alumno`, `3=Administrador`. This makes route protection deterministic and easy to test.
- **Alternatives considered**:
  - Separate role lookup requests after login, rejected because the JWT already contains the necessary role information.

## 4. Local Schema for `Faltas`

- **Decision**: Model `Faltas` as a SQL Server table with a surrogate identity key, `EsJustificada` as `BIT`, a `CHECK` constraint on the type field, and foreign keys to the mirrored user and course tables.
- **Rationale**: This gives the simplest schema that still enforces the business rules and allows the administrator to update justification status safely.
- **Alternatives considered**:
  - Enforcing type values only in frontend validation, rejected because the database also needs to protect integrity.
  - Storing attendance in the client, rejected because the feature requires persistent shared records.