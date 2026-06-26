import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'inicio',
    pathMatch: 'full'
  },
  {
    path: 'inicio',
    loadComponent: () => import('./pages/inicio/inicio').then(m => m.InicioComponent)
  },
  {
    path: 'productos',
    loadComponent: () => import('./pages/productos/productos').then(m => m.ProductosComponent)
  },
  {
    path: '**',
    redirectTo: 'inicio'
  }
];
