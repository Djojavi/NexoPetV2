import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AuthServiceModule } from './auth-service.module'; // O AppModule, según cómo se llame tu archivo

async function bootstrap() {
  // En lugar de create(), usamos createMicroservice()
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthServiceModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0', // Escucha en todas las interfaces (necesario para Docker)
        port: 3001,      // Puerto interno para el microservicio de Auth
      },
    },
  );
  
  await app.listen();
  console.log('Auth Microservice is listening on TCP port 3001');
}
bootstrap();