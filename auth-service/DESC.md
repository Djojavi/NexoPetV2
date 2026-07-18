# Integrante 2 — Backend (Auth + API Gateway)

## Objetivo

Construir toda la autenticación del sistema y el API Gateway.

---

## Tecnologías

- NestJS
- Prisma
- PostgreSQL
- JWT
- bcrypt

---

## Carpetas

```
gateway/

auth-service/
```

---

## API Gateway

Crear un Gateway que será la única entrada al sistema.

Debe recibir:

```
/auth

/products

/chat
```

y redirigir las solicitudes al microservicio correspondiente.

---

## Auth Service

Crear un nuevo proyecto NestJS.

---

### Base de datos

Tabla:

```
users

id

name

email

password

role
```

---

### Prisma

Crear:

```
schema.prisma
```

Crear migraciones.

---

### Endpoints

```
POST /register

POST /login

POST /forgot-password

GET /profile
```

---

### Seguridad

Utilizar:

```
bcrypt
```

para almacenar las contraseñas.

Nunca guardar contraseñas en texto plano.

---

### JWT

Al iniciar sesión devolver:

```
access_token
```

---

### Guards

Crear:

```
JwtAuthGuard
```

para proteger las rutas privadas.

---

### Gateway

El Gateway debe:

- Validar JWT
- Reenviar solicitudes
- No contener lógica de negocio

---

### Docker

Crear:

```
Dockerfile
```

para:

- Gateway
- Auth Service

---

### Base de datos

Levantar:

```
postgres-auth
```

---

## Entregables

- Gateway funcional
- Auth Service funcional
- Login
- Registro
- JWT funcionando
- Docker

---