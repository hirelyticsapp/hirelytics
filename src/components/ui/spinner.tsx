import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <Loader2 className={cn('animate-spin text-muted-foreground', sizeClasses[size], className)} />
  );
}

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  className?: string;
  disabled?: boolean;
}

export function LoadingButton({
  children,
  isLoading = false,
  loadingText,
  className,
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={cn('inline-flex items-center justify-center gap-2 disabled:opacity-50', className)}
    >
      {isLoading && <Spinner size="sm" className="text-current" />}
      {isLoading && loadingText ? loadingText : children}
    </button>
  );
}
