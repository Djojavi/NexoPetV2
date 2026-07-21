import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateVaccineDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la vacuna es obligatorio' })
  name: string;

  @IsDateString(
    {},
    { message: 'appliedDate debe ser una fecha ISO (YYYY-MM-DD)' },
  )
  appliedDate: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'nextDoseDate debe ser una fecha ISO (YYYY-MM-DD)' },
  )
  nextDoseDate?: string;

  @IsOptional()
  @IsString()
  batchNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
