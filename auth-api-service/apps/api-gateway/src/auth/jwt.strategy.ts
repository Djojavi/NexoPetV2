import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super_secret_key_2026',
    });
  }

  async validate(payload: any) {
    // El payload contiene { sub, email, role } — lo devolvemos para que esté disponible en req.user
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}