import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  IsUUID,
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

  // Cliente dueño de la mascota. Obligatorio cuando crea el ADMIN (veterinario):
  // toda mascota debe quedar asociada a un cliente. Para un USER (cliente) se ignora
  // (el dueño siempre es él mismo). La obligatoriedad para ADMIN se valida en el
  // servicio; aquí solo garantizamos el formato (el id de usuario en auth es un UUID).
  @IsOptional()
  @IsUUID('all', { message: 'ownerId debe ser el UUID de un cliente válido' })
  ownerId?: string;
}
