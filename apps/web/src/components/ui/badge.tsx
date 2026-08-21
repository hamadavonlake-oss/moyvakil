import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-primary/10 text-primary border-transparent',
    secondary: 'bg-secondary/10 text-secondary border-transparent',
    outline: 'text-text border-border',
    success: 'bg-success/10 text-success border-transparent',
    warning: 'bg-warning/10 text-warning-dark border-transparent',
    danger: 'bg-danger/10 text-danger border-transparent',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
