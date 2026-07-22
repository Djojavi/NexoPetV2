import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Pet, Species } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ActorDto } from '../common/dto/actor.dto';
import { Role } from '../common/enums/role.enum';
import {
  assertActor,
  assertOwnerOrStaff,
  assertStaff,
  isStaff,
} from '../common/auth/authz.util';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';

@Injectable()
export class PetsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Listado según rol:
   * - USER (cliente): solo sus mascotas.
   * - ADMIN (veterinario): todas, con búsqueda opcional por nombre/especie.
   */
  async findAll(actor: ActorDto, search?: string): Promise<Pet[]> {
    assertActor(actor);

    if (actor.role === Role.USER) {
      return this.prisma.pet.findMany({
        where: { ownerId: actor.userId },
        orderBy: { createdAt: 'desc' },
      });
    }

    // ADMIN (veterinario)
    return this.prisma.pet.findMany({
      where: search ? this.buildSearchFilter(search) : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Detalle de una mascota con su historial clínico completo. */
  async findOne(actor: ActorDto, id: string) {
    assertActor(actor);

    const pet = await this.prisma.pet.findUnique({
      where: { id },
      include: {
        vaccines: { orderBy: { appliedDate: 'desc' } },
        surgeries: { orderBy: { date: 'desc' } },
        diagnoses: { orderBy: { diagnosedAt: 'desc' } },
      },
    });

    if (!pet) {
      throw new NotFoundException('Mascota no encontrada');
    }

    assertOwnerOrStaff(actor, pet.ownerId);
    return pet;
  }

  /**
   * Crear mascota.
   * - USER (cliente): el dueño es siempre él mismo (se ignora cualquier `ownerId` recibido).
   * - ADMIN (veterinario): debe indicar `ownerId` (a qué cliente pertenece la mascota).
   */
  async create(actor: ActorDto, dto: CreatePetDto): Promise<Pet> {
    assertActor(actor);

    let ownerId: string;
    if (isStaff(actor.role)) {
      if (!dto.ownerId) {
        throw new BadRequestException(
          'Debe proveer un ownerId para crear la mascota de un cliente',
        );
      }
      ownerId = dto.ownerId;
    } else {
      ownerId = actor.userId;
    }

    return this.prisma.pet.create({
      data: {
        name: dto.name,
        species: dto.species,
        sex: dto.sex,
        breed: dto.breed,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
        weight: dto.weight,
        photoUrl: dto.photoUrl,
        notes: dto.notes,
        ownerId,
      },
    });
  }

  /**
   * Editar mascota.
   * - USER (cliente): solo si es dueño, y NO puede reasignar el dueño (se descarta `ownerId`).
   * - ADMIN (veterinario): cualquier mascota, y puede reasignar el dueño.
   */
  async update(actor: ActorDto, id: string, dto: UpdatePetDto): Promise<Pet> {
    assertActor(actor);

    const pet = await this.prisma.pet.findUnique({ where: { id } });
    if (!pet) {
      throw new NotFoundException('Mascota no encontrada');
    }
    assertOwnerOrStaff(actor, pet.ownerId);

    const data: Prisma.PetUpdateInput = {
      name: dto.name,
      species: dto.species,
      sex: dto.sex,
      breed: dto.breed,
      weight: dto.weight,
      photoUrl: dto.photoUrl,
      notes: dto.notes,
    };

    if (dto.birthDate !== undefined) {
      data.birthDate = dto.birthDate ? new Date(dto.birthDate) : null;
    }

    // Reasignación de dueño: solo el veterinario (ADMIN).
    if (dto.ownerId !== undefined) {
      if (!isStaff(actor.role)) {
        throw new ForbiddenException(
          'Solo el veterinario puede reasignar el dueño de una mascota',
        );
      }
      data.ownerId = dto.ownerId;
    }

    return this.prisma.pet.update({ where: { id }, data });
  }

  /** Eliminar mascota. Solo ADMIN/veterinario (el historial clínico cae en cascada). */
  async remove(actor: ActorDto, id: string): Promise<{ message: string }> {
    assertActor(actor);
    assertStaff(
      actor,
      'Acceso denegado. Solo el veterinario puede borrar mascotas.',
    );

    const pet = await this.prisma.pet.findUnique({ where: { id } });
    if (!pet) {
      throw new NotFoundException('Mascota no encontrada');
    }

    await this.prisma.pet.delete({ where: { id } });
    return { message: 'Mascota eliminada correctamente' };
  }

  private buildSearchFilter(search: string): Prisma.PetWhereInput {
    const filters: Prisma.PetWhereInput[] = [
      { name: { contains: search, mode: 'insensitive' } },
    ];

    // Si el término coincide con una especie del enum, también se filtra por ella.
    // (La búsqueda por nombre del dueño no es posible aquí: sus datos viven en la
    //  base de Auth. El enriquecimiento del dueño lo hace el gateway/frontend.)
    const speciesMatch = Object.values(Species).find(
      (value) => value === search.toUpperCase(),
    );
    if (speciesMatch) {
      filters.push({ species: speciesMatch });
    }

    return { OR: filters };
  }
}
