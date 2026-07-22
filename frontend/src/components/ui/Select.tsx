import { forwardRef, useId } from 'react';
import type { SelectHTMLAttributes } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: SelectOption[];
  /** Texto de la opción vacía inicial (deshabilitada). */
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, options, placeholder, id, className, ...props },
  ref,
) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const errorId = `${selectId}-error`;
  const hasError = Boolean(error);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={selectId} className="text-sm font-medium text-neutral-700">
        {label}
      </label>
      <select
        ref={ref}
        id={selectId}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? errorId : undefined}
        className={[
          'w-full rounded-lg border bg-surface px-3.5 py-2.5 text-neutral-800',
          'shadow-soft transition-colors duration-150 focus:outline-none focus:ring-2',
          hasError
            ? 'border-danger focus:border-danger focus:ring-danger/30'
            : 'border-neutral-200 focus:border-primary-500 focus:ring-primary-500/30',
          className ?? '',
        ].join(' ')}
        {...props}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hasError ? (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
});
