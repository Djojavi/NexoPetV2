# NexoPet — Descripción del Proyecto

Documento de contexto general del proyecto: qué es, qué hace, cómo está construido y con qué tecnologías. Sirve como punto de entrada para entender el sistema sin necesidad de leer el código.

---

## 1. ¿Qué es NexoPet?

**NexoPet** es una **plataforma web centralizada de historiales clínicos digitales para mascotas con tele-consulta integrada**.

El sistema conecta a **clínicas veterinarias** con los **dueños de mascotas** alrededor de dos ejes:

1. **Expediente clínico digital.** Cada mascota tiene un historial médico completo (vacunas, cirugías, diagnósticos) que el veterinario gestiona y el dueño puede consultar.
2. **Tele-consulta en tiempo real.** Dueño y veterinario se comunican mediante un chat en vivo (WebSockets), permitiendo consultas remotas sin necesidad de acudir físicamente a la clínica.

Es un proyecto académico (aplicativo web) desarrollado en equipo, con un fuerte énfasis en **seguridad, trazabilidad y protección de datos clínicos**.

---

## 2. Roles del sistema

El sistema define tres roles (`enum Role`):

| Rol | Descripción | Capacidades principales |
|-----|-------------|-------------------------|
| **CLIENT** (Cliente / Dueño) | Dueño de una o más mascotas. Rol por defecto en el registro público. | Ver sus mascotas y su historial clínico; chatear con veterinarios. |
| **VET** (Veterinario) | Personal clínico. | Ver todas las mascotas, gestionar el historial clínico (crear/editar vacunas, cirugías, diagnósticos), reasignar dueño de una mascota, chatear con clientes. |
| **ADMIN** (Administrador) | Gestión de la plataforma. | Acceso a rutas de administración (`/dashboard/admin`); mismas capacidades clínicas que VET a nivel de permisos, más gestión de usuarios (en desarrollo). |

> El registro público **siempre** fuerza el rol `CLIENT`. La creación de veterinarios/administradores está reservada a endpoints administrativos (evita escalada de privilegios).

---

## 3. Funcionalidad principal

### 3.1 Autenticación y gestión de sesión
- Registro (signup), inicio de sesión (login) y cierre de sesión.
- Recuperación de contraseña por correo, extremo a extremo (token hasheado, con expiración de 1 hora).
- **MFA (autenticación de dos factores) TOTP** opcional: enrolamiento con código QR, códigos de respaldo de un solo uso, verificación en el login.

### 3.2 Historial clínico (CRUD de mascotas y ficha médica)
- **Mascotas:** alta, edición, baja y listado. Datos: nombre, especie, raza, fecha de nacimiento, peso, sexo, foto, notas y dueño.
- **Vacunas:** nombre, fecha de aplicación, próxima dosis, número de lote, notas.
- **Cirugías:** tipo, fecha, descripción, complicaciones.
- **Diagnósticos:** enfermedad, si es crónica, fecha de diagnóstico, tratamiento, notas.
- **Reasignación de dueño:** un VET/ADMIN puede transferir una mascota a otro dueño (operación auditada).

### 3.3 Tele-consulta (chat en tiempo real)
- Mensajería instantánea entre cliente y veterinario vía **Socket.IO**.
- Indicadores de "escribiendo…" (typing / stop_typing).
- Solo se permiten conversaciones legítimas **CLIENT ↔ VET** (validado en el servidor).
- Entrega en tiempo real por *rooms* derivadas de la identidad del usuario.

### 3.4 Dashboard
- Panel principal diferenciado según el rol, con listado de mascotas, tarjetas de estadísticas, buscador, y navegación lateral.
- Página de seguridad (`/dashboard/seguridad`) para gestionar la MFA.

---

## 4. Arquitectura

### Tipo: **Monolítica**

NexoPet es una **aplicación monolítica**: un **único proceso Node.js** sirve simultáneamente tres responsabilidades que en otras arquitecturas estarían separadas:

```
                    ┌─────────────────────────────────────────┐
                    │         Proceso Node.js único            │
                    │            (server.ts)                   │
                    │                                          │
   Navegador  ──────┤  1. Frontend Next.js (App Router, SSR)   │
   (React)          │  2. API REST (route handlers de Next)    │
   Socket.IO ───────┤  3. Servidor WebSocket (Socket.IO)       │
                    │                                          │
                    └──────────────────┬───────────────────────┘
                                       │  Prisma ORM
                                       ▼
                              ┌─────────────────┐
                              │   PostgreSQL    │
                              └─────────────────┘
```

**Punto de entrada:** [server.ts](server.ts) crea un servidor HTTP propio (custom server de Next) y monta encima el servidor de Socket.IO. Esto permite que el WebSocket comparta el mismo puerto, proceso y sesión de autenticación que el resto de la app.

**Persistencia:** toda la información vive en una única base de datos **PostgreSQL**, accedida mediante **Prisma ORM**. No hay microservicios, colas de mensajes externas ni bases de datos separadas por dominio.

**Ventaja para este proyecto:** despliegue simple (un solo proceso), sesión compartida entre HTTP y WebSocket sin sincronización adicional, y coherencia transaccional directa (la auditoría y las operaciones de negocio pueden compartir la misma transacción de base de datos).

---

## 5. Stack tecnológico

| Capa | Tecnología | Uso |
|------|-----------|-----|
| **Framework / Runtime** | Next.js 14 (App Router) sobre Node.js 20 | Frontend SSR + API REST |
| **Lenguaje** | TypeScript | Todo el código (front y back) |
| **UI** | React 18, Tailwind CSS, shadcn/ui, Base UI, lucide-react, sonner | Componentes e interfaz |
| **Temas** | next-themes, tw-animate-css | Modo claro/oscuro y animaciones |
| **Base de datos** | PostgreSQL | Persistencia |
| **ORM** | Prisma 5 | Acceso a datos y migraciones |
| **Autenticación** | NextAuth.js v5 (Auth.js) + bcrypt | Sesiones JWT, hash de contraseñas |
| **MFA** | otplib + qrcode | TOTP de dos factores |
| **Tiempo real** | Socket.IO 4 (servidor y cliente) | Chat de tele-consulta |
| **Validación** | Zod 4 | Esquemas de validación (front y back) |
| **Formularios** | react-hook-form + @hookform/resolvers | Manejo de formularios |
| **Correo** | nodemailer (Ethereal en desarrollo) | Recuperación de contraseña |
| **Cifrado** | `crypto` nativo de Node (AES-256-GCM, SHA-256) | Cifrado en reposo y auditoría |
| **Infra local** | Docker Compose | PostgreSQL local |
| **Tooling** | tsx, ESLint, PostCSS | Ejecución TS, linting, build de CSS |

---

## 6. Modelo de datos

Definido en [prisma/schema.prisma](prisma/schema.prisma). Entidades principales:

**Dominio de negocio:**
- `User` — usuarios (email, hash de contraseña, nombre, rol, teléfono, campos de MFA).
- `Pet` — mascotas, pertenecen a un `User` (dueño).
- `Vaccine`, `Surgery`, `Diagnosis` — historial clínico, cada uno pertenece a una `Pet`.
- `Message` — mensajes del chat entre dos usuarios (`fromUser` / `toUser`).
