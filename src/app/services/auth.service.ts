import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

/** Datos de la sesion activa del usuario autenticado */
export interface Sesion {
  /** Nombre completo del usuario */
  name: string;
  /** Correo electronico del usuario */
  email: string;
  /** Numero de telefono */
  phone: string;
  /** Direccion de domicilio */
  address: string;
  /** Rol del usuario: Cliente, Tecnico o Administrador */
  role: string;
}

/**
 * Servicio centralizado de autenticacion y sesion.
 * Sincroniza el estado de sesion con localStorage y expone signals reactivos.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);

  private readonly _sesion = signal<Sesion | null>(this.leerSesion());

  /** Sesion activa del usuario (null si no ha iniciado sesion) */
  readonly sesion = this._sesion.asReadonly();

  /** Indica si hay un usuario con sesion activa */
  readonly isAuthenticated = computed(() => this._sesion() !== null);

  /** Indica si el usuario tiene rol Administrador o Tecnico */
  readonly isAdmin = computed(() => {
    const rol = this._sesion()?.role?.toLowerCase() ?? '';
    return rol === 'administrador' || rol === 'tecnico';
  });

  /** Inicia sesion guardando los datos en localStorage */
  login(sesion: Sesion): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem('fullgas_session', JSON.stringify(sesion));
    this._sesion.set(sesion);
  }

  /** Cierra sesion eliminando los datos de localStorage y redirige al login */
  logout(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.removeItem('fullgas_session');
    this._sesion.set(null);
    this.router.navigate(['/login']);
  }

  /** Actualiza los datos de la sesion activa sin cerrar sesion */
  actualizarSesion(sesion: Sesion): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem('fullgas_session', JSON.stringify(sesion));
    this._sesion.set(sesion);
  }

  private leerSesion(): Sesion | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return JSON.parse(localStorage.getItem('fullgas_session') ?? 'null');
  }
}
