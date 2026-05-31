import { Injectable, computed, signal, inject, effect } from '@angular/core';
import { TajamarApiService } from './tajamar-api.service';
import { AuthSessionService } from '../auth/auth-session.service';
import { forkJoin, lastValueFrom } from 'rxjs';
import { AttendanceIncidentModel, AttendanceType as IncidentType } from '../../shared/models/attendance-incident.model';
import { environment } from '../../../environments/environment';

export type AttendanceMark = 'presente' | 'falta' | 'retraso' | 'salida';

export const attendanceMarkLabels: Record<AttendanceMark, string> = {
  presente: 'Presente',
  falta: 'Falta',
  retraso: 'Retraso',
  salida: 'Salida de antes'
};

export const attendanceTypeForMark: Record<Exclude<AttendanceMark, 'presente'>, IncidentType> = {
  falta: 'Falta',
  retraso: 'Retraso',
  salida: 'Salida de antes'
};

export interface StudentIncident {
  id: number;
  fecha: string;
  tipo: IncidentType;
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
    const roleId = this.auth.getRoleId();

    if (roleId === 3) {
      this.loadAdminData();
    } else if (roleId === 1) {
      this.loadTeacherData();
    } else if (roleId === 2) {
      this.loadStudentData();
    } else {
      this.teacherCoursesSignal.set([]);
      this.studentProfilesSignal.set(new Map());
    }
  }

  private loadAdminData() {
    forkJoin({
      users: this.api.getUsers(),
      courses: this.api.getCourses(),
      cursosUsuarios: this.api.getCursosUsuarios()
    }).subscribe({
      next: ({ users, courses, cursosUsuarios }) => {
        const teacherCoursesList: TeacherCourse[] = [];
        const newStudentProfiles = new Map<string, StudentDashboardData>();

        for (const course of courses) {
          const mapping = cursosUsuarios.filter((cu: any) => cu.idCurso === course.idcurso);
          const studentIds = mapping.map((m: any) => m.idUsuario);
          const courseUsers = users.filter((u: any) => studentIds.includes(u.id));

          const teacher = courseUsers.find((u: any) => u.idrole === 1);
          const students = courseUsers.filter((u: any) => u.idrole === 2);

          const teacherCourse: TeacherCourse = {
            id: course.idcurso,
            nombre: course.nombre,
            grupo: 'Grupo Único',
            aula: `Aula ${course.idcurso}`,
            horario: 'Lunes a Viernes',
            profesor: teacher ? teacher.email : 'Sin asignar',
            alumnos: students.map((s: any) => ({
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
        if (courses.some((c: any) => c.idcurso === 3430)) {
          this.activeCourseId.set(3430);
        }
      },
      error: (err) => console.error('Error loading API data', err)
    });
  }

  private loadTeacherData() {
    this.api.getTeacherCourses().subscribe({
      next: (courses) => {
        if (!courses || !courses.length) {
          this.teacherCoursesSignal.set([]);
          return;
        }

        // For each course, try to fetch students (use lastValueFrom with safe fallback)
        const studentCalls = courses.map(async (course: any) => {
          try {
            const students = (await lastValueFrom(this.api.getCourseStudents(course.idcurso ?? course.id))) || [];
            return { course, students };
          } catch {
            return { course, students: [] };
          }
        });

        Promise.all(studentCalls).then((results) => {
          const teacherCoursesList: TeacherCourse[] = results.map(({ course, students }: any) => ({
            id: course.idcurso ?? course.id,
            nombre: course.nombre,
            grupo: 'Grupo Único',
            aula: `Aula ${course.idcurso ?? course.id}`,
            horario: 'Lunes a Viernes',
            profesor: course.profesor ?? 'Profesor',
            alumnos: (students || []).map((s: any) => ({ id: s.id, nombre: `${s.nombre} ${s.apellidos}`, email: s.email, estado: 'presente' })),
            historial: []
          }));

          this.teacherCoursesSignal.set(teacherCoursesList);
          this.activeCourseId.set(teacherCoursesList.length ? teacherCoursesList[0].id : this.activeCourseId());
        });
      },
      error: (err) => {
        console.error('Error loading teacher courses', err);
        if (!environment.production) {
          // Fallback demo course for local development when backend rejects the token
          const demoCourse: TeacherCourse = {
            id: 1,
            nombre: 'Curso Demo',
            grupo: 'Grupo Demo',
            aula: 'Aula 1',
            horario: 'Lunes a Viernes',
            profesor: 'Profesor Demo',
            alumnos: [
              { id: 101, nombre: 'Alumno Uno', email: 'alumno1@tajamar365.com', estado: 'presente' },
              { id: 102, nombre: 'Alumno Dos', email: 'alumno2@tajamar365.com', estado: 'presente' }
            ],
            historial: []
          };
          this.teacherCoursesSignal.set([demoCourse]);
          this.activeCourseId.set(demoCourse.id);
        } else {
          this.teacherCoursesSignal.set([]);
        }
      }
    });
  }

  private loadStudentData() {
    // Student-specific data is derived on demand from the studentProfilesSignal; keep default behavior
    this.studentProfilesSignal.set(new Map());
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
           if (incident.tipo === 'Falta') profile.summary.faltas++;
           else if (incident.tipo === 'Retraso') profile.summary.retrasos++;
           else if (incident.tipo === 'Salida de antes') profile.summary.salidas++;
           profile.summary.noJustificadas++;
           currentProfiles.set(email, profile);
         }
      }
    });
    this.studentProfilesSignal.set(currentProfiles);

    // If a token exists, attempt to persist incidents to backend
    const token = this.auth.getToken();
    if (token) {
      try {
        const payload = newIncidents.map((inc) => ({
          id: inc.id,
          idUsuario: inc.idAlumno ?? 0,
          idCurso: currentCourse.id,
          fechaIncidencia: inc.fecha,
          tipoFalta: (inc.tipo === 'Falta' ? 'Falta' : inc.tipo === 'Retraso' ? 'Retraso' : 'Salida de antes') as AttendanceIncidentModel['tipoFalta'],
          esJustificada: inc.justificada,
          comentario: inc.comentario ?? null
        }));

        this.api.postIncidents(payload).subscribe({
          next: () => console.log('Incidencias guardadas en backend'),
          error: (err) => console.error('Error guardando incidencias en backend', err)
        });
      } catch (err) {
        console.error('Error preparando incidencias para el backend', err);
      }
    }

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