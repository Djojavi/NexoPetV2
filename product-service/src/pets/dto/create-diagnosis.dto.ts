import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateDiagnosisDto {
  @IsString()
  @IsNotEmpty({ message: 'La enfermedad/diagnóstico es obligatorio' })
  disease: string;

  @IsDateString(
    {},
    { message: 'diagnosedAt debe ser una fecha ISO (YYYY-MM-DD)' },
  )
  diagnosedAt: string;

  @IsOptional()
  @IsBoolean()
  isChronic?: boolean;

  @IsOptional()
  @IsString()
  treatment?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
