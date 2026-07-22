import { Injectable, NotFoundException } from '@nestjs/common';
import { Diagnosis, Pet, Surgery, Vaccine } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ActorDto } from '../common/dto/actor.dto';
import {
  assertActor,
  assertOwnerOrStaff,
  assertStaff,
} from '../common/auth/authz.util';
import { CreateVaccineDto } from './dto/create-vaccine.dto';
import { CreateSurgeryDto } from './dto/create-surgery.dto';
import { CreateDiagnosisDto } from './dto/create-diagnosis.dto';

const STAFF_ONLY_MESSAGE =
  'Acceso denegado. Solo el veterinario puede añadir historial clínico.';

/**
 * Historial clínico (vacunas, cirugías, diagnósticos). Todos son hijos de Pet.
 * Autorización:
 * - Crear: solo ADMIN (veterinario).
 * - Listar: ADMIN cualquiera; USER (cliente) solo si es dueño de la mascota.
 */
@Injectable()
export class ClinicalService {
  constructor(private readonly prisma: PrismaService) {}

  // ----- Vacunas -----
  async createVaccine(
    actor: ActorDto,
    petId: string,
    dto: CreateVaccineDto,
  ): Promise<Vaccine> {
    await this.assertStaffCanWrite(actor, petId);
    return this.prisma.vaccine.create({
      data: {
        name: dto.name,
        appliedDate: new Date(dto.appliedDate),
        nextDoseDate: dto.nextDoseDate ? new Date(dto.nextDoseDate) : null,
        batchNumber: dto.batchNumber,
        notes: dto.notes,
        petId,
      },
    });
  }

  async findVaccines(actor: ActorDto, petId: string): Promise<Vaccine[]> {
    await this.assertCanReadPet(actor, petId);
    return this.prisma.vaccine.findMany({
      where: { petId },
      orderBy: { appliedDate: 'desc' },
    });
  }

  // ----- Cirugías -----
  async createSurgery(
    actor: ActorDto,
    petId: string,
    dto: CreateSurgeryDto,
  ): Promise<Surgery> {
    await this.assertStaffCanWrite(actor, petId);
    return this.prisma.surgery.create({
      data: {
        type: dto.type,
        date: new Date(dto.date),
        description: dto.description,
        complications: dto.complications,
        petId,
      },
    });
  }

  async findSurgeries(actor: ActorDto, petId: string): Promise<Surgery[]> {
    await this.assertCanReadPet(actor, petId);
    return this.prisma.surgery.findMany({
      where: { petId },
      orderBy: { date: 'desc' },
    });
  }

  // ----- Diagnósticos -----
  async createDiagnosis(
    actor: ActorDto,
    petId: string,
    dto: CreateDiagnosisDto,
  ): Promise<Diagnosis> {
    await this.assertStaffCanWrite(actor, petId);
    return this.prisma.diagnosis.create({
      data: {
        disease: dto.disease,
        diagnosedAt: new Date(dto.diagnosedAt),
        isChronic: dto.isChronic ?? false,
        treatment: dto.treatment,
        notes: dto.notes,
        petId,
      },
    });
  }

  async findDiagnoses(actor: ActorDto, petId: string): Promise<Diagnosis[]> {
    await this.assertCanReadPet(actor, petId);
    return this.prisma.diagnosis.findMany({
      where: { petId },
      orderBy: { diagnosedAt: 'desc' },
    });
  }

  // ----- Helpers de autorización -----

  /** Solo ADMIN (veterinario) escribe, y la mascota debe existir. */
  private async assertStaffCanWrite(
    actor: ActorDto,
    petId: string,
  ): Promise<void> {
    assertActor(actor);
    assertStaff(actor, STAFF_ONLY_MESSAGE);
    await this.getPetOrFail(petId);
  }

  /** ADMIN lee cualquiera; USER (cliente) solo si es dueño. */
  private async assertCanReadPet(
    actor: ActorDto,
    petId: string,
  ): Promise<void> {
    assertActor(actor);
    const pet = await this.getPetOrFail(petId);
    assertOwnerOrStaff(actor, pet.ownerId);
  }

  private async getPetOrFail(petId: string): Promise<Pet> {
    const pet = await this.prisma.pet.findUnique({ where: { id: petId } });
    if (!pet) {
      throw new NotFoundException('Mascota no encontrada');
    }
    return pet;
  }
}
