import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { environment } from '../../../environments/environment';
import { LoginResponse } from '../../shared/models/auth.model';
import { CourseModel } from '../../shared/models/course.model';
import { UserModel } from '../../shared/models/user.model';
import { catchError, of, throwError } from 'rxjs';
import { AttendanceIncidentModel } from '../../shared/models/attendance-incident.model';

// Demo accounts to allow local testing when backend rejects credentials
const DEMO_USERS: Record<string, { idrole: number; role: string }> = {
  'marcos.pedroche@tajamar365.com': { idrole: 2, role: 'student' },
  'profesortest@tajamar365.com': { idrole: 1, role: 'teacher' },
  'admin@tajamar365.com': { idrole: 3, role: 'admin' }
};

@Injectable({ providedIn: 'root' })
export class TajamarApiService {
  private readonly http = inject(HttpClient);

  login(credentials: { userName: string; password: string }) {
    return this.http.post<LoginResponse>(`${environment.apiBaseUrl}${environment.authEndpoint}`, credentials)
      .pipe(
        catchError((err) => {
          // If backend rejects (401) and we're in development, allow demo accounts with a fabricated token
          if (!environment.production && err && err.status === 401) {
            const demo = DEMO_USERS[credentials.userName?.trim().toLowerCase() ?? ''];
            if (demo) {
              try {
                const payload = { idrole: demo.idrole };
                const token = `fake.${btoa(JSON.stringify(payload))}.sig`;
                const response: LoginResponse = { response: token, role: demo.role, idrole: demo.idrole };
                return of(response);
              } catch {
                // fallthrough to original error
              }
            }
          }

          return throwError(() => err);
        })
      );
  }

  postIncidents(incidents: AttendanceIncidentModel[]) {
    const url = `${environment.apiBaseUrl}/api/Incidencias`;
    return this.http.post(url, incidents).pipe(
      catchError((err) => {
        return throwError(() => err);
      })
    );
  }

  getUsers() {
    return this.http.get<UserModel[]>(`${environment.apiBaseUrl}${environment.usersEndpoint}`);
  }

  getCourses() {
    return this.http.get<CourseModel[]>(`${environment.apiBaseUrl}${environment.coursesEndpoint}`);
  }

  getCourseStudents(courseId: number) {
    return this.http.get<UserModel[]>(`${environment.apiBaseUrl}/api/Usuarios/UsuariosCurso/${courseId}`);
  }

  getTeacherCourses() {
    return this.http.get<CourseModel[]>(`${environment.apiBaseUrl}/api/Profesor/CursosActivosProfesor`);
  }

  getCursosUsuarios() {
    return this.http.get<{ id: number; idUsuario: number; idCurso: number }[]>(`${environment.apiBaseUrl}/api/CursosUsuarios`);
  }
}
