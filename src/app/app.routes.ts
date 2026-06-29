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
    path: 'servicios',
    loadComponent: () => import('./pages/servicios/servicios').then(m => m.ServiciosComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'registro',
    loadComponent: () => import('./pages/registro/registro').then(m => m.RegistroComponent)
  },
  {
    path: 'recuperar',
    loadComponent: () => import('./pages/recuperar/recuperar').then(m => m.RecuperarComponent)
  },
  {
    path: 'carrito',
    loadComponent: () => import('./pages/carrito/carrito').then(m => m.CarritoComponent)
  },
  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout').then(m => m.CheckoutComponent)
  },
  {
    path: '**',
    redirectTo: 'inicio'
  }
];
