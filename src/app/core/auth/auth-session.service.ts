import { Injectable, computed, signal } from '@angular/core';

import { AuthSession, JwtPayload } from '../../shared/models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly tokenKey = 'tajamar.jwt';
  private readonly roleIdKey = 'tajamar.roleId';
  private readonly userNameKey = 'tajamar.userName';
  private readonly sessionSignal = signal<AuthSession | null>(this.restoreSession());

  readonly session = computed(() => this.sessionSignal());
  readonly isAuthenticated = computed(() => Boolean(this.sessionSignal()));

  setToken(token: string | null | undefined, roleId: number | null | undefined = null, userName: string | null | undefined = null): void {
    if (!token) {
      this.clear();
      return;
    }

    const payload = this.decodePayload(token);
    const session = {
      token,
      roleId: roleId ?? this.getRoleIdFromPayload(payload) ?? 0,
      userName: userName?.trim() || this.decodeStoredUserName() || 'Usuario',
      payload
    };

    this.sessionSignal.set(session);
    sessionStorage.setItem(this.tokenKey, token);
    sessionStorage.setItem(this.roleIdKey, String(session.roleId));
    sessionStorage.setItem(this.userNameKey, session.userName);
  }

  clear(): void {
    this.sessionSignal.set(null);
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.roleIdKey);
    sessionStorage.removeItem(this.userNameKey);
  }

  getToken(): string | null {
    return this.sessionSignal()?.token ?? sessionStorage.getItem(this.tokenKey);
  }

  getRoleId(): number | null {
    return this.sessionSignal()?.roleId ?? this.decodeStoredRoleId() ?? this.getRoleIdFromPayload(this.sessionSignal()?.payload ?? this.decodeStoredPayload()) ?? null;
  }

  getUserName(): string | null {
    return this.sessionSignal()?.userName ?? this.decodeStoredUserName();
  }

  redirectPathForRole(roleId: number | null): string {
    switch (roleId) {
      case 1:
        return '/teacher';
      case 2:
        return '/student';
      case 3:
        return '/admin';
      default:
        return '/login';
    }
  }

  private restoreSession(): AuthSession | null {
    const token = sessionStorage.getItem(this.tokenKey);
    if (!token) {
      return null;
    }

    return {
      token,
      roleId: this.decodeStoredRoleId() ?? this.getRoleIdFromPayload(this.decodePayload(token)) ?? 0,
      userName: this.decodeStoredUserName() || 'Usuario',
      payload: this.decodePayload(token)
    };
  }

  private decodeStoredPayload(): JwtPayload | null {
    const token = sessionStorage.getItem(this.tokenKey);
    return token ? this.decodePayload(token) : null;
  }

  private decodeStoredRoleId(): number | null {
    const storedRoleId = sessionStorage.getItem(this.roleIdKey);
    if (storedRoleId === null) {
      return null;
    }

    const parsed = Number(storedRoleId);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private getRoleIdFromPayload(payload: JwtPayload | null): number | null {
    return payload?.idrole && payload.idrole > 0 ? payload.idrole : null;
  }

  private decodeStoredUserName(): string | null {
    const storedUserName = sessionStorage.getItem(this.userNameKey);
    return storedUserName && storedUserName.trim() ? storedUserName : null;
  }

  private decodePayload(token: string | null | undefined): JwtPayload {
    if (!token) {
      return { idrole: 0 };
    }

    const rawPayload = token.split('.')[1];
    if (!rawPayload) {
      return { idrole: 0 };
    }

    const normalized = rawPayload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');

    try {
      return JSON.parse(atob(padded)) as JwtPayload;
    } catch {
      return { idrole: 0 };
    }
  }
}