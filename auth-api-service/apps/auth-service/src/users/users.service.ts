import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Role, User } from '@prisma/client';

/** Vista pública de un usuario: nunca incluye el hash de la contraseña. */
export type PublicUser = Pick<User, 'id' | 'name' | 'email' | 'role'>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOneByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  /**
   * Lista usuarios para selectores del panel (p. ej. dueños de mascotas).
   * Filtra por rol opcionalmente y NUNCA devuelve la contraseña.
   */
  async listUsers(role?: Role): Promise<PublicUser[]> {
    return this.prisma.user.findMany({
      where: role ? { role } : undefined,
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOneByResetToken(token: string): Promise<User | null> {
    return this.prisma.user.findFirst({ where: { passwordResetToken: token } });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }
}