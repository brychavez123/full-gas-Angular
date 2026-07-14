/**
 * Fuente de datos del catalogo, seleccionada desde el submenu del navbar:
 * - 'local': lee la API publica de GitHub Pages; los cambios del CRUD se guardan solo en localStorage.
 * - 'server': consume la API REST del contenedor json-server (GET, POST, PUT, DELETE sobre db.json).
 */
export type FuenteDatos = 'local' | 'server';
