# Integrante 3 — Backend (Productos)

## Objetivo

Separar el CRUD existente en un microservicio independiente.

---

## Tecnologías

- NestJS
- Prisma
- PostgreSQL

---

## Carpeta

```
product-service/
```

---

## Refactorización

Mover desde el monolito únicamente:

- Controllers
- Services
- DTO
- Prisma
- Entities

Eliminar dependencias innecesarias.

---

## Nueva Base de Datos

Crear:

```
product_db
```

No compartir la base de datos con Auth.

---

### Prisma

Crear:

```
schema.prisma
```

Realizar migraciones.

---

### CRUD

Implementar:

```
GET /products

GET /products/:id

POST /products

PUT /products/:id

DELETE /products/:id
```

---

### Validaciones

No permitir:

- Precio negativo
- Stock negativo
- Nombre vacío

---

### Docker

Crear Dockerfile.

Levantar:

```
postgres-product
```

---

### Comunicación

El Product Service únicamente responde al Gateway.

Nunca directamente al frontend.

---

### Documentación

Opcional:

- Swagger

---

## Entregables

- Product Service
- CRUD completo
- PostgreSQL independiente
- Docker

---