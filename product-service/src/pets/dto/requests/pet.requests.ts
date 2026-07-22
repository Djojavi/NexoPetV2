import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ActorDto } from '../../../common/dto/actor.dto';
import { CreatePetDto } from '../create-pet.dto';
import { UpdatePetDto } from '../update-pet.dto';

/**
 * Envelopes de los mensajes `pet.*`. Cada patrón recibe un `actor` (identidad
 * validada por el gateway) más los datos propios de la operación. La validación
 * anidada requiere `@ValidateNested` + `@Type` y el `ValidationPipe({ transform: true })`.
 */

export class PetCreateRequest {
  @ValidateNested()
  @Type(() => ActorDto)
  actor: ActorDto;

  @ValidateNested()
  @Type(() => CreatePetDto)
  data: CreatePetDto;
}

export class PetFindAllRequest {
  @ValidateNested()
  @Type(() => ActorDto)
  actor: ActorDto;

  @IsOptional()
  @IsString()
  search?: string;
}

export class PetFindOneRequest {
  @ValidateNested()
  @Type(() => ActorDto)
  actor: ActorDto;

  @IsString()
  @IsNotEmpty()
  id: string;
}

export class PetUpdateRequest {
  @ValidateNested()
  @Type(() => ActorDto)
  actor: ActorDto;

  @IsString()
  @IsNotEmpty()
  id: string;

  @ValidateNested()
  @Type(() => UpdatePetDto)
  data: UpdatePetDto;
}

export class PetRemoveRequest {
  @ValidateNested()
  @Type(() => ActorDto)
  actor: ActorDto;

  @IsString()
  @IsNotEmpty()
  id: string;
}

export class PetReassignOwnerRequest {
  @ValidateNested()
  @Type(() => ActorDto)
  actor: ActorDto;

  @IsString()
  @IsNotEmpty()
  id: string;

  @IsUUID('all', { message: 'ownerId debe ser el UUID de un cliente válido' })
  ownerId: string;
}
