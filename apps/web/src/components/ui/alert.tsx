import type { ReactNode } from 'react';

interface AlertProps {
  children: ReactNode;
  className?: string;
}

export function Alert({ children, className = '' }: AlertProps) {
  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      {children}
    </div>
  );
}

export function AlertDescription({ children, className = '' }: AlertProps) {
  return <div className={`text-sm text-blue-800 ${className}`}>{children}</div>;
}

export function AlertTitle({ children, className = '' }: AlertProps) {
  return <h5 className={`font-medium text-blue-900 mb-1 ${className}`}>{children}</h5>;
}
