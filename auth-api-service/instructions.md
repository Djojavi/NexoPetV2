# Instructions — Levantar el proyecto

## Requisitos previos

- [Node.js](https://nodejs.org/) v18+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) corriendo
- Dependencias instaladas: `npm install` (desde la raíz `auth-api-service/`)

---

## 1. Base de datos (PostgreSQL vía Docker)

Desde la carpeta `auth-api-service/`:

```bash
docker compose up -d
```

Esto levanta el contenedor `veterinaria-auth-db` con PostgreSQL en el puerto **5432**.

> Si el contenedor ya existía previamente y hay conflicto de nombre:
> ```bash
> docker start veterinaria-auth-db
> ```

Para verificar que está corriendo:

```bash
docker ps
```

---

## 2. Auth Service (microservicio TCP — puerto 3001)

Abre una **nueva terminal** en `auth-api-service/` y ejecuta:

```bash
npm run start:dev -- auth-service
```

Deberías ver:
```
Auth Microservice is listening on TCP port 3001
```

---

## 3. API Gateway (HTTP — puerto 3000)

Abre **otra terminal** en `auth-api-service/` y ejecuta:

```bash
npm run start:dev -- api-gateway
```

Deberías ver:
```
API Gateway is running on http://localhost:3000
```

> **Importante:** el Auth Service debe estar corriendo antes de iniciar el API Gateway.

---

## 4. Probar los endpoints

### Registrar usuario

```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "mi_password_seguro"
}
```

### Login

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "mi_password_seguro"
}
```

Respuesta exitosa:

```json
{
  "access_token": "<JWT>",
  "user": {
    "id": "...",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "role": "USER"
  }
}
```

> El JWT contiene los campos `role` y `name` en su payload.  
> El API Gateway expone `req.user.role` y `req.user.name` en todas las rutas protegidas con `JwtAuthGuard`.

---

## Roles disponibles

| Valor   | Descripción              |
|---------|--------------------------|
| `USER`  | Usuario estándar (default) |
| `ADMIN` | Administrador             |

---

## Variables de entorno (`.env`)

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=root_password_2026
POSTGRES_DB=auth_db
POSTGRES_PORT=5432

DATABASE_URL="postgresql://postgres:root_password_2026@localhost:5432/auth_db?schema=public"
```
