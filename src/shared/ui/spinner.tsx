import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@shared/lib';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'default' | 'lg';
}

const sizeClasses = {
  sm: 'h-4 w-4',
  default: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export function Spinner({ size = 'default', className, ...props }: SpinnerProps) {
  return (
    <div className={cn('animate-spin', className)} {...props}>
      <Loader2 className={cn(sizeClasses[size], 'text-muted-foreground')} />
    </div>
  );
}

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'default' | 'lg';
  text?: string;
}

export function LoadingSpinner({ 
  size = 'default', 
  text = 'Загрузка...', 
  className,
  ...props 
}: LoadingSpinnerProps) {
  return (
    <div 
      className={cn('flex flex-col items-center justify-center gap-2 py-8', className)} 
      {...props}
    >
      <Spinner size={size} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

export function PageLoading() {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}
