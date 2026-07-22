# Integrante 3 — Backend (Mascotas / `product-service`)

Microservicio que separa del monolito el **CRUD de mascotas** y su **historial clínico**
(vacunas, cirugías, diagnósticos). Aunque el nombre histórico es "Productos", el dominio real
—heredado de `app/api/mascotas/**` del monolito— son las mascotas.

- **Framework:** NestJS 11 (microservicio **TCP**, no HTTP)
- **ORM:** Prisma 7 (patrón driver-adapter con `@prisma/adapter-pg`)
- **BD:** PostgreSQL — base propia `product_db` (**no se comparte con Auth**)
- **Comunicación:** solo responde al **API Gateway** vía TCP. Nunca al frontend.

---

## Arquitectura de comunicación

```text
Frontend ──HTTP──▶ API Gateway ──TCP (@nestjs/microservices)──▶ product-service ──▶ product_db
                   (valida JWT)     ClientProxy.send('pet.*')      @MessagePattern
```

El gateway valida el JWT (Bearer) y **reenvía la identidad del usuario** como un objeto `actor`
dentro del payload de cada mensaje. `product-service` confía en ese `actor` (la autenticación
vive en el gateway) y aplica la **autorización por rol/propiedad** en sus servicios.

### Contrato de payload (envelope)

Todo mensaje lleva un `actor` + los datos de la operación:

```jsonc
{
  "actor": { "userId": "uuid-del-usuario", "role": "USER" | "ADMIN" },
  // ...campos propios de cada patrón (data, id, petId, search)
}
```

> **Roles:** `USER` = cliente (dueño de mascotas) · `ADMIN` = veterinario / personal de la clínica.
> A nivel de este servicio solo existen estos dos niveles de permiso.

### Patrones de mensaje (`@MessagePattern`)

| Patrón                  | Payload (además de `actor`)        | Descripción                    |
| ----------------------- | ---------------------------------- | ------------------------------ |
| `pet.findAll`           | `search?: string`                  | Listar mascotas (según rol)    |
| `pet.findOne`           | `id: string`                       | Detalle + historial clínico    |
| `pet.create`            | `data: CreatePetDto`               | Crear mascota                  |
| `pet.update`            | `id: string, data: UpdatePetDto`   | Editar mascota                 |
| `pet.remove`            | `id: string`                       | Eliminar mascota               |
| `pet.vaccine.create`    | `petId: string, data: Vaccine`     | Añadir vacuna                  |
| `pet.vaccine.findAll`   | `petId: string`                    | Listar vacunas                 |
| `pet.surgery.create`    | `petId: string, data: Surgery`     | Añadir cirugía                 |
| `pet.surgery.findAll`   | `petId: string`                    | Listar cirugías                |
| `pet.diagnosis.create`  | `petId: string, data: Diagnosis`   | Añadir diagnóstico             |
| `pet.diagnosis.findAll` | `petId: string`                    | Listar diagnósticos            |

### Reglas de autorización

| Operación         | USER (cliente)                          | ADMIN (veterinario)                  |
| ----------------- | --------------------------------------- | ------------------------------------ |
| `findAll`         | solo sus mascotas                       | todas + `search` por nombre/especie  |
| `findOne`         | solo si es dueño (si no, 403)           | cualquiera                           |
| `create`          | dueño = él mismo (`ownerId` ignorado)   | requiere `ownerId` (si falta, 400)   |
| `update`          | solo si es dueño; no reasigna dueño     | cualquiera; puede reasignar dueño    |
| `remove`          | 403                                     | permitido                            |
| clínico `create`  | 403 (solo el veterinario)               | permitido (mascota inexistente → 404)|
| clínico `findAll` | solo si es dueño de la mascota          | cualquiera                           |

Los errores se emiten como excepciones Nest (`BadRequestException`, `NotFoundException`,
`ForbiddenException`, `UnauthorizedException`). Un filtro global (`RpcAllExceptionsFilter`)
las traduce a un payload serializable para que el gateway pueda re-mapearlas al HTTP correcto:

```jsonc
// Lo que recibe el gateway en el error del observable:
{ "statusCode": 403, "message": "Acceso denegado", "error": "Forbidden" }
```

En el gateway basta con reenviar ese código, p. ej.:

```ts
import { catchError, throwError } from 'rxjs';
import { HttpException } from '@nestjs/common';
// ...
return this.productClient.send('pet.findOne', { actor, id }).pipe(
  catchError((e) =>
    throwError(() => new HttpException(e.message ?? 'Error', e.statusCode ?? 500)),
  ),
);
```

---

## Validaciones (requisito del README original)

Implementadas con `class-validator` + `ValidationPipe` global (`whitelist + transform`):

- **Nombre** obligatorio y no vacío (`@IsNotEmpty`).
- **Peso** > 0 cuando se envía (`@IsPositive`): se rechazan 0 y negativos.
- **Especie / sexo** deben pertenecer al enum (`@IsEnum`).
- **Fechas** en formato ISO (`@IsDateString`), convertidas a `Date` al persistir.
- `whitelist` descarta campos no declarados (evita, p. ej., que un USER/cliente cuele `ownerId`).

---

## Modelo de datos

`Pet` (mascotas) + `Vaccine`, `Surgery`, `Diagnosis` (historial, borrado en cascada con la
mascota). El dueño se guarda como `ownerId: String`, **referencia opaca** al `user.id` de
auth-service — no hay relación/FK entre bases de datos. Ver [prisma/schema.prisma](prisma/schema.prisma).

> Nota: los valores de los enums `Species` y `Sex` son una elección razonable; conviene
> confirmarlos contra el frontend / los datos reales antes de producción.

---

## Puesta en marcha (local)

```bash
cp .env.example .env          # ajusta credenciales si hace falta
npm install
docker compose up -d product-db   # levanta solo la base de datos
npx prisma migrate dev --name init   # genera cliente + crea tablas
npm run start:dev             # microservicio TCP en el puerto 3002
```

Con Docker completo (BD + microservicio):

```bash
docker compose up --build
```

### Variables de entorno (`.env`)

| Variable                | Ejemplo / uso                                             |
| ----------------------- | -------------------------------------------------------- |
| `DATABASE_URL`          | `postgresql://product_user:product_pass@localhost:5434/product_db?schema=public` |
| `PRODUCT_SERVICE_HOST`  | `0.0.0.0`                                                 |
| `PRODUCT_SERVICE_PORT`  | `3002`                                                    |
| `POSTGRES_USER/PASSWORD/DB/PORT` | credenciales que consume `docker-compose.yml`   |

---

## Tests

Como es un microservicio **TCP** (no HTTP), no se prueba con Postman. La suite E2E
([test/pets.e2e-spec.ts](test/pets.e2e-spec.ts)) arranca el microservicio real en un puerto de
prueba (con el mismo `ValidationPipe` y filtro RPC que producción) y le habla con un
`ClientProxy`, cubriendo los 11 patrones y todas las reglas de autorización.

```bash
docker compose up -d product-db          # BD de pruebas
npx prisma migrate deploy                 # aplica migraciones
npm run test:e2e                          # 22 casos
```

Requiere `DATABASE_URL` apuntando a una BD con las migraciones aplicadas.

## CI (GitHub Actions)

El workflow [`.github/workflows/product-service-ci.yml`](../.github/workflows/product-service-ci.yml)
(en la raíz del repo) se dispara **solo** cuando cambia `product-service/**`, gracias a un filtro
`paths`. En cada push/PR levanta un Postgres efímero y corre: `npm ci` → `prisma generate` →
`lint` → `build` → `migrate deploy` → `test:e2e`.

---

## Integración con el API Gateway (pendiente, otra tarea)

Este entregable es **solo el microservicio**. Para exponerlo, quien administre el
`api-gateway` debe (siguiendo el patrón ya usado con `auth-service`):

1. **Registrar el cliente TCP** en `apps/api-gateway/src/app.module.ts`:

   ```ts
   ClientsModule.register([
     // ...AUTH_SERVICE existente
     {
       name: 'PRODUCT_SERVICE',
       transport: Transport.TCP,
       options: { host: '127.0.0.1', port: 3002 }, // 'product-service' en Docker
     },
   ]);
   ```

2. **Crear un controller** `@Controller('mascotas')` protegido con `JwtAuthGuard`, que reenvíe
   cada verbo REST al patrón correspondiente, inyectando el `actor` desde `req.user`:

   ```ts
   @UseGuards(JwtAuthGuard)
   @Get()
   findAll(@Req() req, @Query('search') search?: string) {
     const actor = { userId: req.user.userId, role: req.user.role };
     return this.productClient.send('pet.findAll', { actor, search });
   }
   ```

3. **Dependencia con Auth (fuera de alcance de este servicio):** hoy el JWT solo contiene
   `{ sub, email }` y el modelo `User` de auth-service **no tiene `role`**. Para que las reglas
   por rol (`USER` / `ADMIN`) funcionen de verdad, auth-service debe añadir `User.role` e
   incluirlo en el token; entonces el gateway podrá poblar `actor.role`. Hasta ese momento el
   contrato ya está listo: solo falta que el `role` llegue con un valor real. Como este servicio
   solo distingue cliente (`USER`) de veterinario (`ADMIN`), el mapeo desde el JWT es 1:1.

---

## Estructura

```text
product-service/
├── src/
│   ├── main.ts                     # bootstrap microservicio TCP + ValidationPipe
│   ├── app.module.ts
│   ├── prisma/                     # PrismaModule (@Global) + PrismaService (adapter-pg)
│   ├── common/                     # Role enum, ActorDto, helpers de autorización
│   └── pets/
│       ├── pets.controller.ts      # @MessagePattern('pet.*')
│       ├── pets.service.ts         # CRUD mascotas + autorización
│       ├── clinical.service.ts     # vacunas / cirugías / diagnósticos
│       └── dto/                    # DTOs class-validator + envelopes por operación
├── prisma/schema.prisma
├── Dockerfile
└── docker-compose.yml              # product-db (+ product-service)
```
