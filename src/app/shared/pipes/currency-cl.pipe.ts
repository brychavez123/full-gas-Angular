import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formatea un numero como moneda chilena (CLP) sin simbolo de moneda.
 * Uso en plantilla: {{ producto.price | currencyCl }}
 */
@Pipe({ name: 'currencyCl', standalone: true })
export class CurrencyClPipe implements PipeTransform {
  transform(valor: number | null | undefined): string {
    if (valor == null) return '0';
    return new Intl.NumberFormat('es-CL').format(valor);
  }
}
