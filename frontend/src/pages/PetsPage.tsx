import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';

/** Placeholder de mascotas — se desarrollará en fases siguientes. */
export function PetsPage() {
  return (
    <div className="min-h-screen bg-surface-muted px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-4">
        <Link
          to="/dashboard"
          className="text-sm font-medium text-primary-700 hover:text-primary-800"
        >
          ← Volver al panel
        </Link>
        <Card className="p-7">
          <h1 className="text-2xl font-semibold text-neutral-800">Mascotas</h1>
          <p className="mt-2 text-sm text-neutral-600">
            El listado y la ficha clínica se construirán en las próximas fases.
          </p>
        </Card>
      </div>
    </div>
  );
}
