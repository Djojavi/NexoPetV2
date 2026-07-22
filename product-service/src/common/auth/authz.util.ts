import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ActorDto } from '../dto/actor.dto';
import { Role } from '../enums/role.enum';

/** ADMIN es el "personal médico" (veterinario): puede gestionar cualquier mascota. */
export function isStaff(role: Role): boolean {
  return role === Role.ADMIN;
}

/**
 * Garantiza que llegó un actor válido. La autenticación real la hace el gateway;
 * aquí solo evitamos operar sin identidad (defensa en profundidad).
 */
export function assertActor(actor?: ActorDto): asserts actor is ActorDto {
  if (!actor || !actor.userId || !actor.role) {
    throw new UnauthorizedException('No autorizado');
  }
}

/** Solo ADMIN puede ejecutar la acción (crear historial clínico, borrar, etc.). */
export function assertStaff(
  actor: ActorDto,
  message = 'Acceso denegado',
): void {
  if (!isStaff(actor.role)) {
    throw new ForbiddenException(message);
  }
}

/**
 * Un USER (cliente) solo puede acceder a recursos de mascotas de las que es dueño.
 * ADMIN (veterinario) puede acceder a cualquiera.
 */
export function assertOwnerOrStaff(actor: ActorDto, ownerId: string): void {
  if (actor.role === Role.USER && ownerId !== actor.userId) {
    throw new ForbiddenException('Acceso denegado');
  }
}
