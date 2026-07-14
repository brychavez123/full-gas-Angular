# Etapa 1: compilacion de la aplicacion Angular
FROM node:22-alpine AS build
WORKDIR /app

# Instala dependencias primero para aprovechar la cache de capas
COPY package.json package-lock.json ./
RUN npm ci

# Copia el resto del codigo y genera el build de produccion
COPY . .
RUN npm run build

# Etapa 2: nginx sirviendo la aplicacion compilada (archivos estaticos)
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/full-gas/browser /usr/share/nginx/html

# El build con prerender genera index.csr.html en vez de index.html;
# se copia como index.html para que nginx lo use como pagina raiz y fallback SPA
RUN cp /usr/share/nginx/html/index.csr.html /usr/share/nginx/html/index.html

EXPOSE 80
