import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

export interface Sesion {
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);

  readonly sesion = signal<Sesion | null>(null);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const raw = localStorage.getItem('fullgas_session');
      if (raw) this.sesion.set(JSON.parse(raw));
    }
  }

  set(sesion: Sesion): void {
    this.sesion.set(sesion);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('fullgas_session', JSON.stringify(sesion));
    }
  }

  cerrar(): void {
    this.sesion.set(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('fullgas_session');
    }
    this.router.navigate(['/login']);
  }
}
