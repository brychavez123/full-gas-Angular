# Full Gas Detail

Aplicación web de una tienda de *detailing* vehicular: venta de productos de limpieza y reserva de servicios de lavado y detallado. Incluye catálogo con carrito de compras, checkout, registro e inicio de sesión de usuarios y un panel de administración con CRUD de productos, servicios, clientes y usuarios.

## Tecnologías

- **Angular 21** (componentes standalone, signals, lazy loading, SSR con prerender)
- **TypeScript** y **RxJS**
- **Bootstrap 5** + Bootstrap Icons
- **HttpClient** para el consumo de APIs REST
- **json-server** como backend REST (contenedor Docker)
- **nginx** como servidor web y proxy inverso en producción
- **Docker / Docker Compose** para el despliegue
- **Vitest** para pruebas unitarias
- **Compodoc** para la documentación técnica del código

## Arquitectura

La aplicación consume los datos de productos y servicios desde **dos fuentes intercambiables**, seleccionables desde el menú de navegación:

| Fuente | Origen de los datos | Escritura |
|---|---|---|
| **Local** | Archivos JSON publicados en GitHub Pages (solo lectura) | Los cambios del CRUD se guardan en `localStorage` |
| **JSON Server** | API REST del contenedor `json-server` (`/api/productos` y `/api/servicios`) | GET, POST, PUT y DELETE persisten en `api-backend/data/db.json` |

Las rutas reflejan la fuente activa: `/productos/local`, `/productos/server`, `/servicios/local`, `/servicios/server`.

En producción, el frontend llama a rutas relativas `/api/...` y **nginx** reenvía esas peticiones al contenedor del backend. En desarrollo, `ng serve` hace lo mismo mediante `proxy.conf.json`. Así el código funciona igual en local y en la nube, sin URLs absolutas.

```
Navegador ──► nginx (puerto 8080)
               ├── /        → aplicación Angular compilada (SPA + prerender)
               └── /api/... → json-server (puerto 3000, red interna de Docker)
```

Además, el formulario de registro carga las regiones y comunas de Chile desde una API JSON externa publicada en GitHub Pages.

## Ejecución con Docker (recomendada)

Requisitos: Docker Desktop.

```bash
docker compose up -d --build
```

- Aplicación: http://localhost:8080
- La API queda disponible en http://localhost:8080/api/productos y http://localhost:8080/api/servicios

Para detener todo:

```bash
docker compose down
```

## Ejecución en desarrollo

Requisitos: Node.js 22+ y npm.

```bash
npm install
npm start
```

La aplicación queda en http://localhost:4200. Para que la fuente **JSON Server** funcione en desarrollo, hay que levantar el backend aparte:

```bash
npx json-server api-backend/data/db.json --port 3000
```

## Uso del sistema

1. **Inicio**: página de presentación de la tienda.
2. **Productos / Servicios**: catálogo con filtro por categoría y búsqueda por texto. Desde el menú se elige la fuente de datos (*Local* o *JSON Server*).
3. **Carrito y checkout**: requieren iniciar sesión; el carrito se guarda en `localStorage`.
4. **Registro / Login / Recuperar contraseña**: formularios reactivos con validaciones.
5. **Mis compras** y **Perfil**: historial de pedidos y datos del usuario autenticado.
6. **Panel de administración** (`/admin`, solo rol Administrador): CRUD de productos y servicios contra la API de json-server, además de gestión de clientes, usuarios y pedidos.

Usuario administrador de prueba:

- **Correo:** `admin@fullgasdetail.cl`
- **Contraseña:** `Admin123!`

## Pruebas y documentación

```bash
npm test          # pruebas unitarias con Vitest
npm run compodoc  # genera la documentación en /docs
```

## Estructura del proyecto

```
├── api-backend/          # Backend json-server (Dockerfile + db.json)
├── src/app/
│   ├── guards/           # Guards de autenticación y de rol administrador
│   ├── pages/            # Páginas: inicio, productos, servicios, admin, etc.
│   ├── services/         # Servicios HTTP (fuentes local y server), sesión, carrito
│   └── shared/           # Navbar, tarjeta de producto, pipes
├── Dockerfile            # Build de Angular + nginx (multi-stage)
├── docker-compose.yml    # Orquesta frontend (nginx) y backend (json-server)
├── nginx.conf            # Servidor web + proxy /api
└── proxy.conf.json       # Proxy /api para ng serve en desarrollo
```
