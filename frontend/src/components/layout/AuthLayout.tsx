import type { ReactNode } from 'react';
import { Card } from '../ui/Card';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Pie opcional (enlaces a otras pantallas de auth). */
  footer?: ReactNode;
}

/** Marco visual común de login/registro/recuperación: gradiente sutil + card centrada. */
export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-primary-50 via-surface-muted to-accent-50 px-4 py-10">
      {/* Manchas decorativas del primario, muy suaves. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary-200/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-primary-300/30 blur-3xl"
      />

      <div className="relative w-full max-w-md">
        {/* Marca */}
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span
            aria-hidden="true"
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-2xl shadow-lifted"
          >
            🐾
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary-700">
              NexoPet
            </h1>
            <p className="text-sm text-neutral-500">
              Historial clínico veterinario
            </p>
          </div>
        </div>

        <Card className="p-7">
          <div className="mb-6 space-y-1">
            <h2 className="text-xl font-semibold text-neutral-800">{title}</h2>
            {subtitle ? (
              <p className="text-sm text-neutral-500">{subtitle}</p>
            ) : null}
          </div>
          {children}
        </Card>

        {footer ? (
          <div className="mt-6 text-center text-sm text-neutral-600">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
