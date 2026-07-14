import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import type { Producto } from '../shared/producto-card/producto-card';

/**
 * Servicio de productos para la fuente LOCAL.
 * Lee el catalogo desde la API publica de GitHub Pages y persiste los cambios
 * del CRUD unicamente en localStorage (no modifica el JSON de GitHub).
 */
@Injectable({ providedIn: 'root' })
export class ProductosLocalService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  /** API publica de solo lectura en GitHub Pages */
  private readonly apiUrl = 'https://brychavez123.github.io/productos/productos.json';

  /** Clave de localStorage donde se persisten los cambios del CRUD */
  private readonly storageKey = 'fullgas_productos_local';

  /**
   * Obtiene el listado de productos. Si existen cambios guardados en
   * localStorage se priorizan sobre la API de GitHub.
   */
  getProductos(): Observable<Producto[]> {
    if (isPlatformBrowser(this.platformId)) {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) return of(JSON.parse(raw) as Producto[]);
    }
    return this.http.get<Producto[]>(this.apiUrl);
  }

  /** Guarda el catalogo completo en localStorage */
  guardarProductos(productos: Producto[]): Observable<unknown> {
    localStorage.setItem(this.storageKey, JSON.stringify(productos));
    return of(null);
  }
}
