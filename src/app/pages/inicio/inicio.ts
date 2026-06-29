import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

/**
 * Pagina principal (home) de Full Gas Detail.
 * Muestra hero, servicios, por que elegirnos, servicios destacados, FAQ y formulario de contacto.
 */
@Component({
  selector: 'app-inicio',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss',
})
export class InicioComponent {}
