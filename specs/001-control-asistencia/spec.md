# Feature Specification: Sistema de Control de Asistencia Tajamar

**Feature Branch**: `[001-control-asistencia]`

**Created**: 2026-05-25

**Status**: Draft

**Input**: User description: "Especificación de Producto: Sistema de Control de Asistencia Tajamar"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Acceso seguro y redirección por rol (Priority: P1)

Como usuario del sistema, quiero iniciar sesión de forma segura y acceder directamente al panel que corresponde a mi rol, para llegar rápido a la información y acciones que tengo permitidas.

**Why this priority**: Sin autenticación y separación por rol no existe un uso seguro del sistema ni valor operativo para ningún tipo de usuario.

**Independent Test**: Se puede verificar iniciando sesión con credenciales válidas de cada rol y confirmando que cada cuenta aterriza en su panel correcto sin ver opciones ajenas.

**Acceptance Scenarios**:

1. **Given** una cuenta de alumno válida, **When** inicia sesión, **Then** accede a su panel de alumno y no puede entrar a vistas de profesor o administrador.
2. **Given** una cuenta de profesor válida, **When** inicia sesión, **Then** accede a su panel de profesor y no puede ver funciones de administración global.
3. **Given** una cuenta de administrador válida, **When** inicia sesión, **Then** accede a su panel de administrador con acceso a gestión global.

---

### User Story 2 - Consulta personal del alumno (Priority: P2)

Como alumno, quiero consultar mi historial personal de incidencias de asistencia para entender mi situación y revisar cada registro con su estado de justificación.

**Why this priority**: La consulta individual es el principal valor para el estudiante y debe estar protegida por restricción estricta de acceso.

**Independent Test**: Se puede comprobar con una cuenta de alumno que solo ve sus propios registros, cada uno con fecha y hora, tipo de evento y estado de justificación.

**Acceptance Scenarios**:

1. **Given** un alumno autenticado, **When** abre su historial, **Then** solo ve sus propias incidencias.
2. **Given** un alumno autenticado, **When** revisa un registro, **Then** el sistema muestra fecha y hora, tipo de evento y estado de justificación.
3. **Given** un alumno autenticado, **When** intenta acceder a incidencias de otro alumno, **Then** el sistema le impide ver esa información.

---

### User Story 3 - Pase de lista del profesor (Priority: P3)

Como profesor, quiero ver mis grupos asignados y registrar la asistencia diaria de forma individual o masiva, para dejar constancia de faltas, retrasos y salidas anticipadas en una fecha concreta.

**Why this priority**: Es la función operativa principal del profesorado y alimenta los registros que luego consultan alumnos y administradores.

**Independent Test**: Se puede validar con un grupo asignado, marcando incidencias para una fecha concreta y comprobando que quedan registradas en el historial del grupo.

**Acceptance Scenarios**:

1. **Given** un profesor autenticado, **When** abre su panel, **Then** ve solo los cursos o asignaturas que tiene asignados.
2. **Given** un profesor con un grupo asignado, **When** pasa lista para una fecha concreta, **Then** puede marcar incidencias de forma individual o masiva para varios alumnos.
3. **Given** un profesor registra una falta, un retraso o una salida anticipada, **When** guarda el pase de lista, **Then** la incidencia queda registrada como no justificada por defecto.

---

### User Story 4 - Gestión global del administrador (Priority: P4)

Como administrador, quiero gestionar usuarios, cursos, asignaturas y justificantes, para mantener el sistema organizado y corregir el estado de incidencias cuando exista documentación válida.

**Why this priority**: La administración central asegura la calidad de los datos y permite resolver justificantes sin romper las restricciones de los demás roles.

**Independent Test**: Se puede verificar con una cuenta de administrador creando, editando y eliminando usuarios, ajustando cursos o asignaturas y cambiando el estado de incidencias con soporte documental.

**Acceptance Scenarios**:

1. **Given** un administrador autenticado, **When** accede a gestión global, **Then** puede dar de alta, modificar o dar de baja usuarios.
2. **Given** un administrador autenticado, **When** gestiona la estructura académica, **Then** puede crear y modificar cursos y asignaturas.
3. **Given** una incidencia no justificada y documentación válida, **When** el administrador la revisa, **Then** puede cambiar su estado a justificada.

### Edge Cases

- Un alumno intenta acceder a la información de otro alumno y el sistema bloquea el acceso.
- Un profesor intenta registrar asistencia para un grupo que no tiene asignado y el sistema lo impide.
- Un administrador intenta justificar una incidencia que no tiene un registro válido asociado y el sistema no permite cerrar el cambio.
- Una incidencia se registra sin fecha concreta y el sistema debe rechazarla.
- Un mismo alumno recibe varias incidencias en el mismo día y cada una debe conservar su tipo y estado de justificación de forma independiente.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST require authenticated access before showing any role-based panel.
- **FR-002**: The system MUST route each authenticated user to the panel for their assigned role.
- **FR-003**: The system MUST restrict each student to viewing only their own attendance history.
- **FR-004**: The system MUST show each attendance record with date and time, event type, and justification status.
- **FR-005**: The system MUST limit event types to attendance absence, delay, and early departure before the end of the school day.
- **FR-006**: The system MUST allow teachers to view only the courses or subjects assigned to them.
- **FR-007**: The system MUST allow teachers to record attendance for a specific date at both individual and group level.
- **FR-008**: The system MUST create every teacher-recorded absence, delay, or early departure with a default status of not justified.
- **FR-009**: The system MUST allow teachers to review the accumulated attendance incidents for each student in their assigned groups.
- **FR-010**: The system MUST allow administrators to create, edit, and deactivate user accounts for students, teachers, and administrators.
- **FR-011**: The system MUST allow administrators to create and modify courses and subjects.
- **FR-012**: The system MUST allow administrators to change an incident from not justified to justified only after validating supporting documentation.
- **FR-013**: The system MUST prevent non-administrator users from modifying justification status.
- **FR-014**: The system MUST keep students from seeing any attendance information that does not belong to them.
- **FR-015**: The system MUST keep teachers from managing users or academic configuration outside their assigned classroom and subject scope.

### Key Entities *(include if feature involves data)*

- **User**: A person authenticated in the system with one of three roles: student, teacher, or administrator.
- **Attendance Incident**: A record of an absence, delay, or early departure associated with one student, one date and time, an origin user, and a justification status.
- **Course or Subject Assignment**: The academic scope that links teachers to the students they can manage for attendance purposes.
- **Justification**: The supporting validation that allows an administrator to convert a non-justified incident into a justified one.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of valid logins land the user on the correct role panel with no access to unauthorized role actions.
- **SC-002**: At least 95% of students can open their attendance history and locate a specific incident in under 30 seconds.
- **SC-003**: At least 95% of teacher attendance submissions are saved with the default status set to not justified on the first attempt.
- **SC-004**: At least 95% of administrator justification reviews can be completed in under 2 minutes once supporting documentation is available.
- **SC-005**: No student can view another student’s attendance records in successful test runs across all role scenarios.

## Assumptions

- Users already have assigned roles and academic group memberships before first use.
- The system is used through a web browser and is available during the school day.
- Supporting documentation for justifications is provided outside the system process and is available to the administrator for review.
- The first version focuses on attendance management and role-based access rather than grading, messaging, or timetable management.