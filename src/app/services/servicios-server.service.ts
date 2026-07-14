import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, of, timeout } from 'rxjs';
import type { Servicio } from './servicios-local.service';

/**
 * Servicio de servicios de detailing para la fuente JSON SERVER.
 * Consume la API REST del contenedor json-server usando los cuatro metodos:
 * GET (listar), POST (crear), PUT (actualizar) y DELETE (eliminar).
 * Los cambios quedan persistidos en el archivo db.json del backend.
 */
@Injectable({ providedIn: 'root' })
export class ServiciosServerService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  /**
   * Endpoint de servicios del contenedor json-server. Es una ruta relativa:
   * nginx (produccion) y el proxy de ng serve (desarrollo) reenvian /api/
   * al backend, por lo que funciona igual en local y en cloud.
   */
  private readonly apiUrl = '/api/servicios';

  /** Milisegundos maximos de espera antes de considerar caido el servidor */
  private readonly tiempoMaximo = 5000;

  /** GET: obtiene el listado de servicios desde json-server */
  getServicios(): Observable<Servicio[]> {
    if (!isPlatformBrowser(this.platformId)) return of([]);
    return this.http.get<Servicio[]>(this.apiUrl).pipe(timeout(this.tiempoMaximo));
  }

  /** POST: crea un servicio nuevo en json-server */
  crearServicio(servicio: Servicio): Observable<Servicio> {
    return this.http.post<Servicio>(this.apiUrl, servicio).pipe(timeout(this.tiempoMaximo));
  }

  /** PUT: actualiza un servicio existente en json-server */
  actualizarServicio(servicio: Servicio): Observable<Servicio> {
    return this.http.put<Servicio>(`${this.apiUrl}/${servicio.id}`, servicio).pipe(timeout(this.tiempoMaximo));
  }

  /** DELETE: elimina un servicio de json-server por su id */
  eliminarServicio(id: string): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(timeout(this.tiempoMaximo));
  }
}
