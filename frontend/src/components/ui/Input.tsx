import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  /** Contenido opcional a la derecha del input (p. ej. un botón mostrar/ocultar). */
  trailing?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, trailing, id, className, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;
  const hasError = Boolean(error);

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-neutral-700"
      >
        {label}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? errorId : undefined}
          className={[
            'w-full rounded-lg border bg-surface px-3.5 py-2.5 text-neutral-800',
            'placeholder:text-neutral-400 shadow-soft transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            trailing ? 'pr-11' : '',
            hasError
              ? 'border-danger focus:border-danger focus:ring-danger/30'
              : 'border-neutral-200 focus:border-primary-500 focus:ring-primary-500/30',
            className ?? '',
          ].join(' ')}
          {...props}
        />
        {trailing ? (
          <div className="absolute inset-y-0 right-2 flex items-center">
            {trailing}
          </div>
        ) : null}
      </div>
      {hasError ? (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
});
