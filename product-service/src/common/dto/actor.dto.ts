import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Role } from '../enums/role.enum';

/**
 * Identidad del usuario que origina la petición.
 *
 * El API Gateway valida el JWT (Bearer) y reenvía este `actor` dentro del payload
 * de cada mensaje TCP. product-service confía en él —igual que auth-service confía
 * en sus payloads— porque la autenticación vive en el gateway. La validación por
 * `class-validator` solo garantiza que la forma sea correcta.
 */
export class ActorDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEnum(Role)
  role: Role;
}
