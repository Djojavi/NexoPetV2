# ---------- Stage 1: build ----------
FROM node:20-alpine AS builder
# Prisma necesita openssl para su motor de consultas.
RUN apk add --no-cache openssl
WORKDIR /app

# Instala dependencias (incluye dev: se necesitan nest-cli y prisma para compilar/generar).
COPY package*.json ./
RUN npm ci

# Copia el resto del código y genera el cliente Prisma + compila.
COPY . .
RUN npx prisma generate
RUN npm run build

# ---------- Stage 2: runtime ----------
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production

# Se copian node_modules ya resueltos (incluyen el cliente Prisma generado y el CLI
# de Prisma para aplicar migraciones al arrancar).
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/package.json ./package.json

EXPOSE 3002

# Aplica migraciones pendientes y levanta el microservicio TCP.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
