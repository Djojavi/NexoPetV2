import { useClients } from '../../lib/useClients';
import { Select } from '../ui/Select';

interface OwnerSelectProps {
  /** ownerId seleccionado. */
  value: string;
  onChange: (ownerId: string) => void;
  /** Mensaje de error de validación del formulario (p. ej. "requerido"). */
  error?: string;
  label?: string;
}

/**
 * Select reutilizable de dueños (clientes). Lo comparten el formulario de crear
 * mascota y el modal de reasignar dueño. Carga la lista por su cuenta y gestiona
 * los estados de cargando / vacío / error de red sin romper el contenedor.
 * Muestra "Nombre (email)" para desambiguar clientes con el mismo nombre.
 */
export function OwnerSelect({
  value,
  onChange,
  error,
  label = 'Dueño',
}: OwnerSelectProps) {
  const { clients, loading, error: loadError } = useClients(true);

  if (loading) {
    return (
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-neutral-700">{label}</span>
        <div className="h-11 animate-pulse rounded-lg bg-neutral-100" />
        <span className="text-sm text-neutral-400">Cargando clientes…</span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-neutral-700">{label}</span>
        <p className="rounded-lg border border-accent-200 bg-accent-50 px-3 py-2 text-sm text-accent-700">
          No se pudo cargar la lista de clientes. {loadError}
        </p>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-neutral-700">{label}</span>
        <p className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-500">
          No hay clientes registrados todavía.
        </p>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
      </div>
    );
  }

  const options = clients.map((client) => ({
    value: client.id,
    label: `${client.name} (${client.email})`,
  }));

  return (
    <Select
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      error={error}
      placeholder="Selecciona un cliente…"
      options={options}
    />
  );
}
