import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, computed, inject, signal } from '@angular/core';

import {
  AttendanceMark,
  DemoAttendanceService,
  attendanceMarkLabels,
  TeacherCourse,
  TeacherRosterStudent
} from '../../../core/services/demo-attendance.service';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teacher-dashboard.component.html',
  styleUrl: './teacher-dashboard.component.scss'
})
export class TeacherDashboardComponent {
  private readonly demoAttendance = inject(DemoAttendanceService);

  readonly courses = this.demoAttendance.teacherCourses;
  readonly activeCourse = this.demoAttendance.activeTeacherCourse;
  readonly activeStats = computed(() => this.demoAttendance.getActiveCourseStats());
  readonly currentHistory = computed(() => (this.activeCourse()?.historial ?? []).slice(0, 6));
  
  readonly activeStudents = computed(() => this.activeCourse()?.alumnos ?? []);
  readonly statusMessage = signal('');
  readonly attendanceMarks: AttendanceMark[] = ['presente', 'falta', 'retraso', 'salida'];
  readonly markLabels = attendanceMarkLabels;

  selectCourse(courseId: number): void {
    this.demoAttendance.setActiveCourse(courseId);
    this.statusMessage.set('');
  }

  markStudent(studentId: number, state: AttendanceMark): void {
    this.demoAttendance.setStudentState(studentId, state);
    this.statusMessage.set('');
  }

  markAll(state: AttendanceMark): void {
    this.demoAttendance.setAllStudents(state);
    this.statusMessage.set(`Se ha marcado a todo el grupo como ${attendanceMarkLabels[state].toLowerCase()}.`);
  }

  saveAttendance(): void {
    const count = this.demoAttendance.commitActiveCourse();
    this.statusMessage.set(
      count > 0 ? `Se han generado ${count} incidencias nuevas y se han guardado en el historial.` : 'No había incidencias pendientes para registrar.'
    );
  }

  trackByCourse = (_index: number, course: TeacherCourse) => course.id;
  trackByStudent = (_index: number, student: TeacherRosterStudent) => student.id;
  trackByHistory = (_index: number, incident: { id: number }) => incident.id;

  markTone(state: AttendanceMark): string {
    switch (state) {
      case 'falta':
        return 'border-rose-400/20 bg-rose-400/10 text-rose-100';
      case 'retraso':
        return 'border-amber-400/20 bg-amber-400/10 text-amber-100';
      case 'salida':
        return 'border-cyan-400/20 bg-cyan-400/10 text-cyan-100';
      default:
        return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100';
    }
  }
}