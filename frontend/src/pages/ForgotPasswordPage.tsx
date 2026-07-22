import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { forgotPassword } from '../api/auth.api';
import { validateEmail } from '../lib/validators';

// Mensaje neutro mostrado siempre tras el intento (exista o no el backend).
const SUCCESS_MESSAGE =
  'Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(false);
    const emailError = validateEmail(email);
    setError(emailError);
    if (emailError) return;

    setLoading(true);
    try {
      await forgotPassword(email.trim());
    } catch {
      // Ignoramos el resultado a propósito.
    } finally {
      // Práctica de seguridad estándar: nunca revelar si el correo existe, así
      // que mostramos el mismo mensaje de éxito responda 200, 404 o falle la red.
      setSubmitted(true);
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
        {submitted ? (
          <Alert variant="success">{SUCCESS_MESSAGE}</Alert>
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
