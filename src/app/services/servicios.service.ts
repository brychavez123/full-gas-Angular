import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
 * Servicio que obtiene el catalogo de servicios de detailing
 * desde la API publica alojada en GitHub Pages.
 */
@Injectable({ providedIn: 'root' })
export class ServiciosService {
  private readonly http = inject(HttpClient);

  /** URL de la API publica del catalogo de servicios */
  private readonly apiUrl = 'https://brychavez123.github.io/API_servicios_full_gas/servicios.json';

  /** Obtiene el listado completo de servicios del catalogo */
  getServicios(): Observable<Servicio[]> {
    return this.http.get<Servicio[]>(this.apiUrl);
  }
}
