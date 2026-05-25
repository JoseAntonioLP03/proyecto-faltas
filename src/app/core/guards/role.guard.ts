import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthSessionService } from '../auth/auth-session.service';

export const roleGuard = (allowedRoles: number[]): CanActivateFn => {
  return () => {
    const authSession = inject(AuthSessionService);
    const router = inject(Router);
    const roleId = authSession.getRoleId();

    if (roleId && allowedRoles.includes(roleId)) {
      return true;
    }

    return router.createUrlTree([authSession.redirectPathForRole(roleId)]);
  };
};