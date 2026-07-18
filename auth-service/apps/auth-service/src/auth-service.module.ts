import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthServiceController } from './auth-service.controller';
import { AuthServiceService } from './auth-service.service';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    // 1. Conexión a la base de datos
    PrismaModule, 
    
    // 2. Módulo de operaciones de usuarios en BD
    UsersModule,  
    
    // 3. Configuración para generar tokens seguros
    JwtModule.register({
      global: true, 
      secret: process.env.JWT_SECRET || 'super_secret_key_2026', 
      signOptions: { expiresIn: '1h' }, 
    }),
  ],
  // 4. El controlador que escucha los mensajes TCP (auth.login, auth.register)
  controllers: [AuthServiceController],
  
  // 5. El servicio que tiene la lógica de encriptar contraseñas y firmar el JWT
  providers: [AuthServiceService],
})
export class AuthServiceModule {}