import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';

/**
 * Guard que protege rutas exclusivas de Administrador y Tecnico.
 * Redirige a /login si no hay sesion, o a /inicio si el rol no tiene acceso.
 */
export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) return true;

  const sesion = JSON.parse(localStorage.getItem('fullgas_session') ?? 'null');
  if (!sesion) {
    router.navigate(['/login']);
    return false;
  }

  const rol: string = sesion.role?.toLowerCase() ?? '';
  if (rol !== 'administrador' && rol !== 'tecnico') {
    router.navigate(['/inicio']);
    return false;
  }
  return true;
};
