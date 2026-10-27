'use client';
import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  QrCode,
  Sparkles,
  Lock,
  RotateCw,
  Copy,
  Check,
  CheckCircle2,
  GraduationCap,
  Cpu,
} from 'lucide-react';

interface ApaarCard3DProps {
  student: {
    fullName: string;
    apaarId: string;
    maskedApaarId?: string;
    studentRecordNumber: string;
    programme: string;
    course?: string;
    academicYear: string;
    institutionName: string;
    institutionCode?: string;
    enrolmentStatus?: string;
  };
  className?: string;
  autoRotateInit?: boolean;
}

export function ApaarCard3D({ student, className = '', autoRotateInit = false }: ApaarCard3DProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [autoRotate, setAutoRotate] = useState(autoRotateInit);
  const [copied, setCopied] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const autoRotateRef = useRef<number | null>(null);

  // Auto rotation effect when enabled
  useEffect(() => {
    if (!autoRotate || isHovered) return;
    let angle = 0;
    const interval = setInterval(() => {
      angle = (angle + 1) % 360;
      const rad = (angle * Math.PI) / 180;
      setRotateY(Math.sin(rad) * 15);
      setRotateX(Math.cos(rad) * 6);
      setGlarePos({
        x: 50 + Math.sin(rad) * 35,
        y: 50 + Math.cos(rad) * 35,
        opacity: 0.35,
      });
    }, 40);
    return () => clearInterval(interval);
  }, [autoRotate, isHovered]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rX = -((y - centerY) / centerY) * 16;
    const rY = ((x - centerX) / centerX) * 18;

    setRotateX(rX);
    setRotateY(rY);
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.6,
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (!autoRotate) {
      setRotateX(0);
      setRotateY(0);
      setGlarePos({ x: 50, y: 50, opacity: 0 });
    }
  };

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    const idToCopy = student.apaarId || student.maskedApaarId || '';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(idToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Generate a deterministic photo avatar placeholder initials
  const initials = student.fullName
    ? student.fullName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'ED';

  const formatApaar = (id?: string) => {
    if (!id) return '•••• •••• ••••';
    const clean = id.replace(/\s+/g, '');
    if (clean.length === 12) {
      return `${clean.slice(0, 4)} ${clean.slice(4, 8)} ${clean.slice(8, 12)}`;
    }
    return id;
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* 3D Perspective Viewport */}
      <div
        className="w-full max-w-[420px] h-[260px] cursor-pointer select-none perspective-1200"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          ref={cardRef}
          className="relative w-full h-full duration-200 ease-out preserve-3d"
          style={{
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY + (isFlipped ? 180 : 0)}deg) scale3d(${
              isHovered ? 1.03 : 1
            }, ${isHovered ? 1.03 : 1}, 1)`,
            transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
        >
          {/* ==================== FRONT OF CARD ==================== */}
          <div
            className="absolute inset-0 w-full h-full rounded-2xl p-5 overflow-hidden backface-hidden shadow-3d-lg border border-gold-400/40"
            style={{
              background: 'linear-gradient(135deg, #0e1726 0%, #16253d 45%, #0a0f18 100%)',
            }}
          >
            {/* Guilloche & Security Background Texture */}
            <div className="absolute inset-0 dark-guilloche-pattern opacity-60 pointer-events-none" />

            {/* Specular Glare Layer */}
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 235, 170, ${glarePos.opacity}) 0%, rgba(255,255,255,0) 60%)`,
              }}
            />

            {/* Holographic Security Strip */}
            <div className="absolute top-0 right-12 w-14 h-full hologram-shimmer opacity-30 pointer-events-none border-x border-white/20" />

            {/* Header: Government / AICTE Crest */}
            <div className="relative z-10 flex items-center justify-between border-b border-gold-500/30 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-gold-600 via-gold-400 to-amber-200 p-[1.5px] shadow-sm">
                  <div className="w-full h-full bg-oxford-950 rounded-[7px] flex items-center justify-center text-gold-400">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-[9px] font-semibold text-gold-400 tracking-widest uppercase font-serif">
                    Ministry of Education &bull; AICTE
                  </div>
                  <div className="text-xs font-bold text-white tracking-wider font-display">
                    APAAR ACADEMIC IDENTITY
                  </div>
                </div>
              </div>

              {/* Status Pill */}
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold-500/15 border border-gold-400/40 text-gold-300 text-[10px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>VERIFIED</span>
              </div>
            </div>

            {/* Card Body: Chip + Photo + Student Info */}
            <div className="relative z-10 mt-3 flex items-start gap-4">
              {/* Photo Frame + Smart Chip */}
              <div className="flex flex-col items-center gap-2">
                {/* 3D Smart EMV Chip */}
                <div className="w-9 h-7 rounded bg-gradient-to-br from-amber-200 via-gold-400 to-amber-600 p-[1px] shadow-md">
                  <div className="w-full h-full bg-gold-400/30 rounded-[3px] flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-x-0 top-1/2 h-[1px] bg-amber-800/60" />
                    <div className="absolute inset-y-0 left-1/3 w-[1px] bg-amber-800/60" />
                    <div className="absolute inset-y-0 right-1/3 w-[1px] bg-amber-800/60" />
                    <Cpu className="w-3.5 h-3.5 text-amber-950/80 relative z-10" />
                  </div>
                </div>

                {/* Avatar with gold border */}
                <div className="w-14 h-16 rounded-lg bg-gradient-to-b from-oxford-800 to-oxford-900 border-2 border-gold-400/60 shadow-md flex flex-col items-center justify-center text-gold-300 font-serif font-bold text-sm relative overflow-hidden">
                  <div className="absolute -bottom-1 inset-x-0 h-4 bg-gold-500/20 backdrop-blur-xs flex items-center justify-center text-[7px] text-gold-300 uppercase font-mono">
                    ID PHOTO
                  </div>
                  <span>{initials}</span>
                </div>
              </div>

              {/* Student Details */}
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-mono text-gold-400/80 uppercase tracking-wider">
                  Candidate Name
                </div>
                <div className="text-sm font-bold text-white tracking-wide truncate font-serif">
                  {student.fullName}
                </div>

                <div className="mt-1 text-[9px] text-slate-300 truncate">
                  <span className="text-gold-400/80 font-mono">Inst:</span> {student.institutionName}
                </div>
                <div className="text-[9px] text-slate-300 truncate">
                  <span className="text-gold-400/80 font-mono">Prog:</span> {student.programme}
                </div>

                {/* APAAR Number Bar with Embossed 3D effect */}
                <div className="mt-2.5 p-1.5 rounded-lg bg-black/40 border border-gold-500/40 flex items-center justify-between">
                  <div>
                    <div className="text-[8px] uppercase tracking-wider text-gold-400 font-mono">
                      APAAR ID (12-DIGIT)
                    </div>
                    <div className="text-xs font-mono font-bold tracking-widest text-gold-200">
                      {formatApaar(student.apaarId || student.maskedApaarId)}
                    </div>
                  </div>
                  <button
                    onClick={handleCopyId}
                    title="Copy APAAR ID"
                    className="p-1 text-gold-400 hover:text-white hover:bg-gold-500/20 rounded transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Strip */}
            <div className="relative z-10 mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[9px] text-slate-400 font-mono">
              <div>ROLL: {student.studentRecordNumber}</div>
              <div>YEAR: {student.academicYear}</div>
              <div className="flex items-center gap-1 text-gold-400">
                <Sparkles className="w-2.5 h-2.5" />
                <span>TAP TO FLIP</span>
              </div>
            </div>
          </div>

          {/* ==================== BACK OF CARD ==================== */}
          <div
            className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden backface-hidden rotate-y-180 shadow-3d-lg border border-gold-400/40 p-5 flex flex-col justify-between"
            style={{
              background: 'linear-gradient(135deg, #090e17 0%, #121c2d 50%, #060a10 100%)',
            }}
          >
            {/* Guilloche Security Background */}
            <div className="absolute inset-0 dark-guilloche-pattern opacity-40 pointer-events-none" />

            {/* Magnetic Stripe */}
            <div className="-mx-5 -mt-2 h-10 bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 border-y border-neutral-800 shadow-inner relative flex items-center px-4">
              <div className="h-[2px] w-full bg-gold-500/30" />
            </div>

            {/* Security Cryptographic Signature & Seal */}
            <div className="relative z-10 space-y-2 mt-1">
              <div className="flex items-center justify-between bg-black/40 p-2 rounded-lg border border-white/10">
                <div>
                  <div className="text-[8px] text-gold-400 uppercase font-mono tracking-wider">
                    CRYPTOGRAPHIC AUDIT RECORD
                  </div>
                  <div className="text-[10px] text-slate-300 font-mono truncate max-w-[240px]">
                    SHA256: 8f4c9a2e...verified_aicte_registry
                  </div>
                </div>
                <div className="w-6 h-6 rounded-full bg-gold-500/20 border border-gold-400/50 flex items-center justify-center text-gold-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Authorized Signature Block */}
              <div className="flex items-center justify-between pt-1">
                <div className="space-y-0.5">
                  <div className="text-[8px] text-slate-400 font-mono uppercase">Authorized Registrar</div>
                  <div className="font-serif italic text-xs text-gold-300 font-bold tracking-wider">
                    Prof. Anil Sahasrabudhe
                  </div>
                  <div className="text-[7px] text-slate-400">Chairman, AICTE Academic Council</div>
                </div>

                {/* Simulated QR Code */}
                <div className="w-12 h-12 bg-white rounded p-1 shadow-md flex items-center justify-center">
                  <QrCode className="w-10 h-10 text-oxford-950" />
                </div>
              </div>
            </div>

            {/* Disclaimer & Notice */}
            <div className="relative z-10 text-[8px] text-slate-400 leading-tight border-t border-white/10 pt-2 flex items-center justify-between">
              <span>This APAAR credential is cryptographically tied to the One Nation, One Student ID initiative.</span>
              <span className="text-gold-400 font-mono shrink-0 ml-2">SIH26263</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Controls below card */}
      <div className="mt-3 flex items-center gap-3 text-xs">
        <button
          type="button"
          onClick={() => setIsFlipped(!isFlipped)}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-oxford-900 text-gold-300 border border-gold-500/30 hover:bg-oxford-850 shadow-sm transition-all text-[11px]"
        >
          <RotateCw className="w-3 h-3" />
          <span>Flip to {isFlipped ? 'Front' : 'Back'}</span>
        </button>

        <button
          type="button"
          onClick={() => setAutoRotate(!autoRotate)}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] transition-all ${
            autoRotate
              ? 'bg-gold-500/20 text-gold-300 border-gold-400'
              : 'bg-oxford-900/60 text-slate-400 border-slate-700 hover:text-white'
          }`}
        >
          <Sparkles className="w-3 h-3" />
          <span>{autoRotate ? '3D Spin: ON' : '3D Spin: OFF'}</span>
        </button>
      </div>
    </div>
  );
}
