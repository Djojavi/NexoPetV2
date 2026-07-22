import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { resetPassword } from '../api/auth.api';
import { getErrorMessage } from '../api/client';
import {
  validateConfirmPassword,
  validateNewPassword,
} from '../lib/validators';

interface FieldErrors {
  password?: string;
  confirm?: string;
}

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Tras un reset exitoso, llevamos al login pasados ~2s.
  useEffect(() => {
    if (!success) return;
    const id = window.setTimeout(() => navigate('/login', { replace: true }), 2000);
    return () => window.clearTimeout(id);
  }, [success, navigate]);

  function runValidation(): FieldErrors {
    return {
      password: validateNewPassword(password),
      confirm: validateConfirmPassword(password, confirm),
    };
  }

  function handleBlur(field: keyof FieldErrors) {
    const next = runValidation();
    setErrors((prev) => ({ ...prev, [field]: next[field] }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!token) return;
    setSubmitError(null);
    const validation = runValidation();
    setErrors(validation);
    if (validation.password || validation.confirm) return;

    setLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  // Enlace inválido: no hay token en la URL. Sin formulario.
  if (!token) {
    return (
      <AuthLayout
        title="Enlace no válido"
        footer={
          <Link
            to="/login"
            className="font-semibold text-primary-700 hover:text-primary-800"
          >
            Volver a iniciar sesión
          </Link>
        }
      >
        <div className="space-y-5">
          <Alert variant="error">
            Este enlace no es válido. Solicita uno nuevo.
          </Alert>
          <Link
            to="/forgot-password"
            className="inline-flex items-center font-semibold text-primary-700 hover:text-primary-800"
          >
            Solicitar un nuevo enlace
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Restablece tu contraseña"
      subtitle="Elige una nueva contraseña para tu cuenta."
      footer={
        <>
          ¿Recordaste tu contraseña?{' '}
          <Link
            to="/login"
            className="font-semibold text-primary-700 hover:text-primary-800"
          >
            Inicia sesión
          </Link>
        </>
      }
    >
      {success ? (
        <div className="space-y-5">
          <Alert variant="success">Tu contraseña fue actualizada.</Alert>
          <p className="text-sm text-neutral-500">
            Te llevaremos al inicio de sesión en unos segundos…
          </p>
          <Button
            fullWidth
            onClick={() => navigate('/login', { replace: true })}
          >
            Ir a iniciar sesión
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {submitError ? (
            <div className="space-y-2">
              <Alert variant="error">{submitError}</Alert>
              <Link
                to="/forgot-password"
                className="inline-block text-sm font-medium text-primary-700 hover:text-primary-800"
              >
                Solicitar un nuevo enlace
              </Link>
            </div>
          ) : null}

          <Input
            label="Nueva contraseña"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Mínimo 6, una letra y un número"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => handleBlur('password')}
            error={errors.password}
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="rounded px-1.5 text-xs font-medium text-neutral-500 hover:text-primary-700"
                aria-label={
                  showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                }
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            }
          />

          <Input
            label="Confirmar contraseña"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Repite tu contraseña"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onBlur={() => handleBlur('confirm')}
            error={errors.confirm}
          />

          <Button type="submit" fullWidth loading={loading}>
            {loading ? 'Actualizando…' : 'Actualizar contraseña'}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
