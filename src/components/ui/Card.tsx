import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function Card({ children, className = '', title, subtitle, action }: CardProps) {
  return (
    <div className={`bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden ${className}`}>
      {(title || subtitle || action) && (
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            {title && <h3 className="font-semibold text-slate-800 text-base">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  badge,
  trend,
  trendType = 'neutral',
}: MetricCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">{title}</span>
        {icon && <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">{icon}</div>}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        {badge}
      </div>
      {(subtitle || trend) && (
        <div className="mt-2 text-xs flex items-center justify-between text-slate-500">
          <span>{subtitle}</span>
          {trend && (
            <span
              className={`font-medium ${
                trendType === 'positive'
                  ? 'text-emerald-600'
                  : trendType === 'negative'
                  ? 'text-rose-600'
                  : 'text-slate-600'
              }`}
            >
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
