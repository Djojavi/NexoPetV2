// Configuración de Prisma CLI (migraciones / generate). Mismo patrón que auth-service:
// se carga el .env y se apunta al schema y a la carpeta de migraciones de este servicio.
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
