import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';

import { AuthSessionService } from '../../../core/auth/auth-session.service';
import { DemoAttendanceService, StudentDashboardData } from '../../../core/services/demo-attendance.service';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.scss'
})
export class StudentDashboardComponent {
  private readonly authSession = inject(AuthSessionService);
  private readonly demoAttendance = inject(DemoAttendanceService);

  readonly student = computed<StudentDashboardData>(() =>
    this.demoAttendance.getStudentDashboard(this.authSession.session()?.userName ?? null)
  );

  readonly trendMax = computed(() => Math.max(...this.student().tendencia.map((point) => point.value), 1));
  readonly progressStyle = computed(() => ({
    background: `conic-gradient(#22d3ee ${this.student().summary.asistencia}%, rgba(148, 163, 184, 0.15) 0)`
  }));

  trackByIncident = (_index: number, incident: { id: number }) => incident.id;
  trackByTrend = (_index: number, point: { label: string }) => point.label;

  incidentTone(isJustified: boolean): string {
    return isJustified
      ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100'
      : 'border-rose-400/20 bg-rose-400/10 text-rose-100';
  }

  typeTone(type: string): string {
    switch (type) {
      case 'Retraso':
        return 'text-amber-200';
      case 'Salida de antes':
        return 'text-cyan-200';
      default:
        return 'text-rose-100';
    }
  }
}