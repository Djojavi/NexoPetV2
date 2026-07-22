import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleLabel } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

/** Placeholder del panel — se desarrollará en fases siguientes. */
export function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-surface-muted px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-xl shadow-lifted"
            >
              🐾
            </span>
            <span className="text-lg font-bold text-primary-700">NexoPet</span>
          </div>
          <Button variant="ghost" size="sm" onClick={logout}>
            Cerrar sesión
          </Button>
        </header>

        <Card className="p-7">
          <h1 className="text-2xl font-semibold text-neutral-800">
            Hola, {user?.name ?? 'usuario'} 👋
          </h1>
          <p className="mt-1 text-neutral-500">
            Rol: {getRoleLabel(user?.role)}
          </p>
          <p className="mt-4 text-sm text-neutral-600">
            Este panel se completará en las próximas fases.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/pets"
              className="rounded-lg bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-100"
            >
              Mascotas
            </Link>
            <Link
              to="/chat"
              className="rounded-lg bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-100"
            >
              Chat
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
