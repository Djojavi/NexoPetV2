import { forwardRef, useId } from 'react';
import type { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  /** Muestra un contador "usados/máximo" cuando se pasa junto a `maxLength`. */
  showCount?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { label, error, showCount, id, className, maxLength, value, ...props },
    ref,
  ) {
    const autoId = useId();
    const textareaId = id ?? autoId;
    const errorId = `${textareaId}-error`;
    const hasError = Boolean(error);
    const currentLength = typeof value === 'string' ? value.length : 0;

    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-neutral-700"
          >
            {label}
          </label>
          {showCount && maxLength ? (
            <span className="text-xs text-neutral-400">
              {currentLength}/{maxLength}
            </span>
          ) : null}
        </div>
        <textarea
          ref={ref}
          id={textareaId}
          maxLength={maxLength}
          value={value}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? errorId : undefined}
          className={[
            'w-full resize-y rounded-lg border bg-surface px-3.5 py-2.5 text-neutral-800',
            'placeholder:text-neutral-400 shadow-soft transition-colors duration-150',
            'focus:outline-none focus:ring-2',
            hasError
              ? 'border-danger focus:border-danger focus:ring-danger/30'
              : 'border-neutral-200 focus:border-primary-500 focus:ring-primary-500/30',
            className ?? '',
          ].join(' ')}
          {...props}
        />
        {hasError ? (
          <p id={errorId} className="text-sm text-danger">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
