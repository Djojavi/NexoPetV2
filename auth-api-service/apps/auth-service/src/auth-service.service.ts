import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthServiceService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // 1. REGISTRO
  async register(data: any) {
    // Verificamos si el usuario ya existe
    const userExists = await this.usersService.findOneByEmail(data.email);
    if (userExists) {
      throw new BadRequestException('El correo ya está registrado');
    }

    // Hasheamos la contraseña antes de guardarla (10 rondas de sal)
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Creamos el usuario en la base de datos
    const newUser = await this.usersService.create({
      email: data.email,
      name: data.name,
      password: hashedPassword,
    });

    // Quitamos la contraseña de la respuesta por seguridad
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  // 2. LOGIN
  async login(data: any) {
    // Buscamos al usuario por su email
    const user = await this.usersService.findOneByEmail(data.email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Comparamos la contraseña en texto plano con el hash
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generamos el payload para el JWT (incluimos el rol para que los demás servicios lo puedan leer)
    const payload = { sub: user.id, email: user.email, role: user.role };
    
    // Retornamos el token firmado
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    };
  }
}