import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PetsService } from './pets.service';
import { ClinicalService } from './clinical.service';
import {
  PetCreateRequest,
  PetFindAllRequest,
  PetFindOneRequest,
  PetRemoveRequest,
  PetUpdateRequest,
} from './dto/requests/pet.requests';
import {
  ClinicalFindAllRequest,
  DiagnosisCreateRequest,
  SurgeryCreateRequest,
  VaccineCreateRequest,
} from './dto/requests/clinical.requests';

/**
 * Punto de entrada TCP del microservicio. Solo el API Gateway envía estos mensajes
 * (nunca el frontend). El `actor` de cada payload trae la identidad ya validada por
 * el gateway; la autorización por rol/ownership se resuelve en los servicios.
 */
@Controller()
export class PetsController {
  constructor(
    private readonly petsService: PetsService,
    private readonly clinicalService: ClinicalService,
  ) {}

  // ----- Mascotas -----
  @MessagePattern('pet.findAll')
  findAll(@Payload() payload: PetFindAllRequest) {
    return this.petsService.findAll(payload.actor, payload.search);
  }

  @MessagePattern('pet.findOne')
  findOne(@Payload() payload: PetFindOneRequest) {
    return this.petsService.findOne(payload.actor, payload.id);
  }

  @MessagePattern('pet.create')
  create(@Payload() payload: PetCreateRequest) {
    return this.petsService.create(payload.actor, payload.data);
  }

  @MessagePattern('pet.update')
  update(@Payload() payload: PetUpdateRequest) {
    return this.petsService.update(payload.actor, payload.id, payload.data);
  }

  @MessagePattern('pet.remove')
  remove(@Payload() payload: PetRemoveRequest) {
    return this.petsService.remove(payload.actor, payload.id);
  }

  // ----- Vacunas -----
  @MessagePattern('pet.vaccine.create')
  createVaccine(@Payload() payload: VaccineCreateRequest) {
    return this.clinicalService.createVaccine(
      payload.actor,
      payload.petId,
      payload.data,
    );
  }

  @MessagePattern('pet.vaccine.findAll')
  findVaccines(@Payload() payload: ClinicalFindAllRequest) {
    return this.clinicalService.findVaccines(payload.actor, payload.petId);
  }

  // ----- Cirugías -----
  @MessagePattern('pet.surgery.create')
  createSurgery(@Payload() payload: SurgeryCreateRequest) {
    return this.clinicalService.createSurgery(
      payload.actor,
      payload.petId,
      payload.data,
    );
  }

  @MessagePattern('pet.surgery.findAll')
  findSurgeries(@Payload() payload: ClinicalFindAllRequest) {
    return this.clinicalService.findSurgeries(payload.actor, payload.petId);
  }

  // ----- Diagnósticos -----
  @MessagePattern('pet.diagnosis.create')
  createDiagnosis(@Payload() payload: DiagnosisCreateRequest) {
    return this.clinicalService.createDiagnosis(
      payload.actor,
      payload.petId,
      payload.data,
    );
  }

  @MessagePattern('pet.diagnosis.findAll')
  findDiagnoses(@Payload() payload: ClinicalFindAllRequest) {
    return this.clinicalService.findDiagnoses(payload.actor, payload.petId);
  }
}
