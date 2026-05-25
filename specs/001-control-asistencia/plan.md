# Implementation Plan: Control de Asistencia Tajamar

**Branch**: `[001-control-asistencia]` | **Date**: 2026-05-25 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-control-asistencia/spec.md`

## Summary

Build a role-based attendance control web platform for Tajamar with an Angular 19 SPA, JWT-based authentication against the external API, and a local SQL Server data layer for attendance incidents. Users and courses are synchronized from the API into local mirror tables so the local `Faltas` table can enforce foreign keys, while the frontend protects routes and views with `idrole` from the JWT payload.

## Technical Context

**Language/Version**: TypeScript 5.7 with Angular 19.1.x on the frontend; SQL Server T-SQL for the local database contract

**Primary Dependencies**: Angular Router, HttpClient, Forms, RxJS, route guards, HTTP interceptors, the external Tajamar Swagger API, SQL Server

**Storage**: SQL Server for local attendance data and mirrored catalog data; sessionStorage plus in-memory auth state for the JWT; no localStorage for tokens

**Testing**: Jasmine/Karma for Angular unit tests; SQL script execution validation in SQL Server; later integration tests for auth, guards, and attendance workflows

**Target Platform**: Modern desktop and mobile web browsers, with SQL Server as the persistence target for local attendance data

**Project Type**: Web application with a single Angular frontend and a backend/data contract that persists attendance locally

**Performance Goals**: Login redirect and guard evaluation should feel immediate; attendance list and save operations should complete in under 2 seconds on a normal school network

**Constraints**: External API is the source of truth for auth, roles, users, and courses; JWT is mandatory for subsequent API calls; role mapping is fixed at 1=Profesor, 2=Alumno, 3=Administrador; the local database must preserve referential integrity for `Faltas`

**Scale/Scope**: One academic center, a few hundred active users, multiple courses and daily attendance incidents, with room to grow to several school years of historical records

## Constitution Check

The repository constitution file currently contains only placeholders and no active project-specific principles, so there are no concrete governance violations to resolve at this stage. The plan still preserves the expected quality properties: separation of concerns, testability, and minimal scope expansion.

## Project Structure

### Documentation (this feature)

```text
specs/001-control-asistencia/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── api-integration.md
│   ├── frontend-permissions.md
│   └── sql-server-schema.sql
└── tasks.md             # Phase 2 output (created later)
```

### Source Code (repository root)

```text
proyecto-faltas/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── auth/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   └── services/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── student/
│   │   │   ├── teacher/
│   │   │   └── admin/
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   └── models/
│   │   ├── app.config.ts
│   │   ├── app.routes.ts
│   │   └── app.component.*
│   ├── assets/
│   └── environments/
└── specs/001-control-asistencia/contracts/
```

**Structure Decision**: Keep the current Angular application in `proyecto-faltas/src` as the user-facing frontend and add feature-oriented slices under `src/app/core`, `src/app/features`, and `src/app/shared`. Use the feature `contracts/` folder for the API/auth contract and the SQL Server schema that the eventual data layer or backend service will execute.

## Implementation Approach

1. Use the external API for login, role resolution, and master data retrieval.
2. Decode the JWT in Angular, cache the token in memory with `sessionStorage` fallback, and attach it to every authenticated API call through an interceptor.
3. Sync users and courses into local mirror tables so `Faltas` can enforce foreign keys without depending on live API joins.
4. Build Angular route guards around `idrole` so the UI only exposes the student, teacher, or admin areas allowed for that session.
5. Keep the local `Faltas` table as the only write-heavy domain table in the first implementation, with `EsJustificada` defaulting to false.

## Complexity Tracking

No constitution violations require justification at this stage.