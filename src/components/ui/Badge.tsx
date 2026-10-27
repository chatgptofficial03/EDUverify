import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple';
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'neutral', size = 'sm' }: BadgeProps) {
  const variantStyles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    danger: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    info: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    purple: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 rounded-full',
    md: 'text-sm px-2.5 py-1 rounded-md',
  };

  return (
    <span
      className={`inline-flex items-center font-medium border ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  switch (status?.toUpperCase()) {
    case 'ACTIVE':
    case 'APPROVED':
    case 'NORMAL':
    case 'VALID':
      return <Badge variant="success">{status}</Badge>;
    case 'PROVISIONAL':
    case 'APPROACHING':
    case 'UNDER_REVIEW':
    case 'WARNING':
      return <Badge variant="warning">{status}</Badge>;
    case 'REJECTED':
    case 'OVER_CAPACITY':
    case 'INVALID':
    case 'DISCONTINUED':
      return <Badge variant="danger">{status}</Badge>;
    case 'SUBMITTED':
    case 'PENDING':
    case 'VALIDATED':
      return <Badge variant="info">{status}</Badge>;
    default:
      return <Badge variant="neutral">{status || 'UNKNOWN'}</Badge>;
  }
}
