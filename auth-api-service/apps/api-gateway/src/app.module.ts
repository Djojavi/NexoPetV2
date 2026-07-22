import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtStrategy } from './auth/jwt.strategy';
import { PetsController } from './pets/pets.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE', // Un "apodo" para inyectarlo después
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1', // O 'auth-service' si ambos estuvieran en Docker
          port: 3001,        // El mismo puerto que configuramos en el main.ts de Auth
        },
      },
      {
        name: 'PRODUCT_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.PRODUCT_SERVICE_HOST || '127.0.0.1',
          port: Number(process.env.PRODUCT_SERVICE_PORT) || 3002,
        },
      },
    ]),
  ],
  controllers: [AppController, PetsController],
  providers: [AppService, JwtStrategy],
})
export class AppModule {}