import { apiClient } from './client';
import type {
  Pet,
  PetInput,
  PetUpdateInput,
  Vaccine,
  VaccineInput,
  Surgery,
  SurgeryInput,
  Diagnosis,
  DiagnosisInput,
} from '../types';

// NOTA: las rutas /api/pets... aún NO existen en el gateway. Se dejan tipadas para
// que la UI las consuma; los componentes deben tolerar el error con mensajes amables.

// ----- Mascotas -----

export async function getPets(search?: string): Promise<Pet[]> {
  const { data } = await apiClient.get<Pet[]>('/pets', {
    params: search ? { search } : undefined,
  });
  return data;
}

export async function getPet(id: string): Promise<Pet> {
  const { data } = await apiClient.get<Pet>(`/pets/${id}`);
  return data;
}

export async function createPet(data: PetInput): Promise<Pet> {
  const res = await apiClient.post<Pet>('/pets', data);
  return res.data;
}

export async function updatePet(id: string, data: PetUpdateInput): Promise<Pet> {
  const res = await apiClient.patch<Pet>(`/pets/${id}`, data);
  return res.data;
}

export async function deletePet(id: string): Promise<void> {
  await apiClient.delete(`/pets/${id}`);
}

/**
 * Reasigna el dueño de una mascota a otro cliente (solo ADMIN).
 * PATCH /api/pets/:id/owner con body { ownerId }.
 */
export async function reassignOwner(
  petId: string,
  ownerId: string,
): Promise<Pet> {
  const res = await apiClient.patch<Pet>(`/pets/${petId}/owner`, { ownerId });
  return res.data;
}

// ----- Vacunas -----

export async function getVaccines(petId: string): Promise<Vaccine[]> {
  const { data } = await apiClient.get<Vaccine[]>(`/pets/${petId}/vaccines`);
  return data;
}

export async function createVaccine(
  petId: string,
  data: VaccineInput,
): Promise<Vaccine> {
  const res = await apiClient.post<Vaccine>(`/pets/${petId}/vaccines`, data);
  return res.data;
}

// ----- Cirugías -----

export async function getSurgeries(petId: string): Promise<Surgery[]> {
  const { data } = await apiClient.get<Surgery[]>(`/pets/${petId}/surgeries`);
  return data;
}

export async function createSurgery(
  petId: string,
  data: SurgeryInput,
): Promise<Surgery> {
  const res = await apiClient.post<Surgery>(`/pets/${petId}/surgeries`, data);
  return res.data;
}

// ----- Diagnósticos -----

export async function getDiagnoses(petId: string): Promise<Diagnosis[]> {
  const { data } = await apiClient.get<Diagnosis[]>(`/pets/${petId}/diagnoses`);
  return data;
}

export async function createDiagnosis(
  petId: string,
  data: DiagnosisInput,
): Promise<Diagnosis> {
  const res = await apiClient.post<Diagnosis>(`/pets/${petId}/diagnoses`, data);
  return res.data;
}
