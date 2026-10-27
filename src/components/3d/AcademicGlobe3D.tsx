'use client';
import React, { useEffect, useRef } from 'react';

interface AcademicGlobe3DProps {
  className?: string;
  size?: number;
  interactive?: boolean;
}

export function AcademicGlobe3D({ className = '', size = 360, interactive = true }: AcademicGlobe3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angleY = 0;
    let angleX = 0.25;

    // Device Pixel Ratio scaling for ultra crisp display
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    // 3D Nodes representing academic institutions
    const nodeCount = 28;
    const nodes: { x: number; y: number; z: number; radius: number; color: string; label?: string }[] = [];
    const sphereRadius = size * 0.36;

    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / nodeCount);
      const theta = Math.sqrt(nodeCount * Math.PI) * phi;
      nodes.push({
        x: sphereRadius * Math.cos(theta) * Math.sin(phi),
        y: sphereRadius * Math.sin(theta) * Math.sin(phi),
        z: sphereRadius * Math.cos(phi),
        radius: 2.2 + (i % 3) * 0.8,
        color: i % 4 === 0 ? '#dfb76c' : i % 4 === 1 ? '#5f80ad' : '#f5edd2',
      });
    }

    // Rings generation for armillary sphere
    const rings = [
      { radius: sphereRadius * 1.08, tiltX: 0.15, tiltZ: 0, speed: 0.007, color: 'rgba(223, 183, 108, 0.45)', width: 1.5 },
      { radius: sphereRadius * 0.98, tiltX: 0.85, tiltZ: 0.3, speed: -0.005, color: 'rgba(197, 155, 72, 0.35)', width: 1.2 },
      { radius: sphereRadius * 0.88, tiltX: -0.65, tiltZ: -0.4, speed: 0.009, color: 'rgba(95, 128, 173, 0.4)', width: 1.0 },
    ];

    const render = () => {
      ctx.clearRect(0, 0, size, size);

      // Smooth mouse damping
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      angleY += 0.008 + mouseRef.current.x * 0.02;
      const currentAngleX = angleX + mouseRef.current.y * 0.3;

      const cosX = Math.cos(currentAngleX);
      const sinX = Math.sin(currentAngleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);

      const cx = size / 2;
      const cy = size / 2;
      const focalLength = size * 1.2;

      // Project 3D point to 2D
      const project = (x: number, y: number, z: number) => {
        // Rotate Y
        let rx1 = x * cosY - z * sinY;
        let rz1 = x * sinY + z * cosY;
        // Rotate X
        let ry2 = y * cosX - rz1 * sinX;
        let rz2 = y * sinX + rz1 * cosX;

        const distance = focalLength / (focalLength + rz2);
        return {
          x: cx + rx1 * distance,
          y: cy + ry2 * distance,
          z: rz2,
          scale: distance,
        };
      };

      // Draw Outer Glow / Halo
      const gradient = ctx.createRadialGradient(cx, cy, sphereRadius * 0.2, cx, cy, sphereRadius * 1.2);
      gradient.addColorStop(0, 'rgba(197, 155, 72, 0.12)');
      gradient.addColorStop(0.5, 'rgba(16, 28, 46, 0.04)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy, sphereRadius * 1.25, 0, Math.PI * 2);
      ctx.fill();

      // Render 3D Armillary Rings
      rings.forEach((ring) => {
        ctx.beginPath();
        ctx.lineWidth = ring.width;
        ctx.strokeStyle = ring.color;

        const segments = 48;
        let first = true;
        for (let j = 0; j <= segments; j++) {
          const theta = (j / segments) * Math.PI * 2;
          let px = ring.radius * Math.cos(theta);
          let py = ring.radius * Math.sin(theta) * Math.cos(ring.tiltX);
          let pz = ring.radius * Math.sin(theta) * Math.sin(ring.tiltX);

          // Additional tilt
          const px2 = px * Math.cos(ring.tiltZ) - py * Math.sin(ring.tiltZ);
          const py2 = px * Math.sin(ring.tiltZ) + py * Math.cos(ring.tiltZ);

          const proj = project(px2, py2, pz);
          if (first) {
            ctx.moveTo(proj.x, proj.y);
            first = false;
          } else {
            ctx.lineTo(proj.x, proj.y);
          }
        }
        ctx.stroke();
      });

      // Project Nodes
      const projectedNodes = nodes.map((node) => {
        const proj = project(node.x, node.y, node.z);
        return { ...node, ...proj };
      });

      // Sort nodes back-to-front for proper depth perception
      projectedNodes.sort((a, b) => a.z - b.z);

      // Draw Constellation Interconnecting Lines
      ctx.lineWidth = 0.75;
      for (let i = 0; i < projectedNodes.length; i++) {
        for (let j = i + 1; j < projectedNodes.length; j++) {
          const dx = projectedNodes[i].x - projectedNodes[j].x;
          const dy = projectedNodes[i].y - projectedNodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < size * 0.22) {
            const alpha = Math.max(0, 0.3 - dist / (size * 0.22));
            ctx.strokeStyle = `rgba(223, 183, 108, ${alpha * 0.8})`;
            ctx.beginPath();
            ctx.moveTo(projectedNodes[i].x, projectedNodes[i].y);
            ctx.lineTo(projectedNodes[j].x, projectedNodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw Central Floating AICTE Core
      const coreProj = project(0, 0, 0);
      const coreGrad = ctx.createRadialGradient(coreProj.x, coreProj.y, 2, coreProj.x, coreProj.y, 14);
      coreGrad.addColorStop(0, '#fff4d0');
      coreGrad.addColorStop(0.4, '#c59b48');
      coreGrad.addColorStop(1, 'rgba(197, 155, 72, 0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(coreProj.x, coreProj.y, 16, 0, Math.PI * 2);
      ctx.fill();

      // Render Nodes with 3D Depth
      projectedNodes.forEach((node) => {
        // Node halo
        const alpha = Math.min(1, Math.max(0.2, (node.z + sphereRadius) / (sphereRadius * 2)));
        ctx.fillStyle = node.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * node.scale, 0, Math.PI * 2);
        ctx.fill();

        // Glowing center
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = alpha * 0.8;
        ctx.beginPath();
        ctx.arc(node.x, node.y, (node.radius * 0.4) * node.scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handlePointerMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      mouseRef.current.targetX = x;
      mouseRef.current.targetY = y;
    };

    const handlePointerLeave = () => {
      mouseRef.current.targetX = 0;
      mouseRef.current.targetY = 0;
    };

    if (interactive) {
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('mouseleave', handlePointerLeave);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (interactive) {
        window.removeEventListener('mousemove', handlePointerMove);
        window.removeEventListener('mouseleave', handlePointerLeave);
      }
    };
  }, [size, interactive]);

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <canvas
        ref={canvasRef}
        style={{ width: `${size}px`, height: `${size}px` }}
        className="pointer-events-none drop-shadow-[0_10px_25px_rgba(197,155,72,0.15)]"
      />
    </div>
  );
}
