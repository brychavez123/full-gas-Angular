import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar';

/**
 * Pagina principal (home) de Full Gas Detail.
 * Muestra hero, servicios, por que elegirnos, servicios destacados, FAQ y formulario de contacto.
 */
@Component({
  selector: 'app-inicio',
  imports: [RouterLink, NavbarComponent],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class InicioComponent {}
