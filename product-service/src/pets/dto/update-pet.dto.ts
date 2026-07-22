import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
} from 'class-validator';
import { Species, Sex } from '@prisma/client';

// Versión "parcial" de CreatePetDto (todos los campos opcionales). Se define a mano
// para no depender de @nestjs/mapped-types.
export class UpdatePetDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  name?: string;

  @IsOptional()
  @IsEnum(Species, { message: 'Especie inválida' })
  species?: Species;

  @IsOptional()
  @IsEnum(Sex, { message: 'Sexo inválido' })
  sex?: Sex;

  @IsOptional()
  @IsString()
  breed?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'birthDate debe ser una fecha ISO (YYYY-MM-DD)' },
  )
  birthDate?: string;

  @IsOptional()
  @IsPositive({ message: 'El peso debe ser mayor que 0' })
  weight?: number;

  @IsOptional()
  @IsUrl({}, { message: 'photoUrl debe ser una URL válida' })
  photoUrl?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  // Reasignación de dueño: solo ADMIN (se descarta para USER/cliente en el servicio).
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  ownerId?: string;
}
