import type { ReactNode } from 'react';
import type { Pet } from '../../types';
import { getSpeciesLabel, getSexLabel } from '../../types';
import { Button } from '../ui/Button';

/**
 * Formatea una fecha ISO como `d de mes de aaaa`. Se fuerza `timeZone: 'UTC'`
 * porque `birthDate` se guarda a medianoche UTC: interpretarla en la zona local
 * podría mostrar el día anterior.
 */
function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-neutral-400">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-neutral-800">{value}</dd>
    </div>
  );
}

interface PetDetailProps {
  pet: Pet;
  /** Nombre del dueño (resuelto por quien abre el detalle). Solo se muestra si viene. */
  ownerName?: string;
  onClose: () => void;
}

/**
 * Vista de SOLO LECTURA de una mascota. La usa el cliente (rol USER), que no puede
 * crear/editar/eliminar; también sirve como consulta rápida para el veterinario.
 * No contiene inputs ni acciones de modificación.
 */
export function PetDetail({ pet, ownerName, onClose }: PetDetailProps) {
  return (
    <div className="space-y-5">
      {pet.photoUrl ? (
        <img
          src={pet.photoUrl}
          alt={`Foto de ${pet.name}`}
          className="h-40 w-full rounded-xl object-cover"
        />
      ) : null}

      <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
        <Field label="Nombre" value={pet.name} />
        <Field label="Especie" value={getSpeciesLabel(pet.species)} />
        <Field label="Sexo" value={getSexLabel(pet.sex)} />
        <Field label="Raza" value={pet.breed || '—'} />
        <Field label="Fecha de nacimiento" value={formatDate(pet.birthDate)} />
        <Field
          label="Peso"
          value={pet.weight != null ? `${pet.weight} kg` : '—'}
        />
        {ownerName ? <Field label="Dueño" value={ownerName} /> : null}
        <div className="col-span-2">
          <Field
            label="Notas"
            value={
              pet.notes ? (
                <span className="whitespace-pre-wrap">{pet.notes}</span>
              ) : (
                '—'
              )
            }
          />
        </div>
      </dl>

      <div className="flex justify-end pt-1">
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </div>
  );
}
