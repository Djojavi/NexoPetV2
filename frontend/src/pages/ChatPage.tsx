import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';

/** Placeholder de chat — el chat-service aún no está implementado. */
export function ChatPage() {
  return (
    <div className="min-h-screen bg-surface-muted px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-4">
        <Link
          to="/dashboard"
          className="text-sm font-medium text-primary-700 hover:text-primary-800"
        >
          ← Volver al panel
        </Link>
        <Card className="p-7 space-y-4">
          <h1 className="text-2xl font-semibold text-neutral-800">Chat</h1>
          <Alert variant="info">
            El servicio de chat estará disponible próximamente.
          </Alert>
        </Card>
      </div>
    </div>
  );
}
