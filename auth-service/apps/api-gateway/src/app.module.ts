import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';

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
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}