import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={[
        'rounded-2xl border border-neutral-200/70 bg-surface shadow-card',
        className ?? '',
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}
