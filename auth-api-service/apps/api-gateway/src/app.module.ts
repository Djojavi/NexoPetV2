import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtStrategy } from './auth/jwt.strategy';
import { PetsController } from './pets/pets.controller';
import { UsersController } from './users/users.controller';
import { MetricsModule } from './metrics/metrics.module';

@Module({
  imports: [
    MetricsModule,
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.AUTH_SERVICE_HOST || 'auth-service',
          port: Number(process.env.AUTH_SERVICE_PORT) || 3001,
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
  controllers: [AppController, PetsController, UsersController],
  providers: [AppService, JwtStrategy],
})
export class AppModule {}
