# Tasks: Control de Asistencia Tajamar

**Input**: Design documents from `/specs/001-control-asistencia/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: No automated test tasks were requested for this feature. The plan relies on manual validation checkpoints and build verification.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the Angular project structure and shared configuration needed by all stories.

- [X] T001 Create the feature folder skeleton in `proyecto-faltas/src/app/core`, `proyecto-faltas/src/app/features`, `proyecto-faltas/src/app/shared`, and `proyecto-faltas/src/environments`
- [X] T002 Add API and auth configuration placeholders in `proyecto-faltas/src/environments/environment.ts` and `proyecto-faltas/src/environments/environment.development.ts`
- [X] T003 [P] Update the root application shell and navigation host in `proyecto-faltas/src/app/app.component.html`, `proyecto-faltas/src/app/app.component.scss`, and `proyecto-faltas/src/styles.scss`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core application services, shared models, and route protection that every user story depends on.

**⚠️ CRITICAL**: No user story work should begin until this phase is complete.

- [X] T004 Define shared auth and session models in `proyecto-faltas/src/app/shared/models/auth.model.ts`
- [X] T005 [P] Define shared API data models for roles, users, courses, and attendance incidents in `proyecto-faltas/src/app/shared/models/role.model.ts`, `proyecto-faltas/src/app/shared/models/user.model.ts`, `proyecto-faltas/src/app/shared/models/course.model.ts`, and `proyecto-faltas/src/app/shared/models/attendance-incident.model.ts`
- [X] T006 [P] Implement the JWT session service with in-memory state and `sessionStorage` fallback in `proyecto-faltas/src/app/core/auth/auth-session.service.ts`
- [X] T007 [P] Implement the HTTP interceptor that injects the JWT into `Authorization` headers in `proyecto-faltas/src/app/core/interceptors/auth.interceptor.ts`
- [X] T008 [P] Implement the role guard helpers that read `idrole` and block unauthorized routes in `proyecto-faltas/src/app/core/guards/role.guard.ts`
- [X] T009 Implement the external API client for auth, users, and courses in `proyecto-faltas/src/app/core/services/tajamar-api.service.ts`
- [X] T010 Wire the application router and bootstrap providers in `proyecto-faltas/src/app/app.routes.ts` and `proyecto-faltas/src/app/app.config.ts`

**Checkpoint**: JWT handling, API access, and route protection are ready for role-specific features.

---

## Phase 3: User Story 1 - Acceso seguro y redirección por rol (Priority: P1) 🎯 MVP

**Goal**: Let each authenticated user sign in and land on the correct dashboard for their role.

**Independent Test**: Sign in with one valid student, teacher, and admin account and confirm each one is routed to the correct dashboard with no access to other roles.

- [X] T011 [P] [US1] Create the login page component and template in `proyecto-faltas/src/app/features/auth/login/login.component.ts`, `proyecto-faltas/src/app/features/auth/login/login.component.html`, and `proyecto-faltas/src/app/features/auth/login/login.component.scss`
- [X] T012 [US1] Implement the login flow that calls the external `auth` endpoint, stores the JWT, decodes `idrole`, and redirects to the correct dashboard in `proyecto-faltas/src/app/features/auth/login/login.component.ts` and `proyecto-faltas/src/app/core/auth/auth-session.service.ts`
- [X] T013 [P] [US1] Create the student, teacher, and admin dashboard shell components in `proyecto-faltas/src/app/features/student/dashboard`, `proyecto-faltas/src/app/features/teacher/dashboard`, and `proyecto-faltas/src/app/features/admin/dashboard`
- [ ] T014 [US1] Add logout and session restoration behavior in `proyecto-faltas/src/app/core/auth/auth-session.service.ts` and `proyecto-faltas/src/app/app.component.ts`
- [X] T015 [US1] Restrict the login, logout, and landing routes to the correct role flow in `proyecto-faltas/src/app/app.routes.ts`

**Checkpoint**: Story 1 should be independently functional as the MVP login and redirection slice.

---

## Phase 4: User Story 2 - Consulta personal del alumno (Priority: P2)

**Goal**: Let students view only their own attendance incidents with date, time, type, and justification state.

**Independent Test**: Sign in as a student and confirm that the history view shows only that student’s incidents and blocks access to any other student data.

- [ ] T016 [P] [US2] Create the student history view model and presenter-friendly incident format in `proyecto-faltas/src/app/shared/models/attendance-incident.model.ts`
- [ ] T017 [US2] Implement the student attendance service that loads only the current student’s incidents in `proyecto-faltas/src/app/features/student/services/student-attendance.service.ts`
- [ ] T018 [P] [US2] Build the student attendance history component, list, and incident detail card in `proyecto-faltas/src/app/features/student/history/student-history.component.ts`, `proyecto-faltas/src/app/features/student/history/student-history.component.html`, and `proyecto-faltas/src/app/features/student/history/student-history.component.scss`
- [ ] T019 [US2] Add the student route entry and guard wiring for the history view in `proyecto-faltas/src/app/app.routes.ts` and `proyecto-faltas/src/app/core/guards/role.guard.ts`
- [ ] T020 [US2] Add student-facing empty state and unauthorized access handling in `proyecto-faltas/src/app/features/student/history/student-history.component.ts` and `proyecto-faltas/src/app/app.component.html`

**Checkpoint**: Students can inspect their own history without seeing any other user’s incidents.

---

## Phase 5: User Story 3 - Pase de lista del profesor (Priority: P3)

**Goal**: Let teachers see their assigned groups and record attendance incidents individually or in bulk.

**Independent Test**: Sign in as a teacher, confirm the assigned courses appear, mark incidents for a date, and verify the saved records default to not justified.

- [ ] T021 [P] [US3] Create the teacher roster, pass-list, and course-history view models in `proyecto-faltas/src/app/shared/models/teacher-attendance.model.ts`
- [ ] T022 [US3] Implement the teacher attendance service for assigned courses, roster loading, and incident submission in `proyecto-faltas/src/app/features/teacher/services/teacher-attendance.service.ts`
- [ ] T023 [P] [US3] Build the pass-list component for bulk and individual marking in `proyecto-faltas/src/app/features/teacher/pass-list/pass-list.component.ts`, `proyecto-faltas/src/app/features/teacher/pass-list/pass-list.component.html`, and `proyecto-faltas/src/app/features/teacher/pass-list/pass-list.component.scss`
- [ ] T024 [US3] Build the teacher course-history component for accumulated incident review in `proyecto-faltas/src/app/features/teacher/history/teacher-history.component.ts`, `proyecto-faltas/src/app/features/teacher/history/teacher-history.component.html`, and `proyecto-faltas/src/app/features/teacher/history/teacher-history.component.scss`
- [ ] T025 [US3] Wire the teacher routes and default justificación behavior into the submission flow in `proyecto-faltas/src/app/app.routes.ts` and `proyecto-faltas/src/app/features/teacher/services/teacher-attendance.service.ts`

**Checkpoint**: Teachers can manage their assigned groups and create local attendance incidents with the correct default state.

---

## Phase 6: User Story 4 - Gestión global del administrador (Priority: P4)

**Goal**: Let administrators manage users, courses, and justification status for incidents.

**Independent Test**: Sign in as an administrator and confirm that user, course, and justification screens are available while non-admin actions remain blocked.

- [ ] T026 [P] [US4] Create the admin user, course, and justification management models in `proyecto-faltas/src/app/shared/models/admin-management.model.ts`
- [ ] T027 [US4] Implement the admin management service for users, courses, and justification updates in `proyecto-faltas/src/app/features/admin/services/admin-management.service.ts`
- [ ] T028 [P] [US4] Build the admin user-management component in `proyecto-faltas/src/app/features/admin/users/admin-users.component.ts`, `proyecto-faltas/src/app/features/admin/users/admin-users.component.html`, and `proyecto-faltas/src/app/features/admin/users/admin-users.component.scss`
- [ ] T029 [P] [US4] Build the admin course-management component in `proyecto-faltas/src/app/features/admin/courses/admin-courses.component.ts`, `proyecto-faltas/src/app/features/admin/courses/admin-courses.component.html`, and `proyecto-faltas/src/app/features/admin/courses/admin-courses.component.scss`
- [ ] T030 [US4] Build the justification review component and update action in `proyecto-faltas/src/app/features/admin/justifications/admin-justifications.component.ts`, `proyecto-faltas/src/app/features/admin/justifications/admin-justifications.component.html`, and `proyecto-faltas/src/app/features/admin/justifications/admin-justifications.component.scss`
- [ ] T031 [US4] Enforce admin-only access in routing, navigation, and mutation paths in `proyecto-faltas/src/app/app.routes.ts`, `proyecto-faltas/src/app/app.component.html`, and `proyecto-faltas/src/app/core/guards/role.guard.ts`

**Checkpoint**: Administrators can manage the system globally without exposing admin actions to lower roles.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency, resilience, and usability improvements across all stories.

- [ ] T032 [P] Harmonize responsive layout, states, and reusable styles in `proyecto-faltas/src/styles.scss` and feature SCSS files under `proyecto-faltas/src/app/features`
- [ ] T033 Harden token expiry handling, 401 recovery, and logout cleanup in `proyecto-faltas/src/app/core/auth/auth-session.service.ts` and `proyecto-faltas/src/app/core/interceptors/auth.interceptor.ts`
- [ ] T034 Review the SQL contract and API contract notes in `specs/001-control-asistencia/contracts/sql-server-schema.sql`, `specs/001-control-asistencia/contracts/api-integration.md`, and `specs/001-control-asistencia/contracts/frontend-permissions.md`
- [ ] T035 Validate the Angular build and the quickstart flow in `proyecto-faltas/package.json` and `specs/001-control-asistencia/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1) has no dependencies and can start immediately.
- Foundational (Phase 2) depends on Setup and blocks all user stories.
- User Stories 1 to 4 depend on Foundational completion and can then be built in priority order.
- Polish depends on the desired stories being complete.

### User Story Dependencies

- User Story 1 (P1) is the MVP slice and has no dependencies on other stories.
- User Story 2 (P2) can start after Foundational and the auth flow from User Story 1.
- User Story 3 (P3) can start after Foundational and the auth flow from User Story 1.
- User Story 4 (P4) can start after Foundational and the auth flow from User Story 1.

### Within Each User Story

- Shared models before services.
- Services before UI composition.
- UI before polish and route tightening.
- Keep each story independently demoable before moving to the next one.

### Parallel Opportunities

- `T003`, `T005`, `T006`, `T007`, `T011`, `T013`, `T016`, `T018`, `T021`, `T023`, `T026`, `T028`, and `T029` can run in parallel where file ownership does not overlap.
- Once the foundational phase is complete, the four user stories can be developed in parallel by different contributors.

## Parallel Example: User Story 1

```bash
Task: "Create the login page component and template in `proyecto-faltas/src/app/features/auth/login/login.component.ts`, `proyecto-faltas/src/app/features/auth/login/login.component.html`, and `proyecto-faltas/src/app/features/auth/login/login.component.scss`"
Task: "Create the student, teacher, and admin dashboard shell components in `proyecto-faltas/src/app/features/student/dashboard`, `proyecto-faltas/src/app/features/teacher/dashboard`, and `proyecto-faltas/src/app/features/admin/dashboard`"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Validate login redirection for student, teacher, and admin accounts.
5. Stop there if the MVP needs to be demoed early.

### Incremental Delivery

1. Finish Setup and Foundational work.
2. Deliver User Story 1 as the authentication MVP.
3. Add User Story 2 for student visibility.
4. Add User Story 3 for teacher attendance entry.
5. Add User Story 4 for administration and justification management.

### Parallel Team Strategy

1. One contributor can own the auth and route foundation.
2. After the foundation, separate contributors can implement the student, teacher, and admin stories in parallel.
3. Finish with a shared polish pass that hardens the token flow and responsive layout.

## Notes

- `[P]` tasks are safe to run in parallel because they touch different files.
- `[USx]` labels map each task back to the user story for traceability.
- The database contract already lives in `specs/001-control-asistencia/contracts/sql-server-schema.sql` and should stay aligned with the front-end data models.