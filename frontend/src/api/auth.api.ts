import { apiClient } from './client';
import type { LoginResponse, User } from '../types';

/** POST /api/auth/login → { access_token, user: { id, name, email, role } } */
export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', {
    email,
    password,
  });
  return data;
}

/** POST /api/auth/register → usuario sin password (role siempre USER en registro público). */
export async function register(
  name: string,
  email: string,
  password: string,
): Promise<User> {
  const { data } = await apiClient.post<User>('/auth/register', {
    name,
    email,
    password,
  });
  return data;
}

/** POST /api/auth/forgot-password → { email }. Responde siempre con éxito neutro. */
export async function forgotPassword(email: string): Promise<void> {
  await apiClient.post('/auth/forgot-password', { email });
}

/**
 * POST /api/auth/reset-password → body { token, newPassword }.
 * El backend espera el campo `newPassword`; aquí exponemos `password` por claridad.
 * Errores 400: "Token inválido o expirado" / "El token ha expirado".
 */
export async function resetPassword(
  token: string,
  password: string,
): Promise<void> {
  await apiClient.post('/auth/reset-password', { token, newPassword: password });
}
