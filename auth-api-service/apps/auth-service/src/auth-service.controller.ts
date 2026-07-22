import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthServiceService } from './auth-service.service';

@Controller()
export class AuthServiceController {
  constructor(private readonly authService: AuthServiceService) {}

  // Listado de usuarios (para selectores del panel; filtro opcional por rol)
  @MessagePattern('auth.users.list')
  async listUsers(@Payload() data?: { role?: string }) {
    return this.authService.listUsers(data?.role);
  }

  // Escuchamos el patrón 'auth.register'
  @MessagePattern('auth.register')
  async register(@Payload() data: any) {
    // Delegamos la lógica al servicio que creaste en el paso anterior
    return this.authService.register(data);
  }

  // Escuchamos el patrón 'auth.login'
  @MessagePattern('auth.login')
  async login(@Payload() data: any) {
    return this.authService.login(data);
  }

  // Escuchamos el patrón 'auth.forgot-password'
  @MessagePattern('auth.forgot-password')
  async forgotPassword(@Payload() data: { email: string }) {
    return this.authService.forgotPassword(data);
  }

  // Escuchamos el patrón 'auth.reset-password'
  @MessagePattern('auth.reset-password')
  async resetPassword(@Payload() data: { token: string; newPassword: string }) {
    return this.authService.resetPassword(data);
  }
}