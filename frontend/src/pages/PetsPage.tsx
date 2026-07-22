import { Card } from '../components/ui/Card';

/** Placeholder de mascotas — el listado y la ficha clínica llegan en fases siguientes. */
export function PetsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <Card className="p-7">
        <h2 className="text-xl font-semibold text-neutral-800">Mascotas</h2>
        <p className="mt-2 text-sm text-neutral-600">
          El listado y la ficha clínica se construirán en las próximas fases.
        </p>
      </Card>
    </div>
  );
}
