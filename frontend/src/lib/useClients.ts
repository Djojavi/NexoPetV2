import { useCallback, useEffect, useState } from 'react';
import type { User } from '../types';
import { getClients } from '../api/users.api';
import { getErrorMessage } from '../api/client';

interface UseClientsResult {
  clients: User[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * Carga la lista de clientes (dueños potenciales). Pensado para el panel del
 * veterinario (ADMIN): el endpoint responde 403 a un cliente, así que se activa
 * con `enabled` solo cuando corresponde. Reutilizable por el select de dueño
 * (crear/reasignar) y por la resolución de nombres en la tabla/detalle.
 */
export function useClients(enabled = true): UseClientsResult {
  const [clients, setClients] = useState<User[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getClients();
      setClients(data);
    } catch (err) {
      setError(getErrorMessage(err));
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setClients([]);
      setLoading(false);
      setError(null);
      return;
    }
    load();
  }, [enabled, load]);

  return { clients, loading, error, reload: load };
}
