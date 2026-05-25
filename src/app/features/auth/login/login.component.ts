import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { TajamarApiService } from '../../../core/services/tajamar-api.service';
import { AuthSessionService } from '../../../core/auth/auth-session.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  userName = '';
  password = '';
  errorMessage = '';

  constructor(
    private readonly api: TajamarApiService,
    private readonly authSession: AuthSessionService,
    private readonly router: Router
  ) {}

  submit(): void {
    this.errorMessage = '';
    this.api.login({ userName: this.userName, password: this.password }).subscribe({
      next: (session) => {
        this.authSession.setToken(session.response, session.idrole, this.userName);
        const roleId = session.idrole ?? this.authSession.getRoleId();
        this.router.navigateByUrl(this.authSession.redirectPathForRole(roleId ?? null));
      },
      error: () => {
        this.errorMessage = 'No se ha podido iniciar sesión.';
      }
    });
  }
}