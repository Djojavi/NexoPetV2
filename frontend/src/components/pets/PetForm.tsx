import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Pet, PetInput, Species, Sex } from '../../types';
import { SPECIES_LABELS, SEX_LABELS } from '../../types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';

const SPECIES_OPTIONS = (Object.keys(SPECIES_LABELS) as Species[]).map(
  (value) => ({ value, label: SPECIES_LABELS[value] }),
);
const SEX_OPTIONS = (Object.keys(SEX_LABELS) as Sex[]).map((value) => ({
  value,
  label: SEX_LABELS[value],
}));

const BREED_MAX = 100;
const NOTES_MAX = 500;

interface FormState {
  name: string;
  species: string;
  sex: string;
  breed: string;
  birthDate: string;
  weight: string;
  notes: string;
}

interface FormErrors {
  name?: string;
  species?: string;
  sex?: string;
  breed?: string;
  birthDate?: string;
  weight?: string;
  notes?: string;
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
  };
}

function validate(state: FormState): FormErrors {
  const errors: FormErrors = {};

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

  if (state.birthDate) {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (new Date(state.birthDate) > today)
      errors.birthDate = 'La fecha de nacimiento no puede ser futura';
  }

  return errors;
}

/** Construye el payload limpio: omite opcionales vacíos y nunca envía ownerId. */
function toPayload(state: FormState): PetInput {
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

  return payload;
}

interface PetFormProps {
  pet?: Pet;
  submitting: boolean;
  onSubmit: (data: PetInput) => void;
  onCancel: () => void;
}

export function PetForm({ pet, submitting, onSubmit, onCancel }: PetFormProps) {
  const [state, setState] = useState<FormState>(() => initialState(pet));
  const [errors, setErrors] = useState<FormErrors>({});

  function update<K extends keyof FormState>(field: K, value: string) {
    setState((prev) => ({ ...prev, [field]: value }));
  }

  function handleBlur() {
    setErrors(validate(state));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const validation = validate(state);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;
    onSubmit(toPayload(state));
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
