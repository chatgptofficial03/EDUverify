'use client';
import React, { useState } from 'react';
import { Award, ShieldCheck, Check } from 'lucide-react';

interface VerificationSeal3DProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'gold' | 'emerald' | 'burgundy';
  className?: string;
  stamped?: boolean;
  withRibbon?: boolean;
}

export function VerificationSeal3D({
  size = 'md',
  variant = 'gold',
  className = '',
  stamped = true,
  withRibbon = true,
}: VerificationSeal3DProps) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const sizeDimensions = {
    sm: { container: 'w-20 h-20', ribbon: 'w-6 h-12', text: 'text-[7px]' },
    md: { container: 'w-28 h-28', ribbon: 'w-8 h-16', text: 'text-[9px]' },
    lg: { container: 'w-36 h-36', ribbon: 'w-10 h-20', text: 'text-[11px]' },
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotate({
      x: -(y / (rect.height / 2)) * 14,
      y: (x / (rect.width / 2)) * 14,
    });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div
      className={`relative inline-flex flex-col items-center select-none perspective-800 ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 3D Medal Body */}
      <div
        className={`relative ${sizeDimensions[size].container} rounded-full preserve-3d transition-transform duration-150 ease-out`}
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale(${stamped ? 1 : 0.9})`,
        }}
      >
        {/* Outer Serrated Starburst / Coin Rim */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-gold-700 via-gold-400 to-amber-200 p-[3px] shadow-3d-gold">
          {/* Beveled Ring */}
          <div className="w-full h-full rounded-full bg-gradient-to-br from-gold-500 via-amber-600 to-gold-800 p-[3px] shadow-inner flex items-center justify-center">
            {/* Inner Recessed Face */}
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-gold-800 via-gold-600 to-amber-400 p-[2px] flex items-center justify-center shadow-3d-pressed">
              <div className="w-full h-full rounded-full bg-gradient-to-b from-amber-700 via-gold-700 to-amber-900 border border-gold-300/60 flex flex-col items-center justify-center relative overflow-hidden">
                {/* Guilloche Radial Lines */}
                <div
                  className="absolute inset-0 opacity-25"
                  style={{
                    backgroundImage: 'radial-gradient(circle, transparent 30%, #000 90%), repeating-conic-gradient(from 0deg, #dfb76c 0deg 15deg, transparent 15deg 30deg)',
                  }}
                />

                {/* Circular Engraved Text */}
                <div
                  className={`absolute inset-1 rounded-full border border-dashed border-gold-300/40 pointer-events-none flex items-center justify-center`}
                >
                  <span className={`font-serif tracking-widest text-gold-200/90 font-bold uppercase ${sizeDimensions[size].text}`}>
                    &bull; AICTE OFFICIAL &bull;
                  </span>
                </div>

                {/* Central Emblem & Checkmark */}
                <div className="relative z-10 flex flex-col items-center justify-center text-amber-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                  <ShieldCheck className={size === 'sm' ? 'w-6 h-6 text-gold-200' : size === 'md' ? 'w-9 h-9 text-gold-100' : 'w-12 h-12 text-gold-100'} />
                  <span className="text-[8px] font-display font-extrabold tracking-wider text-amber-100 mt-0.5">
                    VERIFIED
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Specular Highlight Glint */}
        <div className="absolute top-1 left-2 w-1/3 h-1/4 rounded-full bg-white/30 blur-[2px] pointer-events-none transform -rotate-45" />
      </div>

      {/* Ribbon Tails */}
      {withRibbon && (
        <div className="relative -mt-3 flex gap-1 z-0 pointer-events-none">
          {/* Left Ribbon */}
          <div
            className={`${sizeDimensions[size].ribbon} bg-oxford-900 border-x border-b border-gold-500/50 shadow-md transform -rotate-12 origin-top`}
            style={{
              clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 80%, 0% 100%)',
            }}
          />
          {/* Right Ribbon */}
          <div
            className={`${sizeDimensions[size].ribbon} bg-burgundy/90 border-x border-b border-gold-400/50 shadow-md transform rotate-12 origin-top`}
            style={{
              clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 80%, 0% 100%)',
            }}
          />
        </div>
      )}
    </div>
  );
}
