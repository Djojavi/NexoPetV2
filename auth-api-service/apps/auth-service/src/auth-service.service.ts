import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users/users.service';
import { EmailService } from './email/email.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthServiceService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
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
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
    
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

  // 3. SOLICITAR RESTABLECIMIENTO DE CONTRASEÑA
  async forgotPassword(data: { email: string }) {
    const user = await this.usersService.findOneByEmail(data.email);

    // Respondemos siempre con éxito para no revelar si el correo existe
    if (!user) {
      return { message: 'Si el correo existe, recibirás un enlace de restablecimiento.' };
    }

    // Generamos un token seguro y su fecha de expiración (1 hora)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000);

    await this.usersService.update(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpiry: resetExpiry,
    });

    // Construimos la URL del frontend para el reset
    const authUrl = process.env.AUTH_URL ?? 'http://localhost:3000';
    const resetUrl = `${authUrl}/reset-password?token=${resetToken}`;

    await this.emailService.sendPasswordResetEmail(user.email, resetUrl);

    return { message: 'Si el correo existe, recibirás un enlace de restablecimiento.' };
  }

  // 4. RESTABLECER CONTRASEÑA
  async resetPassword(data: { token: string; newPassword: string }) {
    const user = await this.usersService.findOneByResetToken(data.token);

    if (!user || !user.passwordResetExpiry) {
      throw new BadRequestException('Token inválido o expirado');
    }

    if (user.passwordResetExpiry < new Date()) {
      throw new BadRequestException('El token ha expirado');
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    await this.usersService.update(user.id, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpiry: null,
    });

    return { message: 'Contraseña restablecida exitosamente' };
  }
}