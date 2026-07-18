import { Controller, Post, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('auth') // Todas las rutas empezarán con /auth
export class AppController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  @Post('register')
  register(@Body() body: any) {
    // Enviamos el mensaje 'auth.register' por TCP al microservicio
    return this.authClient.send('auth.register', body);
  }

  @Post('login')
  login(@Body() body: any) {
    // Enviamos el mensaje 'auth.login' por TCP al microservicio
    return this.authClient.send('auth.login', body);
  }
}