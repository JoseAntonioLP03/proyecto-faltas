import { Injectable, computed, signal, inject, effect } from '@angular/core';
import { TajamarApiService } from './tajamar-api.service';
import { AuthSessionService } from '../auth/auth-session.service';
import { forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';

export type AttendanceType = 'Falta de asistencia' | 'Retraso' | 'Salida anticipada';
export type AttendanceMark = 'presente' | 'falta' | 'retraso' | 'salida';

export const attendanceMarkLabels: Record<AttendanceMark, string> = {
  presente: 'Presente',
  falta: 'Falta',
  retraso: 'Retraso',
  salida: 'Salida anticipada'
};

export const attendanceTypeForMark: Record<Exclude<AttendanceMark, 'presente'>, AttendanceType> = {
  falta: 'Falta de asistencia',
  retraso: 'Retraso',
  salida: 'Salida anticipada'
};

export interface StudentIncident {
  id: number;
  fecha: string;
  tipo: AttendanceType;
  justificada: boolean;
  comentario: string;
  idAlumno?: number;
}

export interface StudentTrendPoint {
  label: string;
  value: number;
}

export interface StudentSummary {
  total: number;
  faltas: number;
  retrasos: number;
  salidas: number;
  justificadas: number;
  noJustificadas: number;
  asistencia: number;
}

export interface StudentDashboardData {
  nombre: string;
  email: string;
  grupo: string;
  curso: string;
  tutor: string;
  avatar: string;
  summary: StudentSummary;
  tendencia: StudentTrendPoint[];
  incidencias: StudentIncident[];
  insights: string[];
}

export interface TeacherRosterStudent {
  id: number;
  nombre: string;
  email: string;
  estado: AttendanceMark;
  comentario?: string;
}

export interface TeacherCourse {
  id: number;
  nombre: string;
  grupo: string;
  aula: string;
  horario: string;
  profesor: string;
  alumnos: TeacherRosterStudent[];
  historial: StudentIncident[];
}

export interface AdminSnapshot {
  totalEstudiantes: number;
  totalProfesores: number;
  totalCursos: number;
  justificacionesPendientes: number;
  ultimaSincronizacion: string;
}

@Injectable({ providedIn: 'root' })
export class DemoAttendanceService {
  private readonly api = inject(TajamarApiService);
  private readonly auth = inject(AuthSessionService);
  
  private nextIncidentId = 5000;
  readonly activeCourseId = signal<number>(3430);

  private readonly studentProfilesSignal = signal<Map<string, StudentDashboardData>>(new Map());
  private readonly teacherCoursesSignal = signal<TeacherCourse[]>([]);

  readonly teacherCourses = computed(() => this.teacherCoursesSignal());
  readonly activeTeacherCourse = computed(() => this.teacherCourses().find((course) => course.id === this.activeCourseId()) ?? this.teacherCourses()[0]);

  private readonly genericStudentProfile: StudentDashboardData = {
    nombre: 'Alumno Tajamar',
    email: 'alumno@tajamar365.com',
    grupo: 'Grupo Único',
    curso: 'Cargando...',
    tutor: 'Cargando...',
    avatar: 'AT',
    summary: { total: 0, faltas: 0, retrasos: 0, salidas: 0, justificadas: 0, noJustificadas: 0, asistencia: 100 },
    tendencia: [],
    incidencias: [],
    insights: []
  };

  constructor() {
    effect(() => {
      if (this.auth.isAuthenticated()) {
        this.loadRealData();
      } else {
        this.studentProfilesSignal.set(new Map());
        this.teacherCoursesSignal.set([]);
      }
    });

    this.studentProfilesSignal.set(new Map());
  }

  private loadRealData() {
    this.api.login({ userName: 'admin@tajamar365.com', password: '12345' }).subscribe({
      next: (adminSession) => {
        const adminToken = adminSession.response;
        const headers = { 'Authorization': `Bearer ${adminToken}` };
        
        forkJoin({
          // Make direct HTTP calls overriding the interceptor with the admin token
          users: this.api['http'].get<any[]>(`${environment.apiBaseUrl}${environment.usersEndpoint}`, { headers }),
          courses: this.api['http'].get<any[]>(`${environment.apiBaseUrl}${environment.coursesEndpoint}`, { headers }),
          cursosUsuarios: this.api['http'].get<any[]>(`${environment.apiBaseUrl}/api/CursosUsuarios`, { headers })
        }).subscribe({
          next: ({ users, courses, cursosUsuarios }) => {
            const teacherCoursesList: TeacherCourse[] = [];
            const newStudentProfiles = new Map<string, StudentDashboardData>();

        for (const course of courses) {
          const mapping = cursosUsuarios.filter(cu => cu.idCurso === course.idcurso);
          const studentIds = mapping.map(m => m.idUsuario);
          const courseUsers = users.filter(u => studentIds.includes(u.id));

          const teacher = courseUsers.find(u => u.idrole === 1);
          const students = courseUsers.filter(u => u.idrole === 2);

          const teacherCourse: TeacherCourse = {
            id: course.idcurso,
            nombre: course.nombre,
            grupo: 'Grupo Único',
            aula: `Aula ${course.idcurso}`,
            horario: 'Lunes a Viernes',
            profesor: teacher ? teacher.email : 'Sin asignar',
            alumnos: students.map(s => ({
              id: s.id,
              nombre: `${s.nombre} ${s.apellidos}`,
              email: s.email,
              estado: 'presente'
            })),
            historial: [] 
          };
          teacherCoursesList.push(teacherCourse);

          for (const s of students) {
             const char1 = s.nombre ? s.nombre.charAt(0) : 'A';
             const char2 = s.apellidos ? s.apellidos.charAt(0) : 'T';
             const profile: StudentDashboardData = {
               nombre: `${s.nombre} ${s.apellidos}`,
               email: s.email,
               grupo: 'Grupo Único',
               curso: course.nombre,
               tutor: teacher ? `${teacher.nombre} ${teacher.apellidos}` : 'Sin asignar',
               avatar: (char1 + char2).toUpperCase(),
               summary: { total: 0, faltas: 0, retrasos: 0, salidas: 0, justificadas: 0, noJustificadas: 0, asistencia: 100 },
               tendencia: [],
               incidencias: [],
               insights: ['Asistencia perfecta.', 'Buen comienzo de curso.']
             };
             newStudentProfiles.set(s.email.trim().toLowerCase(), profile);
          }
        }
        
        this.teacherCoursesSignal.set(teacherCoursesList);
        this.studentProfilesSignal.set(newStudentProfiles);
        
        // set active default
        this.activeCourseId.set(courses.length > 0 ? courses[0].idcurso : 1);
        if (courses.some(c => c.idcurso === 3430)) {
           this.activeCourseId.set(3430);
        }
      },
      error: (err) => console.error("Error loading API data", err)
    });
    }, error: (err) => console.error("Error authenticating admin", err)
  });
  }

  getStudentDashboard(userName?: string | null): StudentDashboardData {
    const normalizedUserName = (userName ?? '').trim().toLowerCase();
    const profile = this.studentProfilesSignal().get(normalizedUserName) ?? this.genericStudentProfile;
    return this.cloneStudentProfile(profile);
  }

  getAdminSnapshot(): AdminSnapshot {
    const allCourses = this.teacherCourses();
    const totalEstudiantes = allCourses.reduce((acc, course) => acc + course.alumnos.length, 0);
    const justPend = allCourses.reduce((acc, course) => {
      const coursePending = course.alumnos.filter((student) => student.estado !== 'presente').length;
      return acc + coursePending + course.historial.filter((inc) => !inc.justificada).length;
    }, 0);

    return {
      totalEstudiantes,
      totalProfesores: 4,
      totalCursos: allCourses.length,
      justificacionesPendientes: justPend,
      ultimaSincronizacion: new Date().toLocaleString('es-ES', {
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
      })
    };
  }

  getPendingJustifications() {
    return this.teacherCourses().flatMap((course) =>
      course.historial.filter((inc) => !inc.justificada).map((inc) => ({
          course: course.nombre,
          grupo: course.grupo,
          fecha: inc.fecha,
          tipo: inc.tipo,
          comentario: inc.comentario
        }))
    );
  }

  setActiveCourse(courseId: number): void {
    this.activeCourseId.set(courseId);
  }

  setStudentState(studentId: number, estado: AttendanceMark): void {
    this.teacherCoursesSignal.update((courses) =>
      courses.map((course) => ({
        ...course,
        alumnos: course.alumnos.map((student) =>
          student.id === studentId
            ? { ...student, estado, comentario: estado === 'presente' ? undefined : student.comentario ?? `Marcar como ${attendanceMarkLabels[estado].toLowerCase()}` }
            : student
        )
      }))
    );
  }

  setAllStudents(estado: AttendanceMark): void {
    const currentCourse = this.activeTeacherCourse();
    if (!currentCourse) return;

    this.teacherCoursesSignal.update((courses) =>
      courses.map((course) =>
        course.id === currentCourse.id
          ? {
              ...course,
              alumnos: course.alumnos.map((student) => ({
                ...student, estado, comentario: estado === 'presente' ? undefined : `Marcado en bloque como ${attendanceMarkLabels[estado].toLowerCase()}`
              }))
            }
          : course
      )
    );
  }

  commitActiveCourse(): number {
    const currentCourse = this.activeTeacherCourse();
    if (!currentCourse) return 0;

    const pendingStudents = currentCourse.alumnos.filter((student) => student.estado !== 'presente');
    if (!pendingStudents.length) return 0;

    const newIncidents = pendingStudents.map((student) => ({
      id: this.nextIncidentId++,
      fecha: new Date().toISOString(),
      tipo: attendanceTypeForMark[student.estado as Exclude<AttendanceMark, 'presente'>],
      justificada: false,
      comentario: student.comentario ?? 'Registro generado por pase de lista',
      idAlumno: student.id 
    } satisfies StudentIncident));

    this.teacherCoursesSignal.update((courses) =>
      courses.map((course) =>
        course.id === currentCourse.id
          ? {
              ...course,
              historial: [...newIncidents, ...course.historial],
              alumnos: course.alumnos.map((student) => ({
                ...student, estado: 'presente', comentario: undefined
              }))
            }
          : course
      )
    );
    
    // Update student profiles with new incidents
    const currentProfiles = new Map(this.studentProfilesSignal());
    pendingStudents.forEach(student => {
      const email = student.email.trim().toLowerCase();
      const profileInfo = currentProfiles.get(email);
      if (profileInfo) {
         const profile = this.cloneStudentProfile(profileInfo);
         const incident = newIncidents.find(i => i.idAlumno === student.id);
         if (incident) {
           profile.incidencias.push(incident);
           profile.summary.total++;
           profile.summary.asistencia = Math.max(0, profile.summary.asistencia - 1);
           if (incident.tipo === 'Falta de asistencia') profile.summary.faltas++;
           else if (incident.tipo === 'Retraso') profile.summary.retrasos++;
           else if (incident.tipo === 'Salida anticipada') profile.summary.salidas++;
           profile.summary.noJustificadas++;
           currentProfiles.set(email, profile);
         }
      }
    });
    this.studentProfilesSignal.set(currentProfiles);

    return newIncidents.length;
  }

  getActiveCourseStats() {
    const course = this.activeTeacherCourse();
    if (!course) {
      return { total: 0, presentes: 0, faltas: 0, retrasos: 0, salidas: 0 };
    }
    return {
      total: course.alumnos.length,
      presentes: course.alumnos.filter((s) => s.estado === 'presente').length,
      faltas: course.alumnos.filter((s) => s.estado === 'falta').length,
      retrasos: course.alumnos.filter((s) => s.estado === 'retraso').length,
      salidas: course.alumnos.filter((s) => s.estado === 'salida').length
    };
  }

  private cloneStudentProfile(profile: StudentDashboardData): StudentDashboardData {
    return {
      ...profile,
      summary: { ...profile.summary },
      tendencia: profile.tendencia.map((point) => ({ ...point })),
      incidencias: profile.incidencias.map((incident) => ({ ...incident })),
      insights: [...profile.insights]
    };
  }
}