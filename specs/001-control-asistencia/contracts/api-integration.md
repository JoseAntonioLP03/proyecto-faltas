# API Integration Contract

## External API

- **Base URL**: https://apicharlasalumnostajamartesting.azurewebsites.net/index.html
- **Auth Method**: `auth` endpoint returns a JWT token.
- **Required Rule**: Every subsequent request for users or courses must include the JWT in the `Authorization` header.

## Token Handling

- Decode the JWT client-side to read `idrole`.
- Keep the live token in memory and mirror it to `sessionStorage` for reload resilience.
- Clear the token on logout and on unauthorized responses.

## Mapped API Fields

- **Roles**: `IdRole`, `rolename` with fixed mapping `1=Profesor`, `2=Alumno`, `3=Administrador`.
- **Usuarios**: `Id`, `Nombre`, `Apellidos`, `email`, `estadoUsuario`, `imagen`, `password`, `idrole`.
- **Cursos**: `Idcurso`, `Nombre`, `Duración`, `Activo`.

## Usage Notes

- The frontend must never infer permissions from labels alone; it must rely on `idrole`.
- The local attendance data layer should persist only the fields needed to bind incidents to users and courses.