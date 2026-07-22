import axios, { AxiosError } from 'axios';
import type { ApiError } from '../types';

/** Claves de localStorage compartidas por toda la app. */
export const TOKEN_KEY = 'nexopet_token';
export const USER_KEY = 'nexopet_user';

/**
 * Instancia Axios central. En desarrollo `VITE_API_URL` es `/api`, resuelto por el
 * proxy de Vite hacia el gateway (que no tiene CORS). En producción puede apuntar a
 * una URL absoluta sin tocar el resto del código.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// --- Request: adjunta el Bearer token si existe ---
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Response: ante 401 limpia la sesión y manda a /login ---
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      // Evita bucles si ya estamos en /login.
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  },
);

/**
 * Normaliza cualquier error de Axios a un mensaje en español listo para mostrar.
 * - Errores de red (sin respuesta) → mensaje de conexión.
 * - `message` de NestJS puede ser string o array de strings.
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    // Sin respuesta del servidor: problema de red / servidor caído.
    if (!error.response) {
      return 'No se pudo conectar con el servidor';
    }

    const data = error.response.data as ApiError | undefined;
    const message = data?.message;

    if (Array.isArray(message)) {
      return message.filter(Boolean).join(' · ') || 'Ocurrió un error inesperado';
    }
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Ocurrió un error inesperado';
}
