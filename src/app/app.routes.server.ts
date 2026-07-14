import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'productos/:fuente',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return [{ fuente: 'local' }, { fuente: 'server' }];
    }
  },
  {
    path: 'servicios/:fuente',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return [{ fuente: 'local' }, { fuente: 'server' }];
    }
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
