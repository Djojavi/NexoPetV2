import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPets } from '../api/pets.api';
import { Card } from '../components/ui/Card';

interface QuickLink {
  to: string;
  title: string;
  description: string;
  icon: string;
}

const QUICK_LINKS: QuickLink[] = [
  {
    to: '/pets',
    title: 'Mis Mascotas',
    description: 'Consulta y gestiona el historial clínico de tus mascotas.',
    icon: '🐾',
  },
  {
    to: '/chat',
    title: 'Tele-consulta (Chat)',
    description: 'Conversa con el equipo veterinario en tiempo real.',
    icon: '💬',
  },
];

// Estado del contador: cargando, listo con número, o servicio no disponible.
type PetCount =
  | { status: 'loading' }
  | { status: 'ready'; total: number }
  | { status: 'unavailable' };

export function DashboardPage() {
  const { user } = useAuth();
  const [petCount, setPetCount] = useState<PetCount>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    getPets()
      .then((pets) => {
        if (active) setPetCount({ status: 'ready', total: pets.length });
      })
      .catch(() => {
        // Las rutas de mascotas aún no existen: fallamos en silencio (sin toasts).
        if (active) setPetCount({ status: 'unavailable' });
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Bienvenida */}
      <div>
        <h2 className="text-2xl font-semibold text-neutral-800">
          Bienvenido, {user?.name ?? 'usuario'} 👋
        </h2>
        <p className="mt-1 text-neutral-500">
          Este es tu panel de NexoPet. Accede rápidamente a tus mascotas o a la
          tele-consulta.
        </p>
      </div>

      {/* Accesos rápidos */}
      <div className="grid gap-4 sm:grid-cols-2">
        {QUICK_LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="group rounded-2xl border border-neutral-200/70 bg-surface p-6 shadow-card transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lifted focus-visible:-translate-y-0.5"
          >
            <div className="flex items-start gap-4">
              <span
                aria-hidden="true"
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-2xl"
              >
                {link.icon}
              </span>
              <div>
                <h3 className="text-lg font-semibold text-neutral-800 group-hover:text-primary-700">
                  {link.title}
                </h3>
                <p className="mt-1 text-sm text-neutral-500">
                  {link.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Total de mascotas */}
      <Card className="p-6">
        <p className="text-sm font-medium text-neutral-500">
          Total de mascotas
        </p>
        <div className="mt-2 flex items-baseline gap-3">
          <span className="text-4xl font-bold text-primary-700">
            {petCount.status === 'ready' ? petCount.total : '—'}
          </span>
          {petCount.status === 'loading' ? (
            <span className="text-sm text-neutral-400">Cargando…</span>
          ) : null}
          {petCount.status === 'unavailable' ? (
            <span className="text-sm text-neutral-400">
              Servicio en preparación
            </span>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
