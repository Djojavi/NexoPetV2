import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateSurgeryDto {
  @IsString()
  @IsNotEmpty({ message: 'El tipo de cirugía es obligatorio' })
  type: string;

  @IsDateString({}, { message: 'date debe ser una fecha ISO (YYYY-MM-DD)' })
  date: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  complications?: string;
}
