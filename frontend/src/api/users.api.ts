import { apiClient } from './client';
import type { User } from '../types';

/**
 * GET /api/users?role=USER → lista de clientes (dueños potenciales de mascotas).
 * Solo ADMIN puede consultarlo (el backend responde 403 a un cliente). Nunca
 * incluye la contraseña.
 */
export async function getClients(): Promise<User[]> {
  const { data } = await apiClient.get<User[]>('/users', {
    params: { role: 'USER' },
  });
  return data;
}
