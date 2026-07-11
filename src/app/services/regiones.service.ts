import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/** Region de Chile con sus comunas, segun la API publica de regiones */
export interface Region {
  id: number;
  numero: string;
  nombre: string;
  capital: string;
  comunas: string[];
}

/**
 * Servicio que obtiene las regiones y comunas de Chile
 * desde la API publica alojada en GitHub Pages.
 */
@Injectable({ providedIn: 'root' })
export class RegionesService {
  private readonly http = inject(HttpClient);

  /** URL de la API publica de regiones y comunas de Chile */
  private readonly apiUrl = 'https://brychavez123.github.io/api_regiones_comunas/regiones-chile.json';

  /** Obtiene el listado completo de regiones con sus comunas */
  getRegiones(): Observable<Region[]> {
    return this.http.get<Region[]>(this.apiUrl);
  }
}
