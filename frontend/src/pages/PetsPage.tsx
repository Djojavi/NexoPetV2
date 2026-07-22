import { useCallback, useEffect, useRef, useState } from 'react';
import type { Pet, PetInput } from '../types';
import { getSpeciesLabel, getSexLabel } from '../types';
import {
  getPets,
  createPet,
  updatePet,
  deletePet,
} from '../api/pets.api';
import { getErrorMessage } from '../api/client';
import { useToast } from '../components/ui/Toast';
import { useDebouncedValue } from '../lib/useDebouncedValue';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { PetForm } from '../components/pets/PetForm';

type ListState = 'loading' | 'ready' | 'error';

export function PetsPage() {
  const toast = useToast();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 400);

  const [pets, setPets] = useState<Pet[]>([]);
  const [listState, setListState] = useState<ListState>('loading');
  // Actividad de un refetch (por búsqueda), sin tapar el contenido actual.
  const [refetching, setRefetching] = useState(false);
  // Identifica la petición vigente para descartar respuestas obsoletas (carreras).
  const requestIdRef = useRef(0);
  // La primera carga muestra skeletons; los refetches conservan lo que ya se ve.
  const firstLoadRef = useRef(true);

  // null editing => crear; Pet => editar. undefined => modal cerrado.
  const [formPet, setFormPet] = useState<Pet | null | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Pet | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadPets = useCallback(async (query: string) => {
    const requestId = (requestIdRef.current += 1);

    if (firstLoadRef.current) {
      // Solo la carga inicial muestra skeletons.
      setListState('loading');
    } else {
      // Refetch por búsqueda: mantenemos el contenido y marcamos actividad sutil.
      setRefetching(true);
    }

    try {
      const data = await getPets(query.trim() || undefined);
      // Descarta la respuesta si ya llegó una petición más reciente.
      if (requestId !== requestIdRef.current) return;
      setPets(data);
      setListState('ready');
    } catch {
      if (requestId !== requestIdRef.current) return;
      // Rutas de mascotas aún inexistentes: banner amable, la app no se rompe.
      // El banner solo reemplaza al contenido cuando llega esta respuesta, no antes.
      setPets([]);
      setListState('error');
    } finally {
      // Solo la petición vigente cierra su propio indicador de actividad.
      if (requestId === requestIdRef.current) {
        firstLoadRef.current = false;
        setRefetching(false);
      }
    }
  }, []);

  useEffect(() => {
    loadPets(debouncedSearch);
  }, [debouncedSearch, loadPets]);

  async function handleSubmit(data: PetInput) {
    setSubmitting(true);
    try {
      if (formPet) {
        await updatePet(formPet.id, data);
        toast.success('Mascota actualizada correctamente');
      } else {
        await createPet(data);
        toast.success('Mascota creada correctamente');
      }
      setFormPet(undefined);
      await loadPets(debouncedSearch);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePet(deleteTarget.id);
      toast.success('Mascota eliminada correctamente');
      setDeleteTarget(null);
      await loadPets(debouncedSearch);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-800">Mascotas</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Gestiona las mascotas y su información básica.
          </p>
        </div>
        <Button onClick={() => setFormPet(null)}>
          <span aria-hidden="true">＋</span> Agregar mascota
        </Button>
      </div>

      {/* Buscador */}
      <div className="relative max-w-md">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400"
        >
          🔍
        </span>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre…"
          aria-label="Buscar mascotas"
          className="w-full rounded-lg border border-neutral-200 bg-surface py-2.5 pl-10 pr-10 text-neutral-800 shadow-soft transition-colors placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        />
        {refetching ? (
          <span className="absolute inset-y-0 right-3 flex items-center">
            <svg
              className="h-4 w-4 animate-spin text-primary-500"
              viewBox="0 0 24 24"
              fill="none"
              aria-label="Buscando"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-90"
                fill="currentColor"
                d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
              />
            </svg>
          </span>
        ) : null}
      </div>

      {/* Contenido: skeletons solo en la carga inicial; en refetch se atenúa lo actual. */}
      {listState === 'loading' ? (
        <PetsSkeleton />
      ) : (
        <div
          className={`transition-opacity duration-200 ${
            refetching ? 'opacity-60' : 'opacity-100'
          }`}
        >
          {listState === 'error' ? (
            <div className="rounded-2xl border border-accent-200 bg-accent-50 px-5 py-4 text-sm text-accent-700">
              El servicio de mascotas no está disponible todavía. Vuelve a
              intentarlo más tarde.
            </div>
          ) : pets.length === 0 ? (
            <EmptyState
              onAdd={() => setFormPet(null)}
              hasSearch={Boolean(search)}
            />
          ) : (
            <PetsList
              pets={pets}
              onEdit={(pet) => setFormPet(pet)}
              onDelete={(pet) => setDeleteTarget(pet)}
            />
          )}
        </div>
      )}

      {/* Modal crear/editar */}
      <Modal
        open={formPet !== undefined}
        onClose={() => setFormPet(undefined)}
        title={formPet ? 'Editar mascota' : 'Agregar mascota'}
      >
        <PetForm
          pet={formPet ?? undefined}
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={() => setFormPet(undefined)}
        />
      </Modal>

      {/* Confirmación de eliminación */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminar mascota"
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        message={
          <>
            ¿Eliminar a <strong>{deleteTarget?.name}</strong>? Esta acción no se
            puede deshacer.
          </>
        }
      />
    </div>
  );
}

// ----- Subcomponentes -----

function PetsList({
  pets,
  onEdit,
  onDelete,
}: {
  pets: Pet[];
  onEdit: (pet: Pet) => void;
  onDelete: (pet: Pet) => void;
}) {
  return (
    <>
      {/* Tabla (desktop) */}
      <div className="hidden overflow-hidden rounded-2xl border border-neutral-200/70 bg-surface shadow-card md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-5 py-3 font-medium">Nombre</th>
              <th className="px-5 py-3 font-medium">Especie</th>
              <th className="px-5 py-3 font-medium">Raza</th>
              <th className="px-5 py-3 font-medium">Sexo</th>
              <th className="px-5 py-3 font-medium">Peso</th>
              <th className="px-5 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {pets.map((pet) => (
              <tr key={pet.id} className="hover:bg-neutral-50/60">
                <td className="px-5 py-3 font-medium text-neutral-800">
                  {pet.name}
                </td>
                <td className="px-5 py-3 text-neutral-600">
                  {getSpeciesLabel(pet.species)}
                </td>
                <td className="px-5 py-3 text-neutral-600">
                  {pet.breed || '—'}
                </td>
                <td className="px-5 py-3 text-neutral-600">
                  {getSexLabel(pet.sex)}
                </td>
                <td className="px-5 py-3 text-neutral-600">
                  {pet.weight != null ? `${pet.weight} kg` : '—'}
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onEdit(pet)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-danger hover:bg-red-50"
                      onClick={() => onDelete(pet)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tarjetas (móvil) */}
      <div className="grid gap-3 md:hidden">
        {pets.map((pet) => (
          <div
            key={pet.id}
            className="rounded-2xl border border-neutral-200/70 bg-surface p-4 shadow-card"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-neutral-800">{pet.name}</p>
                <p className="text-sm text-neutral-500">
                  {getSpeciesLabel(pet.species)} · {getSexLabel(pet.sex)}
                </p>
              </div>
              {pet.weight != null ? (
                <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700">
                  {pet.weight} kg
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-sm text-neutral-600">
              Raza: {pet.breed || '—'}
            </p>
            <div className="mt-3 flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() => onEdit(pet)}
              >
                Editar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                className="text-danger hover:bg-red-50"
                onClick={() => onDelete(pet)}
              >
                Eliminar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function PetsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-2xl border border-neutral-200/70 bg-surface p-4 shadow-card"
        >
          <div className="h-10 w-10 animate-pulse rounded-full bg-neutral-200" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-1/3 animate-pulse rounded bg-neutral-200" />
            <div className="h-3 w-1/4 animate-pulse rounded bg-neutral-100" />
          </div>
          <div className="h-8 w-20 animate-pulse rounded-lg bg-neutral-100" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  onAdd,
  hasSearch,
}: {
  onAdd: () => void;
  hasSearch: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-neutral-300 bg-surface px-6 py-14 text-center">
      <svg
        className="h-16 w-16 text-primary-300"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <ellipse cx="8" cy="7" rx="1.6" ry="2.2" />
        <ellipse cx="16" cy="7" rx="1.6" ry="2.2" />
        <ellipse cx="4.5" cy="11" rx="1.4" ry="2" />
        <ellipse cx="19.5" cy="11" rx="1.4" ry="2" />
        <path d="M12 12.5c-2.6 0-4.7 1.9-4.7 4.2 0 1.7 1.3 2.6 2.9 2.6.9 0 1.3-.3 1.8-.3s.9.3 1.8.3c1.6 0 2.9-.9 2.9-2.6 0-2.3-2.1-4.2-4.7-4.2z" />
      </svg>
      {hasSearch ? (
        <p className="text-neutral-600">
          No se encontraron mascotas para esa búsqueda.
        </p>
      ) : (
        <>
          <p className="text-neutral-600">Aún no hay mascotas registradas.</p>
          <Button onClick={onAdd}>
            <span aria-hidden="true">＋</span> Agregar mascota
          </Button>
        </>
      )}
    </div>
  );
}
