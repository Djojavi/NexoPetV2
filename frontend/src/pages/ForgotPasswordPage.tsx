import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { forgotPassword } from '../api/auth.api';
import { validateEmail } from '../lib/validators';

type Feedback =
  | { type: 'success'; message: string }
  | { type: 'info'; message: string }
  | null;

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFeedback(null);
    const emailError = validateEmail(email);
    setError(emailError);
    if (emailError) return;

    setLoading(true);
    try {
      await forgotPassword(email.trim());
      // Si el backend llegara a responder 200, confirmamos el envío.
      setFeedback({
        type: 'success',
        message:
          'Si el correo existe, te enviamos instrucciones para restablecer tu contraseña.',
      });
    } catch {
      // El endpoint aún no existe: mensaje amable, sin exponer detalles técnicos.
      setFeedback({
        type: 'info',
        message:
          'El servicio de recuperación de contraseña estará disponible próximamente.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Recupera tu contraseña"
      subtitle="Te enviaremos instrucciones al correo asociado a tu cuenta."
      footer={
        <>
          ¿Recordaste tu contraseña?{' '}
          <Link
            to="/login"
            className="font-semibold text-primary-700 hover:text-primary-800"
          >
            Volver a iniciar sesión
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {feedback ? (
          <Alert variant={feedback.type}>{feedback.message}</Alert>
        ) : null}

        <Input
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          placeholder="tu@correo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setError(validateEmail(email))}
          error={error}
        />

        <Button type="submit" fullWidth loading={loading}>
          {loading ? 'Enviando…' : 'Enviar instrucciones'}
        </Button>
      </form>
    </AuthLayout>
  );
}
