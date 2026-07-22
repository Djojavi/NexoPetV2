import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Pet, PetInput, PetUpdateInput, Species, Sex } from '../../types';
import { SPECIES_LABELS, SEX_LABELS } from '../../types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { OwnerSelect } from './OwnerSelect';

const SPECIES_OPTIONS = (Object.keys(SPECIES_LABELS) as Species[]).map(
  (value) => ({ value, label: SPECIES_LABELS[value] }),
);
const SEX_OPTIONS = (Object.keys(SEX_LABELS) as Sex[]).map((value) => ({
  value,
  label: SEX_LABELS[value],
}));

const BREED_MAX = 100;
const NOTES_MAX = 500;

/**
 * Fecha local de HOY en formato `YYYY-MM-DD`. Se construye a partir de los
 * componentes locales (no de `toISOString`, que usa UTC y puede adelantar/atrasar
 * un día). Sirve tanto para comparar como para el atributo `max` del input date.
 */
function todayISODate(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

interface FormState {
  name: string;
  species: string;
  sex: string;
  breed: string;
  birthDate: string;
  weight: string;
  notes: string;
  ownerId: string;
}

interface FormErrors {
  name?: string;
  species?: string;
  sex?: string;
  breed?: string;
  birthDate?: string;
  weight?: string;
  notes?: string;
  ownerId?: string;
}

function initialState(pet?: Pet): FormState {
  return {
    name: pet?.name ?? '',
    species: pet?.species ?? '',
    sex: pet?.sex ?? '',
    breed: pet?.breed ?? '',
    // El input date usa YYYY-MM-DD; recortamos la parte de fecha del ISO.
    birthDate: pet?.birthDate ? pet.birthDate.slice(0, 10) : '',
    weight: pet?.weight != null ? String(pet.weight) : '',
    notes: pet?.notes ?? '',
    ownerId: '',
  };
}

/** `requireOwner` = crear como ADMIN: el dueño (ownerId) es obligatorio. */
function validate(state: FormState, requireOwner: boolean): FormErrors {
  const errors: FormErrors = {};

  if (requireOwner && !state.ownerId)
    errors.ownerId = 'Selecciona el dueño de la mascota';

  const name = state.name.trim();
  if (!name) errors.name = 'El nombre es obligatorio';
  else if (name.length < 2)
    errors.name = 'El nombre debe tener al menos 2 caracteres';

  if (!state.species) errors.species = 'Selecciona una especie';
  if (!state.sex) errors.sex = 'Selecciona un sexo';

  if (state.breed.trim().length > BREED_MAX)
    errors.breed = `La raza no puede superar ${BREED_MAX} caracteres`;

  if (state.notes.length > NOTES_MAX)
    errors.notes = `Las notas no pueden superar ${NOTES_MAX} caracteres`;

  if (state.weight.trim()) {
    const weight = Number(state.weight);
    if (Number.isNaN(weight) || weight <= 0)
      errors.weight = 'El peso debe ser mayor a 0';
  }

  // El input date entrega `YYYY-MM-DD`; comparar como texto es cronológicamente
  // correcto y evita los desfases de zona horaria de construir un `Date`.
  if (state.birthDate && state.birthDate > todayISODate())
    errors.birthDate = 'La fecha de nacimiento no puede ser futura';

  return errors;
}

/**
 * Payload de CREAR: omite los opcionales vacíos. Incluye `ownerId` cuando el
 * veterinario (ADMIN) eligió el dueño (`withOwner`).
 */
function toCreatePayload(state: FormState, withOwner: boolean): PetInput {
  const payload: PetInput = {
    name: state.name.trim(),
    species: state.species as Species,
    sex: state.sex as Sex,
  };

  const breed = state.breed.trim();
  if (breed) payload.breed = breed;

  const notes = state.notes.trim();
  if (notes) payload.notes = notes;

  if (state.weight.trim()) payload.weight = Number(state.weight);

  if (state.birthDate)
    payload.birthDate = new Date(state.birthDate).toISOString();

  if (withOwner && state.ownerId) payload.ownerId = state.ownerId;

  return payload;
}

/**
 * Payload de EDITAR. Para cada opcional:
 * - Si tiene contenido → se envía normal (birthDate a ISO, weight numérico).
 * - Si quedó vacío pero ANTES tenía valor → se envía `null` para vaciarlo en la base.
 * - Si nunca tuvo valor y sigue vacío → se omite (Prisma no lo toca).
 * Nunca se envía ownerId. photoUrl no se toca: el formulario no lo edita.
 */
function toUpdatePayload(state: FormState, pet: Pet): PetUpdateInput {
  const payload: PetUpdateInput = {
    name: state.name.trim(),
    species: state.species as Species,
    sex: state.sex as Sex,
  };

  const breed = state.breed.trim();
  if (breed) payload.breed = breed;
  else if (pet.breed) payload.breed = null;

  const notes = state.notes.trim();
  if (notes) payload.notes = notes;
  else if (pet.notes) payload.notes = null;

  const weight = state.weight.trim();
  if (weight) payload.weight = Number(weight);
  else if (pet.weight != null) payload.weight = null;

  if (state.birthDate)
    payload.birthDate = new Date(state.birthDate).toISOString();
  else if (pet.birthDate) payload.birthDate = null;

  return payload;
}

interface PetFormProps {
  pet?: Pet;
  /** Muestra el selector de dueño al CREAR (solo el veterinario/ADMIN). */
  withOwner?: boolean;
  submitting: boolean;
  onSubmit: (data: PetInput | PetUpdateInput) => void;
  onCancel: () => void;
}

export function PetForm({
  pet,
  withOwner = false,
  submitting,
  onSubmit,
  onCancel,
}: PetFormProps) {
  const [state, setState] = useState<FormState>(() => initialState(pet));
  const [errors, setErrors] = useState<FormErrors>({});

  // El selector de dueño solo aplica al CREAR (en edición se usa "Cambiar dueño").
  const askOwner = withOwner && !pet;

  function update<K extends keyof FormState>(field: K, value: string) {
    setState((prev) => ({ ...prev, [field]: value }));
  }

  function handleBlur() {
    setErrors(validate(state, askOwner));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const validation = validate(state, askOwner);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;
    // Crear omite vacíos; editar puede enviar null para limpiar campos ya guardados.
    onSubmit(
      pet ? toUpdatePayload(state, pet) : toCreatePayload(state, askOwner),
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {askOwner ? (
        <OwnerSelect
          value={state.ownerId}
          onChange={(ownerId) => update('ownerId', ownerId)}
          error={errors.ownerId}
        />
      ) : null}

      <Input
        label="Nombre"
        value={state.name}
        onChange={(e) => update('name', e.target.value)}
        onBlur={handleBlur}
        error={errors.name}
        placeholder="Ej. Firulais"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Especie"
          value={state.species}
          onChange={(e) => update('species', e.target.value)}
          onBlur={handleBlur}
          error={errors.species}
          placeholder="Selecciona…"
          options={SPECIES_OPTIONS}
        />
        <Select
          label="Sexo"
          value={state.sex}
          onChange={(e) => update('sex', e.target.value)}
          onBlur={handleBlur}
          error={errors.sex}
          placeholder="Selecciona…"
          options={SEX_OPTIONS}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Raza (opcional)"
          value={state.breed}
          onChange={(e) => update('breed', e.target.value)}
          onBlur={handleBlur}
          error={errors.breed}
          maxLength={BREED_MAX}
          placeholder="Ej. Labrador"
        />
        <Input
          label="Fecha de nacimiento (opcional)"
          type="date"
          value={state.birthDate}
          max={todayISODate()}
          onChange={(e) => update('birthDate', e.target.value)}
          onBlur={handleBlur}
          error={errors.birthDate}
        />
      </div>

      <Input
        label="Peso en kg (opcional)"
        type="number"
        step="0.01"
        min="0"
        value={state.weight}
        onChange={(e) => update('weight', e.target.value)}
        onBlur={handleBlur}
        error={errors.weight}
        placeholder="Ej. 12.5"
      />

      <Textarea
        label="Notas (opcional)"
        rows={3}
        value={state.notes}
        onChange={(e) => update('notes', e.target.value)}
        onBlur={handleBlur}
        error={errors.notes}
        maxLength={NOTES_MAX}
        showCount
        placeholder="Observaciones generales…"
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" loading={submitting}>
          {pet ? 'Guardar cambios' : 'Agregar mascota'}
        </Button>
      </div>
    </form>
  );
}
