import {
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { rpcCatch } from '../common/rpc-catch';

/**
 * UsersController — API Gateway
 *
 * Expone el listado de usuarios (para selectores del panel, p. ej. elegir el dueño
 * de una mascota). Solo el veterinario (ADMIN) puede consultarlo. Reenvía al
 * auth-service, que nunca devuelve la contraseña.
 */
@ApiTags('Users')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  @Get()
  list(@Request() req, @Query('role') role?: string) {
    if (req.user?.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Acceso denegado. Solo el veterinario puede listar los usuarios.',
      );
    }
    return this.authClient.send('auth.users.list', { role }).pipe(rpcCatch());
  }
}
