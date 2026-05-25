# Frontend Permission Contract

## Role Mapping

- `1` = Profesor
- `2` = Alumno
- `3` = Administrador

## Route Protection

- Use Angular route guards to block unauthenticated access.
- Use role-based guard metadata to restrict each route to the matching `idrole` values.
- Hide menu items and dashboard actions that the current role cannot use, but keep the guard as the real enforcement point.

## Required Client Behavior

- On login, store the JWT and decode `idrole` immediately.
- On app refresh, restore session state from `sessionStorage` if the token is still valid.
- On `401` or logout, clear the token and redirect to the login view.

## UX Constraints

- Students must never see teacher or admin controls.
- Teachers must only see assigned courses and attendance actions.
- Administrators must have access to user, course, and justification management.