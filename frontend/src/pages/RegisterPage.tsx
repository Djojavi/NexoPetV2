import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/client';
import {
  validateConfirmPassword,
  validateEmail,
  validateName,
  validateNewPassword,
} from '../lib/validators';

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
}

export function RegisterPage() {
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function runValidation(): FieldErrors {
    return {
      name: validateName(name),
      email: validateEmail(email),
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
    setSubmitError(null);
    const validation = runValidation();
    setErrors(validation);
    if (
      validation.name ||
      validation.email ||
      validation.password ||
      validation.confirm
    ) {
      return;
    }

    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      // El registro no devuelve token: iniciamos sesión con las mismas credenciales.
      await login(email.trim(), password);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      const message = getErrorMessage(error);
      // "El correo ya está registrado" se muestra en el campo de email.
      if (/correo ya está registrado/i.test(message)) {
        setErrors((prev) => ({ ...prev, email: message }));
      } else {
        setSubmitError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Crea tu cuenta"
      subtitle="Únete a NexoPet y lleva el historial clínico de tus mascotas."
      footer={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link
            to="/login"
            className="font-semibold text-primary-700 hover:text-primary-800"
          >
            Inicia sesión
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {submitError ? <Alert variant="error">{submitError}</Alert> : null}

        <Input
          label="Nombre completo"
          type="text"
          autoComplete="name"
          placeholder="Ej. Ana Gómez"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => handleBlur('name')}
          error={errors.name}
        />

        <Input
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          placeholder="tu@correo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => handleBlur('email')}
          error={errors.email}
        />

        <Input
          label="Contraseña"
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
          {loading ? 'Creando cuenta…' : 'Crear cuenta'}
        </Button>
      </form>
    </AuthLayout>
  );
}
