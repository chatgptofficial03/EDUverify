import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  pattern?: boolean;
}

export function Card({ children, className = '', title, subtitle, action, pattern = false }: CardProps) {
  return (
    <div
      className={`bg-white/95 border border-gold-300/35 rounded-2xl shadow-3d-sm hover:shadow-3d-md transition-all duration-200 overflow-hidden relative ${className}`}
    >
      {pattern && <div className="absolute inset-0 guilloche-pattern opacity-30 pointer-events-none" />}
      {(title || subtitle || action) && (
        <div className="px-6 py-4 border-b border-gold-200/40 bg-gradient-to-r from-parchment-50 via-white to-parchment-50 flex items-center justify-between relative z-10">
          <div>
            {title && (
              <h3 className="font-serif font-bold text-oxford-950 text-base tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-gold-500 rounded-full inline-block" />
                {title}
              </h3>
            )}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5 ml-3.5 font-sans">{subtitle}</p>}
          </div>
          {action && <div className="relative z-10">{action}</div>}
        </div>
      )}
      <div className="p-6 relative z-10">{children}</div>
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
    <div className="bg-white/95 border border-gold-300/35 rounded-2xl p-5 shadow-3d-sm hover:shadow-3d-md transition-all duration-200 hover:-translate-y-0.5 relative overflow-hidden group">
      {/* Top Gold Foil hairline accent */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-gold-400 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-widest text-oxford-700 font-serif">
          {title}
        </span>
        {icon && (
          <div className="p-2 bg-gold-50 text-gold-700 rounded-xl border border-gold-300/40 shadow-xs">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <div className="text-2xl lg:text-3xl font-extrabold text-oxford-950 font-display tracking-tight">
          {value}
        </div>
        {badge}
      </div>

      {(subtitle || trend) && (
        <div className="mt-2 text-xs flex items-center justify-between text-slate-500 border-t border-slate-100 pt-2 font-sans">
          <span>{subtitle}</span>
          {trend && (
            <span
              className={`font-semibold text-[11px] ${
                trendType === 'positive'
                  ? 'text-emerald-700'
                  : trendType === 'negative'
                  ? 'text-rose-700'
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
