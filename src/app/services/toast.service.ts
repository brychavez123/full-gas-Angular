import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ToastTono = 'success' | 'danger' | 'warning';

/**
 * Servicio centralizado para mostrar notificaciones toast en pantalla.
 * Elimina la necesidad de duplicar el bloque notificar() en cada componente.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly platformId = inject(PLATFORM_ID);

  /**
   * Muestra un toast con el mensaje indicado durante 2.8 segundos.
   * @param mensaje Texto a mostrar en el toast
   * @param tono Color del encabezado: success (verde), danger (rojo) o warning (amarillo)
   */
  mostrar(mensaje: string, tono: ToastTono = 'success'): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const titulo: Record<ToastTono, string> = {
      success: 'Full Gas Detail',
      danger: 'Atencion',
      warning: 'Aviso'
    };

    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.innerHTML = `
      <strong class="d-block mb-1 text-${tono}">${titulo[tono]}</strong>
      <span>${mensaje}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2800);
  }
}
