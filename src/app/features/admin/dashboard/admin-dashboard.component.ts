import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';

import { DemoAttendanceService } from '../../../core/services/demo-attendance.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent {
  private readonly demoAttendance = inject(DemoAttendanceService);

  readonly snapshot = computed(() => this.demoAttendance.getAdminSnapshot());
  readonly pendingJustifications = computed(() => this.demoAttendance.getPendingJustifications().slice(0, 6));
}