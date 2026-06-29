import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

/** Definicion de rutas de la aplicacion con lazy loading por componente */
export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio',      loadComponent: () => import('./pages/inicio/inicio').then(m => m.InicioComponent) },
  { path: 'productos',   loadComponent: () => import('./pages/productos/productos').then(m => m.ProductosComponent) },
  { path: 'servicios',   loadComponent: () => import('./pages/servicios/servicios').then(m => m.ServiciosComponent) },
  { path: 'login',       loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent) },
  { path: 'registro',    loadComponent: () => import('./pages/registro/registro').then(m => m.RegistroComponent) },
  { path: 'recuperar',   loadComponent: () => import('./pages/recuperar/recuperar').then(m => m.RecuperarComponent) },
  { path: 'carrito',     loadComponent: () => import('./pages/carrito/carrito').then(m => m.CarritoComponent),       canActivate: [authGuard] },
  { path: 'checkout',    loadComponent: () => import('./pages/checkout/checkout').then(m => m.CheckoutComponent),    canActivate: [authGuard] },
  { path: 'mis-compras', loadComponent: () => import('./pages/mis-compras/mis-compras').then(m => m.MisComprasComponent), canActivate: [authGuard] },
  { path: 'perfil',      loadComponent: () => import('./pages/perfil/perfil').then(m => m.PerfilComponent),          canActivate: [authGuard] },
  { path: 'admin',       loadComponent: () => import('./pages/admin/admin').then(m => m.AdminComponent),             canActivate: [adminGuard] },
  { path: '**', redirectTo: 'inicio' }
];
