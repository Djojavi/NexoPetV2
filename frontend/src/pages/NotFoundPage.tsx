import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-surface-muted px-4 text-center">
      <span aria-hidden="true" className="text-5xl">
        🐾
      </span>
      <div className="space-y-1">
        <p className="text-5xl font-bold text-primary-700">404</p>
        <p className="text-neutral-600">
          No encontramos la página que buscas.
        </p>
      </div>
      <Link
        to="/"
        className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-primary-700"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
