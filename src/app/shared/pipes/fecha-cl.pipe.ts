import { Pipe, PipeTransform } from '@angular/core';

/**
 * Convierte una fecha ISO 8601 a formato legible en español chileno.
 * Uso en plantilla: {{ pedido.createdAt | fechaCl }}
 */
@Pipe({ name: 'fechaCl', standalone: true })
export class FechaClPipe implements PipeTransform {
  transform(iso: string | null | undefined): string {
    if (!iso) return '-';
    return new Date(iso).toLocaleString('es-CL');
  }
}
