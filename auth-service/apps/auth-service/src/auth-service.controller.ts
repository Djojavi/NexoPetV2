import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthServiceService } from './auth-service.service';

@Controller()
export class AuthServiceController {
  constructor(private readonly authService: AuthServiceService) {}

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
}