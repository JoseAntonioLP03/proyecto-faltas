import { Routes } from '@angular/router';

import { LoginComponent } from './features/auth/login/login.component';
import { StudentDashboardComponent } from './features/student/dashboard/student-dashboard.component';
import { TeacherDashboardComponent } from './features/teacher/dashboard/teacher-dashboard.component';
import { AdminDashboardComponent } from './features/admin/dashboard/admin-dashboard.component';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'login' },
	{ path: 'login', component: LoginComponent },
	{ path: 'student', component: StudentDashboardComponent, canActivate: [roleGuard([2])] },
	{ path: 'teacher', component: TeacherDashboardComponent, canActivate: [roleGuard([1])] },
	{ path: 'admin', component: AdminDashboardComponent, canActivate: [roleGuard([3])] },
	{ path: '**', redirectTo: 'login' }
];
