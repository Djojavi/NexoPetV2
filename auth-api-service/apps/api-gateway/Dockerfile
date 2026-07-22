# ---------- Stage 1: build ----------
FROM node:20-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate --schema=apps/auth-service/prisma/schema.prisma
RUN npm run build api-gateway

# ---------- Stage 2: runtime ----------
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["node", "dist/apps/api-gateway/main"]
