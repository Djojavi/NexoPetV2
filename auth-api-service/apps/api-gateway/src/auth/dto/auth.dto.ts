import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Juan Perez' })
  name: string;

  @ApiProperty({ example: 'juan@example.com' })
  email: string;

  @ApiProperty({ example: 'mi_password_seguro' })
  password: string;
}

export class LoginDto {
  @ApiProperty({ example: 'juan@example.com' })
  email: string;

  @ApiProperty({ example: 'mi_password_seguro' })
  password: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'juan@example.com' })
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'd6a2c2f8b9f1e6...' })
  token: string;

  @ApiProperty({ example: 'NuevaPassword123!' })
  newPassword: string;
}
