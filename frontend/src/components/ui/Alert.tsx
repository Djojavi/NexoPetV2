import type { ReactNode } from 'react';

type AlertVariant = 'error' | 'success' | 'info';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
}

const STYLES: Record<AlertVariant, { container: string; icon: string }> = {
  error: {
    container: 'bg-red-50 border-danger/30 text-red-800',
    icon: '⚠️',
  },
  success: {
    container: 'bg-green-50 border-success/30 text-green-800',
    icon: '✅',
  },
  info: {
    container: 'bg-primary-50 border-primary-300 text-primary-800',
    icon: 'ℹ️',
  },
};

export function Alert({ variant = 'info', title, children }: AlertProps) {
  const style = STYLES[variant];
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={`flex gap-3 rounded-lg border px-4 py-3 text-sm ${style.container}`}
    >
      <span aria-hidden="true" className="mt-0.5 leading-none">
        {style.icon}
      </span>
      <div className="space-y-0.5">
        {title ? <p className="font-semibold">{title}</p> : null}
        <div>{children}</div>
      </div>
    </div>
  );
}
