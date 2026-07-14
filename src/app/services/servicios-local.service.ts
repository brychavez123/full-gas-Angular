import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

/**
 * Modelo de datos de un servicio de detailing ofrecido por Full Gas Detail.
 */
export interface Servicio {
  /** Identificador unico del servicio */
  id: string;
  /** Nombre del servicio */
  name: string;
  /** Precio base en pesos chilenos */
  price: number;
  /** Descripcion corta del servicio */
  descripcion: string;
  /** URL de la imagen representativa */
  imagen: string;
  /** Texto alternativo para la imagen */
  altImagen: string;
  /** Texto de precio formateado para mostrar en pantalla */
  precioTexto: string;
}

/**
 * Servicio de servicios de detailing para la fuente LOCAL.
 * Lee el catalogo desde la API publica de GitHub Pages y persiste los cambios
 * del CRUD unicamente en localStorage (no modifica el JSON de GitHub).
 */
@Injectable({ providedIn: 'root' })
export class ServiciosLocalService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  /** API publica de solo lectura en GitHub Pages */
  private readonly apiUrl = 'https://brychavez123.github.io/API_servicios_full_gas/servicios.json';

  /** Clave de localStorage donde se persisten los cambios del CRUD */
  private readonly storageKey = 'fullgas_servicios_local';

  /**
   * Obtiene el listado de servicios. Si existen cambios guardados en
   * localStorage se priorizan sobre la API de GitHub.
   */
  getServicios(): Observable<Servicio[]> {
    if (isPlatformBrowser(this.platformId)) {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) return of(JSON.parse(raw) as Servicio[]);
    }
    return this.http.get<Servicio[]>(this.apiUrl);
  }

  /** Guarda el catalogo completo en localStorage */
  guardarServicios(servicios: Servicio[]): Observable<unknown> {
    localStorage.setItem(this.storageKey, JSON.stringify(servicios));
    return of(null);
  }
}
