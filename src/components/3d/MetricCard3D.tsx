'use client';
import React, { useState } from 'react';

interface MetricCard3DProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  accent?: 'gold' | 'oxford' | 'emerald' | 'burgundy';
}

export function MetricCard3D({
  title,
  value,
  subtitle,
  icon,
  badge,
  trend,
  trendType = 'neutral',
  accent = 'gold',
}: MetricCard3DProps) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotate({
      x: -(y / (rect.height / 2)) * 8,
      y: (x / (rect.width / 2)) * 8,
    });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div
      className="perspective-1000 select-none"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="relative bg-white/95 rounded-2xl p-5 border border-gold-400/30 transition-all duration-150 ease-out preserve-3d overflow-hidden"
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) translateY(${isHovered ? -4 : 0}px)`,
          boxShadow: isHovered
            ? '0 16px 32px -8px rgba(16, 28, 46, 0.14), 0 4px 12px rgba(197, 155, 72, 0.12), inset 0 1px 0 rgba(255,255,255,0.9)'
            : '0 4px 12px -2px rgba(16, 28, 46, 0.06), 0 2px 4px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.8)',
        }}
      >
        {/* Subtle Background Watermark Texture */}
        <div className="absolute inset-0 guilloche-pattern opacity-40 pointer-events-none" />

        {/* Top Gold Foil Accent Bar */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-gold-600 via-gold-400 to-amber-200" />

        {/* Header Row */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-widest text-oxford-700 font-serif">
            {title}
          </span>
          {icon && (
            <div className="p-2 rounded-xl bg-gold-50 text-gold-700 border border-gold-400/30 shadow-xs transform translate-z-10">
              {icon}
            </div>
          )}
        </div>

        {/* Primary Value */}
        <div className="relative z-10 mt-3 flex items-baseline gap-2.5">
          <div className="text-2xl lg:text-3xl font-extrabold text-oxford-950 font-display tracking-tight">
            {value}
          </div>
          {badge && <div className="transform translate-z-10">{badge}</div>}
        </div>

        {/* Subtitle & Trend */}
        {(subtitle || trend) && (
          <div className="relative z-10 mt-2.5 text-xs flex items-center justify-between text-slate-500 font-sans border-t border-slate-100 pt-2">
            <span className="truncate">{subtitle}</span>
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
    </div>
  );
}
