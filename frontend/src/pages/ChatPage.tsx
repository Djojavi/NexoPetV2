import { Card } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';

/** Placeholder de chat — el chat-service aún no está implementado. */
export function ChatPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <Card className="space-y-4 p-7">
        <h2 className="text-xl font-semibold text-neutral-800">Chat</h2>
        <Alert variant="info">
          El servicio de chat estará disponible próximamente.
        </Alert>
      </Card>
    </div>
  );
}
