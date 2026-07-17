# Integrante 1 — Frontend (React)

## Objetivo

Construir toda la interfaz gráfica de la aplicación y conectarla con el API Gateway.

---

## Tecnologías

- React + Vite
- React Router
- Axios
- Socket.io Client
- CSS / Tailwind / Bootstrap (a elección)

---

## Responsabilidades

### 1. Crear el proyecto

```
frontend/
```

Inicializar React.

Configurar:

- React Router
- Axios
- Variables de entorno (.env)

---

### 2. Crear el sistema de navegación

Rutas:

```
/

login

register

forgot-password

dashboard

products

chat
```

Si el usuario no tiene JWT:

```
→ Login
```

Si tiene JWT válido:

```
→ Dashboard
```

---

### 3. Diseñar las pantallas

#### Login

Campos:

- Email
- Contraseña

Botones:

- Iniciar sesión
- Registrarse
- Olvidé contraseña

Al enviar:

```
POST /auth/login
```

Guardar el JWT en:

```
localStorage
```

---

#### Registro

Campos:

- Nombre
- Correo
- Contraseña
- Confirmar contraseña

Enviar:

```
POST /auth/register
```

---

#### Recuperación de contraseña

Formulario:

- Correo electrónico

Enviar:

```
POST /auth/forgot-password
```

---

#### Dashboard

Mostrar:

```
Bienvenido Usuario
```

Botones:

```
Productos

Chat

Cerrar sesión
```

---

#### CRUD Productos

Tabla:

- Nombre
- Precio
- Cantidad
- Descripción

Botones:

- Agregar
- Editar
- Eliminar
- Buscar

Consumir:

```
GET

POST

PUT

DELETE
```

del Gateway.

---

#### Chat

Conectar mediante Socket.io.

Mostrar:

- Usuarios conectados
- Lista de mensajes
- Caja de texto
- Botón Enviar

---

### 4. Consumir únicamente el Gateway

Nunca llamar directamente a los microservicios.

```
Frontend

↓

Gateway
```

---

### 5. Manejo del JWT

Agregar automáticamente el header:

```
Authorization: Bearer TOKEN
```

a todas las peticiones.

---

### 6. Manejo de errores

Mostrar mensajes como:

- Login incorrecto
- Correo ya registrado
- Producto creado correctamente
- Producto eliminado correctamente

---

### 7. Docker

Crear:

```
Dockerfile
```

para el frontend.

---

## Entregables

- Frontend completo
- Dockerfile
- Variables de entorno
- README del frontend

---