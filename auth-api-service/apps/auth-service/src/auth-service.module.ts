import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // <-- Importa esto
import { JwtModule } from '@nestjs/jwt';
import { AuthServiceController } from './auth-service.controller';
import { AuthServiceService } from './auth-service.service';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    // Carga el archivo .env globalmente
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', // Asegura que lea el .env de la raíz
    }),
    PrismaModule, 
    UsersModule,  
    JwtModule.register({
      global: true, 
      secret: process.env.JWT_SECRET || 'super_secret_key_2026', 
      signOptions: { expiresIn: '1h' }, 
    }),
  ],
  controllers: [AuthServiceController],
  providers: [AuthServiceService],
})
export class AuthServiceModule {}