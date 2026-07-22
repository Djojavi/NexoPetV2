import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { RpcAllExceptionsFilter } from './common/filters/rpc-exception.filter';

async function bootstrap() {
  const host = process.env.PRODUCT_SERVICE_HOST || '0.0.0.0';
  const tcpPort = Number(process.env.PRODUCT_SERVICE_PORT) || 3002;
  const metricsPort = Number(process.env.METRICS_PORT) || 3003;

  // App híbrida: HTTP para métricas + TCP para el API Gateway
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: { host, port: tcpPort },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );
  app.useGlobalFilters(new RpcAllExceptionsFilter());

  await app.startAllMicroservices();
  await app.listen(metricsPort);
  console.log(`Product Microservice is listening on TCP ${host}:${tcpPort}`);
  console.log(`Metrics available at http://localhost:${metricsPort}/metrics`);
}
void bootstrap();
