import type React from 'react';
import { cn } from '@shared/lib';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => (
  <div className={cn('bg-white rounded-xl border border-gray-200 shadow-sm p-6', className)}>
    {children}
  </div>
);
