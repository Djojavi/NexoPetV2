import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { RpcAllExceptionsFilter } from './common/filters/rpc-exception.filter';

async function bootstrap() {
  const host = process.env.PRODUCT_SERVICE_HOST || '0.0.0.0';
  const port = Number(process.env.PRODUCT_SERVICE_PORT) || 3002;

  // Microservicio TCP puro: solo el API Gateway lo consume, nunca el frontend.
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: { host, port },
    },
  );

  // Validación global (requisito del README: pesos > 0, nombres no vacíos, etc.).
  // `transform` instancia los DTOs anidados (@Type); `whitelist` descarta campos
  // no declarados (p. ej. un USER/cliente que intente colar `ownerId`).
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  // Traduce las excepciones a payloads con statusCode para que el gateway las re-mapee.
  app.useGlobalFilters(new RpcAllExceptionsFilter());

  await app.listen();
  console.log(`Product Microservice is listening on TCP ${host}:${port}`);
}
void bootstrap();
