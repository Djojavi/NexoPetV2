import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';

/**
 * Crea (sin conectar) el socket hacia el chat-service. El `token` es el mismo JWT
 * del login: incluye `role`, que el chat-service usa para validar conversaciones
 * CLIENT ↔ VET. La conexión se abre manualmente con `.connect()`.
 */
export function createSocket(token: string): Socket {
  return io(import.meta.env.VITE_CHAT_URL, {
    auth: { token },
    autoConnect: false,
    reconnectionAttempts: 3,
  });
}
