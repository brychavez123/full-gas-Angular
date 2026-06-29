import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';

/**
 * Guard que protege rutas que requieren sesion iniciada.
 * Redirige a /login si no hay sesion activa en localStorage.
 */
export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) return true;

  const sesion = localStorage.getItem('fullgas_session');
  if (!sesion) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};
