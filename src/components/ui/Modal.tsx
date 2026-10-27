'use client';
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthMap = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-oxford-950/70 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className={`bg-white rounded-3xl shadow-3d-dark border border-gold-300/40 w-full ${widthMap[maxWidth]} overflow-hidden animate-in fade-in zoom-in-95 duration-150 relative`}
      >
        {/* Top Gold Accent Bar */}
        <div className="h-1 bg-gradient-to-r from-gold-600 via-amber-300 to-gold-600" />

        <div className="px-6 py-4.5 border-b border-gold-200/40 bg-parchment-50 flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-oxford-950 text-base sm:text-lg flex items-center gap-2">
              <span className="w-1.5 h-4 bg-gold-500 rounded-full inline-block" />
              {title}
            </h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5 ml-3.5 font-sans">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-oxford-950 rounded-xl hover:bg-gold-50 transition-colors border border-transparent hover:border-gold-300/40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 relative max-h-[85vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
