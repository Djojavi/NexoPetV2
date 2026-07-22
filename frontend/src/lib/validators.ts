// Validaciones de formularios reutilizables. Devuelven `undefined` si el valor es
// válido, o un mensaje de error en español si no lo es.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string): string | undefined {
  const email = value.trim();
  if (!email) return 'El correo es obligatorio';
  if (!EMAIL_REGEX.test(email)) return 'Ingresa un correo válido';
  return undefined;
}

/** Contraseña de login: solo exige longitud mínima. */
export function validateLoginPassword(value: string): string | undefined {
  if (!value) return 'La contraseña es obligatoria';
  if (value.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
  return undefined;
}

/** Contraseña de registro: mínimo 6, con al menos una letra y un número. */
export function validateNewPassword(value: string): string | undefined {
  if (!value) return 'La contraseña es obligatoria';
  if (value.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
    return 'Debe incluir al menos una letra y un número';
  }
  return undefined;
}

export function validateName(value: string): string | undefined {
  const name = value.trim();
  if (!name) return 'El nombre es obligatorio';
  if (name.length < 2) return 'El nombre debe tener al menos 2 caracteres';
  return undefined;
}

export function validateConfirmPassword(
  password: string,
  confirm: string,
): string | undefined {
  if (!confirm) return 'Confirma tu contraseña';
  if (password !== confirm) return 'Las contraseñas no coinciden';
  return undefined;
}
