'use client';

import React from 'react';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
  children: React.ReactNode;
  className?: string;
}

export function Badge({
  variant = 'default',
  children,
  className = '',
}: BadgeProps) {
  const variantClasses: Record<string, string> = {
    success: 'bg-accent-green bg-opacity-20 text-accent-green',
    warning: 'bg-accent-gold bg-opacity-20 text-accent-gold',
    error: 'bg-accent-red bg-opacity-20 text-accent-red',
    info: 'bg-primary bg-opacity-20 text-primary',
    default: 'bg-bg-elevated text-text-secondary',
  };

  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
        ${variantClasses[variant]} ${className}
      `}
    >
      {children}
    </span>
  );
}
