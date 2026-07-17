# Integrante 4 — Chat, DevOps, Docker y Presentación

## Objetivo

Integrar toda la infraestructura del proyecto.

---

## Tecnologías

- NestJS
- Socket.io
- Docker Compose
- Prometheus
- Grafana
- GitHub Actions

---

## Chat Service

Crear:

```
chat-service/
```

---

### Socket.io

Implementar eventos:

```
connect

disconnect

sendMessage

receiveMessage
```

---

### Mensajes

Enviar:

- Usuario
- Mensaje
- Hora

---

### Docker

Crear Dockerfile.

---

## Docker Compose

Crear:

```
docker-compose.yml
```

que levante:

```
frontend

gateway

auth-service

product-service

chat-service

postgres-auth

postgres-product

postgres-chat

prometheus

grafana
```

Verificar funcionamiento con:

```
docker compose up
```

---

## Monitoreo

Instalar:

```
Prometheus
```

Configurar métricas de NestJS.

Crear dashboard en:

```
Grafana
```

Mostrar:

- Requests por segundo
- Tiempo de respuesta
- Estado de los servicios

---

## Logs

Implementar:

- Winston

o

- Pino

Registrar:

- Login
- Errores
- CRUD
- Chat

---

## GitHub Actions

Crear:

```
.github/workflows/main.yml
```

Pipeline:

```
npm install

↓

npm run build

↓

npm test

↓

docker build
```

## Entregables

- Chat Service
- Docker Compose
- Prometheus
- Grafana
- GitHub Actions
- Diagramas
- Presentación

---