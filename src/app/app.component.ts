import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthSessionService } from './core/auth/auth-session.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'proyecto-faltas';

  private readonly authSession = inject(AuthSessionService);
  private readonly router = inject(Router);

  readonly session = this.authSession.session;
  readonly isAuthenticated = this.authSession.isAuthenticated;
  readonly currentUserName = computed(() => this.session()?.userName ?? 'Invitado');
  readonly currentRoleLabel = computed(() => {
    switch (this.session()?.roleId ?? null) {
      case 1:
        return 'Profesor';
      case 2:
        return 'Alumno';
      case 3:
        return 'Administrador';
      default:
        return 'Visitante';
    }
  });

  logout(): void {
    this.authSession.clear();
    this.router.navigateByUrl('/login');
  }
}
