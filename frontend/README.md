# NexoPet — Frontend

SPA de la clínica veterinaria **NexoPet**: autenticación, gestión de mascotas con
historial clínico y tele-consulta por chat. Es el cliente de una arquitectura de
microservicios (API Gateway + auth-service + product-service + chat-service).

Construido con **React + TypeScript + Vite** y **Tailwind CSS v4**.

> Los requisitos originales del proyecto se conservan en
> [`README.requisitos.md`](./README.requisitos.md).

---

## Stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v4** (tokens de tema en `src/index.css` con `@theme`)
- **React Router** para el enrutado
- **Axios** para HTTP (con interceptores de auth y normalización de errores)
- **socket.io-client** para el chat en tiempo real

---

## Desarrollo

### Requisitos previos

- Node.js 20+ (se probó con Node 22)
- El **API Gateway corriendo en `http://localhost:3000`** (ver
  `auth-api-service/instructions.md`). Sin él, login/registro no funcionan.
- Opcional: el chat-service en `http://localhost:3004` para probar el chat.

### Pasos

```bash
npm install
npm run dev
```

La app queda en `http://localhost:5173`. Vite proxea en desarrollo (ver
`vite.config.ts`), evitando problemas de CORS con el gateway:

- `/api`       → `http://localhost:3000` (API Gateway)
- `/socket.io` → `VITE_CHAT_URL` con `ws: true` (chat-service)

### Scripts

| Comando           | Descripción                                  |
| ----------------- | -------------------------------------------- |
| `npm run dev`     | Servidor de desarrollo con HMR               |
| `npm run build`   | Chequeo de tipos (`tsc -b`) + build de Vite  |
| `npm run preview` | Sirve el build de producción localmente      |
| `npm run lint`    | Linter (oxlint)                              |

---

## Variables de entorno

Se declaran en `.env` (local, ignorado por git). Plantilla en `.env.example`.

| Variable         | Ejemplo (dev)           | Descripción                                                |
| ---------------- | ----------------------- | ---------------------------------------------------------- |
| `VITE_API_URL`   | `/api`                  | Base de las peticiones HTTP. En dev el proxy la resuelve.  |
| `VITE_CHAT_URL`  | `http://localhost:3004` | Destino del socket del chat-service.                       |

En **producción (Docker)** el `Dockerfile` fija `VITE_API_URL=/api` y deja
`VITE_CHAT_URL` sin definir a propósito: el socket se conecta al **mismo origen** y
nginx proxea `/api` y `/socket.io` hacia los microservicios.

---

## Build con Docker

Imagen multi-stage: build con `node:22-alpine` → servido con `nginx:alpine`
(incluye fallback SPA y proxy a los microservicios en `nginx.conf`).

```bash
# desde frontend/
docker build -t nexopet-frontend .
docker run -p 8080:80 nexopet-frontend
```

Queda en `http://localhost:8080`. Para que el proxy funcione, los servicios deben
ser alcanzables por los hosts `gateway:3000` y `chat-service:3004` (nombres
previstos para el `docker-compose` de DevOps; se ajustan allí).

---

## Contratos consumidos (backend)

Verificados contra el código de `auth-api-service/`. El JWT del login incluye
`role` y viaja como `Authorization: Bearer <token>` en cada petición.

| Método + ruta                | Body / entrada              | Respuesta                                                        |
| ---------------------------- | --------------------------- | --------------------------------------------------------------- |
| `POST /api/auth/register`    | `{ name, email, password }` | Usuario sin password, con `role` (siempre `USER` en registro).  |
| `POST /api/auth/login`       | `{ email, password }`       | `{ access_token, user: { id, name, email, role } }`             |

**Errores** (NestJS): `{ statusCode, message }`, donde `message` puede ser string o
arreglo de strings. `getErrorMessage()` (en `src/api/client.ts`) los normaliza a un
mensaje en español; los errores de red devuelven "No se pudo conectar con el servidor".

**Roles → etiqueta UI** (`src/types/index.ts`): `USER`/`CLIENT` → "Cliente",
`VET` → "Veterinario", `ADMIN` → "Administrador"; cualquier otro → "Usuario".

---

## Contratos pendientes de acordar con el equipo

Estas piezas aún **no existen** o no están confirmadas en el backend. El frontend ya
las consume de forma tolerante (mensajes amables, sin romperse) y viven detrás de
tipos/constantes centralizadas para ajustarlas en un solo lugar cuando se publiquen.

1. **Rutas de mascotas en el gateway.** El product-service es TCP y aún no está
   expuesto por HTTP. Propuesta del frontend (en `src/api/pets.api.ts`):
   - `GET /api/pets?search=`, `GET /api/pets/:id`, `POST /api/pets`,
     `PATCH /api/pets/:id`, `DELETE /api/pets/:id`
   - Sub-recursos clínicos: `/api/pets/:id/vaccines`, `/api/pets/:id/surgeries`,
     `/api/pets/:id/diagnoses`
   - El `ownerId` **lo deriva el backend** del actor autenticado; el frontend no lo
     envía. Campo clínico de fecha del diagnóstico: `diagnosedAt` (ISO).

2. **`POST /api/auth/forgot-password`.** No implementado. La UI captura el error y
   muestra "El servicio de recuperación de contraseña estará disponible próximamente".

3. **Eventos y handshake del chat.** Nombres tentativos en `src/lib/chatEvents.ts`
   (`sendMessage`, `receiveMessage`, `typing`, `stop_typing`, `users_online`) y la
   forma de los payloads (`content`, `senderId`, `senderName`, `createdAt`) son
   suposiciones a confirmar. El **handshake envía el JWT** en `auth: { token }`
   (`src/lib/socket.ts`); el chat-service lo usa para validar conversaciones
   CLIENT ↔ VET.

4. **⚠️ Desajuste de roles a resolver en backend.** `auth-service` emite el enum
   `{ USER, ADMIN }`, pero `product-service` valida el rol del actor contra
   `{ CLIENT, VET, ADMIN }`. Ambos enums **no coinciden**. El frontend ya es
   tolerante: tipa `role` como union amplia `'USER' | 'ADMIN' | 'CLIENT' | 'VET'` y
   trata cualquier valor desconocido como rol básico. **No hay lógica de permisos
   rígida en el cliente**: la autorización la resuelve el backend.

---

## Estructura

```
src/
  api/         Cliente Axios y funciones por dominio (auth, pets)
  components/
    ui/        Componentes reutilizables (Button, Input, Modal, Toast, …)
    layout/    AppLayout, AuthLayout, guards de ruta
    pets/      Formulario de mascotas
  context/     AuthContext (sesión + JWT)
  lib/         Utilidades (validadores, debounce, socket, eventos de chat)
  pages/       Pantallas (Login, Register, Dashboard, Pets, Chat, …)
  types/       Tipos del dominio y mapas de etiquetas en español
```
