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
      // El cliente solo ve sus mascotas, pero la búsqueda también debe aplicarle.
      return this.prisma.pet.findMany({
        where: {
          ownerId: actor.userId,
          ...(search ? this.buildSearchFilter(search) : {}),
        },
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
    // Regla de negocio: solo el veterinario (ADMIN) registra mascotas. El cliente
    // (USER) solo consulta las suyas.
    assertStaff(
      actor,
      'Acceso denegado. Solo el veterinario puede registrar mascotas.',
    );

    // Toda mascota debe quedar asociada a un cliente: el veterinario indica a qué
    // cliente pertenece.
    if (!dto.ownerId) {
      throw new BadRequestException(
        'Debe asociar la mascota a un cliente (ownerId es obligatorio)',
      );
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
        ownerId: dto.ownerId,
      },
    });
  }

  /**
   * Editar mascota. Solo el veterinario (ADMIN); el cliente (USER) solo consulta.
   * El ADMIN puede además reasignar el dueño enviando `ownerId`.
   */
  async update(actor: ActorDto, id: string, dto: UpdatePetDto): Promise<Pet> {
    assertActor(actor);
    assertStaff(
      actor,
      'Acceso denegado. Solo el veterinario puede editar mascotas.',
    );

    const pet = await this.prisma.pet.findUnique({ where: { id } });
    if (!pet) {
      throw new NotFoundException('Mascota no encontrada');
    }

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

  /**
   * Reasignar el dueño de una mascota a otro cliente. Solo el veterinario (ADMIN).
   * El `ownerId` debe ser el id de un cliente válido (lo garantiza el frontend, que
   * lo elige de la lista de clientes que expone auth-service).
   */
  async reassignOwner(
    actor: ActorDto,
    id: string,
    ownerId: string,
  ): Promise<Pet> {
    assertActor(actor);
    assertStaff(
      actor,
      'Acceso denegado. Solo el veterinario puede reasignar el dueño de una mascota.',
    );

    if (!ownerId) {
      throw new BadRequestException('Debe indicar el nuevo dueño (ownerId).');
    }

    const pet = await this.prisma.pet.findUnique({ where: { id } });
    if (!pet) {
      throw new NotFoundException('Mascota no encontrada');
    }

    return this.prisma.pet.update({ where: { id }, data: { ownerId } });
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
    const term = search.trim();
    const filters: Prisma.PetWhereInput[] = [
      { name: { contains: term, mode: 'insensitive' } },
      { breed: { contains: term, mode: 'insensitive' } },
    ];

    // Si el término coincide con una especie (código del enum o etiqueta en
    // español), también se filtra por ella.
    // (La búsqueda por nombre del dueño no es posible aquí: sus datos viven en la
    //  base de Auth. El enriquecimiento del dueño lo hace el gateway/frontend.)
    const species = this.matchSpecies(term);
    if (species) {
      filters.push({ species });
    }

    return { OR: filters };
  }

  /**
   * Traduce un término de búsqueda a una especie del enum. Acepta tanto el código
   * en inglés (`DOG`) como la etiqueta en español que usa el frontend (`Perro`).
   */
  private matchSpecies(term: string): Species | undefined {
    const normalized = term.toUpperCase();

    const direct = Object.values(Species).find((value) => value === normalized);
    if (direct) {
      return direct;
    }

    const labels: Record<string, Species> = {
      PERRO: Species.DOG,
      GATO: Species.CAT,
      AVE: Species.BIRD,
      PAJARO: Species.BIRD,
      CONEJO: Species.RABBIT,
      REPTIL: Species.REPTILE,
      ROEDOR: Species.RODENT,
      OTRO: Species.OTHER,
    };
    return labels[normalized];
  }
}
