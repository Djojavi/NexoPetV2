// Tipos del dominio NexoPet, alineados a los contratos reales del backend.

/**
 * Union amplia de roles. Hoy auth-service emite { USER, ADMIN } pero product-service
 * valida contra { CLIENT, VET, ADMIN }. Mientras el equipo alinea ambos servicios,
 * el frontend acepta los cuatro valores y trata cualquier otro como rol básico.
 * La autorización real la resuelve el backend; aquí `role` solo adapta la UI.
 */
export type Role = 'USER' | 'ADMIN' | 'CLIENT' | 'VET';

export type Species =
  | 'DOG'
  | 'CAT'
  | 'BIRD'
  | 'RABBIT'
  | 'REPTILE'
  | 'RODENT'
  | 'OTHER';

export type Sex = 'MALE' | 'FEMALE' | 'UNKNOWN';

// ----- Auth -----

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

/** Forma de los errores de NestJS: `message` puede ser string o array de strings. */
export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

// ----- Mascotas e historial clínico -----

export interface Pet {
  id: string;
  name: string;
  species: Species;
  breed?: string | null;
  birthDate?: string | null;
  weight?: number | null;
  sex: Sex;
  photoUrl?: string | null;
  notes?: string | null;
  ownerId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Vaccine {
  id: string;
  name: string;
  appliedDate: string;
  nextDoseDate?: string | null;
  batchNumber?: string | null;
  notes?: string | null;
  petId: string;
  createdAt?: string;
}

export interface Surgery {
  id: string;
  type: string;
  date: string;
  description?: string | null;
  complications?: string | null;
  petId: string;
  createdAt?: string;
}

export interface Diagnosis {
  id: string;
  disease: string;
  isChronic: boolean;
  // El schema real del product-service usa `diagnosedAt` (no `diagnosedDate`).
  diagnosedAt: string;
  treatment?: string | null;
  notes?: string | null;
  petId: string;
  createdAt?: string;
}

// ----- Payloads de creación/edición (lo que la UI envía al API) -----

export interface PetInput {
  name: string;
  species: Species;
  sex: Sex;
  breed?: string;
  birthDate?: string;
  weight?: number;
  photoUrl?: string;
  notes?: string;
  /** Solo lo usan VET/ADMIN para asignar dueño; para un CLIENT lo ignora el backend. */
  ownerId?: string;
}

/**
 * Payload de edición: cada campo es opcional y, además, admite `null` explícito
 * para VACIAR en la base un opcional que antes tenía valor (Prisma trata `undefined`
 * como "sin cambios" y `null` como "borrar").
 */
export type PetUpdateInput = {
  [K in keyof PetInput]?: PetInput[K] | null;
};

export interface VaccineInput {
  name: string;
  appliedDate: string;
  nextDoseDate?: string;
  batchNumber?: string;
  notes?: string;
}

export interface SurgeryInput {
  type: string;
  date: string;
  description?: string;
  complications?: string;
}

export interface DiagnosisInput {
  disease: string;
  diagnosedAt: string;
  isChronic?: boolean;
  treatment?: string;
  notes?: string;
}

// ----- Etiquetas en español para mostrar enums en la UI -----

export const SPECIES_LABELS: Record<Species, string> = {
  DOG: 'Perro',
  CAT: 'Gato',
  BIRD: 'Ave',
  RABBIT: 'Conejo',
  REPTILE: 'Reptil',
  RODENT: 'Roedor',
  OTHER: 'Otro',
};

export const SEX_LABELS: Record<Sex, string> = {
  MALE: 'Macho',
  FEMALE: 'Hembra',
  UNKNOWN: 'Desconocido',
};

/**
 * Roles a etiqueta. USER y CLIENT se muestran igual ("Cliente") por el desajuste
 * temporal entre servicios. Cualquier valor no mapeado cae a "Usuario".
 */
export const ROLE_LABELS: Record<string, string> = {
  USER: 'Cliente',
  CLIENT: 'Cliente',
  VET: 'Veterinario',
  ADMIN: 'Administrador',
};

export function getRoleLabel(role: string | null | undefined): string {
  if (!role) return 'Usuario';
  return ROLE_LABELS[role] ?? 'Usuario';
}

export function getSpeciesLabel(species: string | null | undefined): string {
  if (!species) return 'Otro';
  return SPECIES_LABELS[species as Species] ?? 'Otro';
}

export function getSexLabel(sex: string | null | undefined): string {
  if (!sex) return 'Desconocido';
  return SEX_LABELS[sex as Sex] ?? 'Desconocido';
}
