import { INestMicroservice, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AppModule } from '../src/app.module';
import { RpcAllExceptionsFilter } from '../src/common/filters/rpc-exception.filter';
import { PrismaService } from '../src/prisma/prisma.service';

const TEST_PORT = 3099;

const VET = { userId: 'vet-1', role: 'VET' };
const ADMIN = { userId: 'admin-1', role: 'ADMIN' };
const CLIENT_A = { userId: 'client-A', role: 'CLIENT' };
const CLIENT_B = { userId: 'client-B', role: 'CLIENT' };

/**
 * Suite E2E: arranca el microservicio real (TCP) en un puerto de prueba, con el
 * mismo ValidationPipe y filtro RPC que producción, y le habla con un ClientProxy.
 * Requiere una BD Postgres accesible vía DATABASE_URL con las migraciones aplicadas.
 */
describe('product-service (e2e)', () => {
  let app: INestMicroservice;
  let client: ClientProxy;
  let prisma: PrismaService;

  const send = (pattern: string, payload: unknown) =>
    firstValueFrom(client.send(pattern, payload));

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestMicroservice({
      transport: Transport.TCP,
      options: { host: '127.0.0.1', port: TEST_PORT },
    });
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.useGlobalFilters(new RpcAllExceptionsFilter());
    await app.listen();

    prisma = app.get(PrismaService);

    client = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: { host: '127.0.0.1', port: TEST_PORT },
    });
    await client.connect();
  });

  afterAll(async () => {
    await client.close();
    await app.close();
  });

  beforeEach(async () => {
    // Aislamiento entre tests: BD limpia.
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE pets, vaccines, surgeries, diagnoses RESTART IDENTITY CASCADE;',
    );
  });

  // Helper: crea una mascota de CLIENT_A a través de un VET y devuelve su id.
  const createPetForA = async (over: Record<string, unknown> = {}) => {
    const pet: any = await send('pet.create', {
      actor: VET,
      data: {
        name: 'Firulais',
        species: 'DOG',
        sex: 'MALE',
        weight: 12.5,
        ownerId: 'client-A',
        ...over,
      },
    });
    return pet;
  };

  describe('pet.create', () => {
    it('VET con datos válidos crea la mascota para el ownerId indicado', async () => {
      const pet = await createPetForA();
      expect(pet.id).toBeDefined();
      expect(pet.ownerId).toBe('client-A');
      expect(pet.name).toBe('Firulais');
    });

    it('rechaza peso 0 (400)', async () => {
      await expect(
        send('pet.create', {
          actor: VET,
          data: {
            name: 'X',
            species: 'CAT',
            sex: 'FEMALE',
            weight: 0,
            ownerId: 'client-A',
          },
        }),
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it('rechaza nombre vacío (400)', async () => {
      await expect(
        send('pet.create', {
          actor: VET,
          data: {
            name: '',
            species: 'CAT',
            sex: 'FEMALE',
            ownerId: 'client-A',
          },
        }),
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it('rechaza especie fuera del enum (400)', async () => {
      await expect(
        send('pet.create', {
          actor: VET,
          data: {
            name: 'X',
            species: 'DRAGON',
            sex: 'MALE',
            ownerId: 'client-A',
          },
        }),
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it('VET sin ownerId (400)', async () => {
      await expect(
        send('pet.create', {
          actor: VET,
          data: { name: 'X', species: 'CAT', sex: 'FEMALE' },
        }),
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it('CLIENT ignora ownerId ajeno: el dueño es él mismo', async () => {
      const pet: any = await send('pet.create', {
        actor: CLIENT_A,
        data: {
          name: 'Michi',
          species: 'CAT',
          sex: 'FEMALE',
          ownerId: 'client-B',
        },
      });
      expect(pet.ownerId).toBe('client-A');
    });

    it('sin actor (401)', async () => {
      await expect(
        send('pet.create', {
          data: { name: 'X', species: 'CAT', sex: 'FEMALE' },
        }),
      ).rejects.toMatchObject({ statusCode: 401 });
    });
  });

  describe('pet.findAll', () => {
    it('CLIENT solo ve sus mascotas', async () => {
      await createPetForA();
      await send('pet.create', {
        actor: VET,
        data: {
          name: 'Ajeno',
          species: 'CAT',
          sex: 'MALE',
          ownerId: 'client-B',
        },
      });

      const list: any[] = (await send('pet.findAll', {
        actor: CLIENT_A,
      })) as any[];
      expect(list).toHaveLength(1);
      expect(list.every((p) => p.ownerId === 'client-A')).toBe(true);
    });

    it('VET ve todas', async () => {
      await createPetForA();
      await send('pet.create', {
        actor: VET,
        data: {
          name: 'Ajeno',
          species: 'CAT',
          sex: 'MALE',
          ownerId: 'client-B',
        },
      });
      const list: any[] = (await send('pet.findAll', { actor: VET })) as any[];
      expect(list).toHaveLength(2);
    });

    it('VET puede buscar por nombre', async () => {
      await createPetForA();
      await send('pet.create', {
        actor: VET,
        data: { name: 'Rex', species: 'DOG', sex: 'MALE', ownerId: 'client-B' },
      });
      const list: any[] = (await send('pet.findAll', {
        actor: VET,
        search: 'firu',
      })) as any[];
      expect(list).toHaveLength(1);
      expect(list[0].name).toBe('Firulais');
    });
  });

  describe('pet.findOne', () => {
    it('CLIENT dueño obtiene la mascota con su historial clínico', async () => {
      const { id } = await createPetForA();
      const pet: any = await send('pet.findOne', { actor: CLIENT_A, id });
      expect(pet.id).toBe(id);
      expect(Array.isArray(pet.vaccines)).toBe(true);
      expect(Array.isArray(pet.surgeries)).toBe(true);
      expect(Array.isArray(pet.diagnoses)).toBe(true);
    });

    it('CLIENT ajeno (403)', async () => {
      const { id } = await createPetForA();
      await expect(
        send('pet.findOne', { actor: CLIENT_B, id }),
      ).rejects.toMatchObject({ statusCode: 403 });
    });

    it('id inexistente (404)', async () => {
      await expect(
        send('pet.findOne', { actor: VET, id: 'no-existe' }),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('pet.update', () => {
    it('VET actualiza el peso', async () => {
      const { id } = await createPetForA();
      const updated: any = await send('pet.update', {
        actor: VET,
        id,
        data: { weight: 15 },
      });
      expect(updated.weight).toBe(15);
    });

    it('VET/ADMIN puede reasignar el dueño', async () => {
      const { id } = await createPetForA();
      const updated: any = await send('pet.update', {
        actor: ADMIN,
        id,
        data: { ownerId: 'client-B' },
      });
      expect(updated.ownerId).toBe('client-B');
    });

    it('CLIENT no puede reasignar el dueño (403)', async () => {
      const { id } = await createPetForA();
      await expect(
        send('pet.update', {
          actor: CLIENT_A,
          id,
          data: { ownerId: 'client-B' },
        }),
      ).rejects.toMatchObject({ statusCode: 403 });
    });
  });

  describe('pet.remove', () => {
    it('CLIENT no puede borrar (403)', async () => {
      const { id } = await createPetForA();
      await expect(
        send('pet.remove', { actor: CLIENT_A, id }),
      ).rejects.toMatchObject({ statusCode: 403 });
    });

    it('VET borra y el historial cae en cascada', async () => {
      const { id } = await createPetForA();
      await send('pet.vaccine.create', {
        actor: VET,
        petId: id,
        data: { name: 'Rabia', appliedDate: '2026-01-10' },
      });
      const res: any = await send('pet.remove', { actor: VET, id });
      expect(res.message).toContain('eliminada');
      // El historial se borró en cascada.
      const count = await prisma.vaccine.count({ where: { petId: id } });
      expect(count).toBe(0);
    });
  });

  describe('historial clínico', () => {
    it('CLIENT no puede añadir vacuna (403)', async () => {
      const { id } = await createPetForA();
      await expect(
        send('pet.vaccine.create', {
          actor: CLIENT_A,
          petId: id,
          data: { name: 'Rabia', appliedDate: '2026-01-10' },
        }),
      ).rejects.toMatchObject({ statusCode: 403 });
    });

    it('VET añade vacuna sobre mascota inexistente (404)', async () => {
      await expect(
        send('pet.vaccine.create', {
          actor: VET,
          petId: 'no-existe',
          data: { name: 'Rabia', appliedDate: '2026-01-10' },
        }),
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it('VET añade y lista vacuna, cirugía y diagnóstico', async () => {
      const { id } = await createPetForA();

      const vaccine: any = await send('pet.vaccine.create', {
        actor: VET,
        petId: id,
        data: { name: 'Rabia', appliedDate: '2026-01-10', batchNumber: 'L-1' },
      });
      expect(vaccine.petId).toBe(id);

      const surgery: any = await send('pet.surgery.create', {
        actor: VET,
        petId: id,
        data: { type: 'Esterilización', date: '2026-02-01' },
      });
      expect(surgery.type).toBe('Esterilización');

      const diagnosis: any = await send('pet.diagnosis.create', {
        actor: VET,
        petId: id,
        data: { disease: 'Otitis', diagnosedAt: '2026-03-01', isChronic: true },
      });
      expect(diagnosis.isChronic).toBe(true);

      expect(
        (await send('pet.vaccine.findAll', { actor: VET, petId: id })) as any[],
      ).toHaveLength(1);
      expect(
        (await send('pet.surgery.findAll', { actor: VET, petId: id })) as any[],
      ).toHaveLength(1);
      expect(
        (await send('pet.diagnosis.findAll', {
          actor: VET,
          petId: id,
        })) as any[],
      ).toHaveLength(1);
    });

    it('CLIENT dueño lista el historial; CLIENT ajeno recibe 403', async () => {
      const { id } = await createPetForA();
      await send('pet.vaccine.create', {
        actor: VET,
        petId: id,
        data: { name: 'Rabia', appliedDate: '2026-01-10' },
      });

      expect(
        (await send('pet.vaccine.findAll', {
          actor: CLIENT_A,
          petId: id,
        })) as any[],
      ).toHaveLength(1);

      await expect(
        send('pet.vaccine.findAll', { actor: CLIENT_B, petId: id }),
      ).rejects.toMatchObject({ statusCode: 403 });
    });
  });
});
