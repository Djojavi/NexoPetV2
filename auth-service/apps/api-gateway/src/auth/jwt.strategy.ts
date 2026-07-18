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
    // Aquí el payload es el objeto { sub: user.id, email: user.email } que definimos en Auth Service
    return { userId: payload.sub, email: payload.email };
  }
}