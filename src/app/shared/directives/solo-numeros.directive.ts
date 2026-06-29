import { Directive, HostListener } from '@angular/core';

/**
 * Directiva que restringe la entrada de un campo a solo digitos numericos.
 * Uso en plantilla: <input soloNumeros type="text" />
 */
@Directive({ selector: '[soloNumeros]', standalone: true })
export class SoloNumerosDirective {
  private readonly teclasSistema = [
    'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'
  ];

  @HostListener('keydown', ['$event'])
  onKeyDown(evento: KeyboardEvent): void {
    if (!this.teclasSistema.includes(evento.key) && !/^[0-9]$/.test(evento.key)) {
      evento.preventDefault();
    }
  }
}
