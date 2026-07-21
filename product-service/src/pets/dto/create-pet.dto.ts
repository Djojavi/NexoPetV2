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

export class CreatePetDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la mascota es obligatorio' })
  name: string;

  @IsEnum(Species, { message: 'Especie inválida' })
  species: Species;

  @IsEnum(Sex, { message: 'Sexo inválido' })
  sex: Sex;

  @IsOptional()
  @IsString()
  breed?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'birthDate debe ser una fecha ISO (YYYY-MM-DD)' },
  )
  birthDate?: string;

  // Requisito del README: no se permiten pesos negativos ni cero.
  @IsOptional()
  @IsPositive({ message: 'El peso debe ser mayor que 0' })
  weight?: number;

  @IsOptional()
  @IsUrl({}, { message: 'photoUrl debe ser una URL válida' })
  photoUrl?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  // Solo lo usan VET/ADMIN al crear la mascota de un cliente. Para un CLIENT se
  // ignora (el dueño siempre es él mismo). La regla se aplica en el servicio.
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  ownerId?: string;
}
