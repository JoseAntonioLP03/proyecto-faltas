import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { environment } from '../../../environments/environment';
import { LoginResponse } from '../../shared/models/auth.model';
import { CourseModel } from '../../shared/models/course.model';
import { UserModel } from '../../shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class TajamarApiService {
  private readonly http = inject(HttpClient);

  login(credentials: { userName: string; password: string }) {
    return this.http.post<LoginResponse>(`${environment.apiBaseUrl}${environment.authEndpoint}`, credentials);
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
