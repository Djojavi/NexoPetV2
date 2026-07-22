import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

type JwtPayload = {
  sub: string;
  email: string;
  role: string;
  name: string;
};

export type AuthenticatedUser = {
  userId: string;
  email: string;
  role: string;
  name: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super_secret_key_2026',
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    // El payload contiene { sub, email, role, name } y se expone en req.user
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      name: payload.name,
    };
  }
}