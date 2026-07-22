import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { TOKEN_KEY, USER_KEY } from '../api/client';
import * as authApi from '../api/auth.api';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Lee y valida el usuario guardado; si está corrupto lo descarta. */
function readStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Restaura la sesión desde localStorage al montar (evita parpadeo de "no logueado").
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY),
  );
  const [user, setUser] = useState<User | null>(() => readStoredUser());

  // Mantiene sincronizada la sesión entre pestañas del navegador.
  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key === TOKEN_KEY) setToken(localStorage.getItem(TOKEN_KEY));
      if (event.key === USER_KEY) setUser(readStoredUser());
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  function persistSession(nextToken: string, nextUser: User) {
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  }

  async function login(email: string, password: string): Promise<User> {
    const { access_token, user: loggedUser } = await authApi.login(
      email,
      password,
    );
    persistSession(access_token, loggedUser);
    return loggedUser;
  }

  /**
   * Registra al usuario. El backend NO devuelve token en el registro, así que
   * aquí no iniciamos sesión: la UI decidirá redirigir al login.
   */
  async function register(
    name: string,
    email: string,
    password: string,
  ): Promise<User> {
    return authApi.register(name, email, password);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      isAdmin: user?.role === 'ADMIN',
      login,
      register,
      logout,
    }),
    [user, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return ctx;
}
