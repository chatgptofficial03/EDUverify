import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple' | 'gold';
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'neutral', size = 'sm' }: BadgeProps) {
  const variantStyles = {
    success: 'bg-emerald-50 text-emerald-800 border-emerald-300/80 shadow-xs font-medium',
    warning: 'bg-amber-50 text-amber-900 border-amber-300/80 shadow-xs font-medium',
    danger: 'bg-rose-50 text-rose-800 border-rose-300/80 shadow-xs font-medium',
    info: 'bg-oxford-50 text-oxford-800 border-oxford-300/80 shadow-xs font-medium',
    neutral: 'bg-slate-100 text-slate-800 border-slate-300 shadow-xs font-medium',
    purple: 'bg-purple-50 text-purple-900 border-purple-300/80 shadow-xs font-medium',
    gold: 'bg-gradient-to-r from-gold-100/90 to-amber-100/90 text-gold-950 border-gold-400/60 shadow-xs font-serif font-semibold',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-0.5 rounded-full tracking-wide',
    md: 'text-xs px-3 py-1 rounded-md tracking-wide',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 border ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      {variant === 'success' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />}
      {variant === 'gold' && <span className="w-1.5 h-1.5 rounded-full bg-gold-600 inline-block" />}
      {variant === 'warning' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />}
      {variant === 'danger' && <span className="w-1.5 h-1.5 rounded-full bg-rose-600 inline-block" />}
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
