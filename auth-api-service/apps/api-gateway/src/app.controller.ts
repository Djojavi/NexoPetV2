import { Controller, Post, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';
import {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
} from './auth/dto/auth.dto';
import { rpcCatch } from './common/rpc-catch';

@ApiTags('Auth')
@Controller('auth') // Todas las rutas empezarán con /auth
export class AppController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  @Post('register')
  register(@Body() body: RegisterDto) {
    // Enviamos el mensaje 'auth.register' por TCP al microservicio
    return this.authClient.send('auth.register', body).pipe(rpcCatch());
  }

  @Post('login')
  login(@Body() body: LoginDto) {
    // Enviamos el mensaje 'auth.login' por TCP al microservicio
    return this.authClient.send('auth.login', body).pipe(rpcCatch());
  }

  @Post('forgot-password')
  forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authClient.send('auth.forgot-password', body).pipe(rpcCatch());
  }

  @Post('reset-password')
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.authClient.send('auth.reset-password', body).pipe(rpcCatch());
  }
}