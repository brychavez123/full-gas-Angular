import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, of, timeout } from 'rxjs';
import type { Producto } from '../shared/producto-card/producto-card';

/**
 * Servicio de productos para la fuente JSON SERVER.
 * Consume la API REST del contenedor json-server usando los cuatro metodos:
 * GET (listar), POST (crear), PUT (actualizar) y DELETE (eliminar).
 * Los cambios quedan persistidos en el archivo db.json del backend.
 */
@Injectable({ providedIn: 'root' })
export class ProductosServerService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  /**
   * Endpoint de productos del contenedor json-server. Es una ruta relativa:
   * nginx (produccion) y el proxy de ng serve (desarrollo) reenvian /api/
   * al backend, por lo que funciona igual en local y en cloud.
   */
  private readonly apiUrl = '/api/productos';

  /** Milisegundos maximos de espera antes de considerar caido el servidor */
  private readonly tiempoMaximo = 5000;

  /** GET: obtiene el listado de productos desde json-server */
  getProductos(): Observable<Producto[]> {
    if (!isPlatformBrowser(this.platformId)) return of([]);
    return this.http.get<Producto[]>(this.apiUrl).pipe(timeout(this.tiempoMaximo));
  }

  /** POST: crea un producto nuevo en json-server */
  crearProducto(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, producto).pipe(timeout(this.tiempoMaximo));
  }

  /** PUT: actualiza un producto existente en json-server */
  actualizarProducto(producto: Producto): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${producto.id}`, producto).pipe(timeout(this.tiempoMaximo));
  }

  /** DELETE: elimina un producto de json-server por su id */
  eliminarProducto(id: string): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(timeout(this.tiempoMaximo));
  }
}
