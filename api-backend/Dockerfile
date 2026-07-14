# Backend simulado con json-server: expone la BD db.json como una API REST
# completa con los metodos GET, POST, PUT y DELETE sobre /productos y /servicios
FROM node:22-alpine

RUN npm install -g json-server

WORKDIR /app

# "Base de datos" en JSON: colecciones de productos y servicios
COPY data/db.json ./data/db.json

EXPOSE 3000

CMD ["json-server", "data/db.json", "--host", "0.0.0.0", "--port", "3000"]
