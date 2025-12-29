import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth/auth-service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  // inject authService and router  
  const authService = inject(AuthService);
  const router = inject(Router);

  // check if user is logged in
  if (authService.isUserLoggedIn()) {
    return true;
  } else {
    router.navigateByUrl('/login');
    return false;
  }
};
