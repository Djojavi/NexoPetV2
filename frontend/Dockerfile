# ---------- Etapa 1: build de la SPA ----------
FROM node:22-alpine AS build
WORKDIR /app

# Instala dependencias con el lockfile (reproducible).
COPY package.json package-lock.json ./
RUN npm ci

# En producción el frontend se sirve tras nginx, que proxea /api al gateway.
# Fijamos la base del API como ruta relativa para no depender del .env local
# (que se excluye vía .dockerignore). VITE_CHAT_URL queda sin definir a propósito:
# el socket se conecta al mismo origen y nginx proxea /socket.io.
ENV VITE_API_URL=/api

COPY . .
RUN npm run build

# ---------- Etapa 2: servir con nginx ----------
FROM nginx:alpine

# Configuración con proxy a los microservicios y fallback SPA.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Artefactos estáticos compilados.
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
