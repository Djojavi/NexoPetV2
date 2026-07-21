import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { ActorDto } from '../../../common/dto/actor.dto';
import { CreateVaccineDto } from '../create-vaccine.dto';
import { CreateSurgeryDto } from '../create-surgery.dto';
import { CreateDiagnosisDto } from '../create-diagnosis.dto';

/** Envelopes de los mensajes de historial clínico (`pet.vaccine.*`, etc.). */

export class ClinicalFindAllRequest {
  @ValidateNested()
  @Type(() => ActorDto)
  actor: ActorDto;

  @IsString()
  @IsNotEmpty()
  petId: string;
}

export class VaccineCreateRequest {
  @ValidateNested()
  @Type(() => ActorDto)
  actor: ActorDto;

  @IsString()
  @IsNotEmpty()
  petId: string;

  @ValidateNested()
  @Type(() => CreateVaccineDto)
  data: CreateVaccineDto;
}

export class SurgeryCreateRequest {
  @ValidateNested()
  @Type(() => ActorDto)
  actor: ActorDto;

  @IsString()
  @IsNotEmpty()
  petId: string;

  @ValidateNested()
  @Type(() => CreateSurgeryDto)
  data: CreateSurgeryDto;
}

export class DiagnosisCreateRequest {
  @ValidateNested()
  @Type(() => ActorDto)
  actor: ActorDto;

  @IsString()
  @IsNotEmpty()
  petId: string;

  @ValidateNested()
  @Type(() => CreateDiagnosisDto)
  data: CreateDiagnosisDto;
}
