# Quickstart: Control de Asistencia Tajamar

## Prerequisites

- Node.js and npm installed for the Angular app.
- Access to the external Tajamar API Swagger endpoint.
- SQL Server available to execute the local schema script.

## Local Setup

1. Open the Angular project at `proyecto-faltas/`.
2. Install dependencies with `npm install`.
3. Configure the API base URL and auth endpoints in the Angular environment files when they are added.
4. Execute `specs/001-control-asistencia/contracts/sql-server-schema.sql` in SQL Server to create the mirror catalogs and the local `Faltas` table.
5. Start the frontend with `npm start`.

## Login Flow

1. Authenticate against the external API `auth` endpoint.
2. Store the returned JWT in memory and `sessionStorage`.
3. Let the Angular interceptor attach `Authorization: Bearer <token>` to subsequent calls.
4. Use the decoded `idrole` to route the user to the student, teacher, or admin dashboard.

## Validation Checklist

- Confirm a student only sees their own incidents.
- Confirm a teacher only sees assigned courses and can create attendance incidents.
- Confirm an administrator can justify incidents and manage catalog data.