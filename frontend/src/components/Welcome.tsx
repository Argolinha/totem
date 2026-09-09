import React, { useEffect, useRef, useState, useCallback } from "react";
import { useSessionContext } from "../context/SessionContext";

/**
 * Tela 01 - Apresentação da marca Vive AI.
 * Experiência premium: campo de partículas reativo, texto com gradiente
 * animado, glow pulsante, tilt 3D no botão principal e efeito de "sugar" a tela
 * ao clicar (buraco negro / vórtice).
 */
const Welcome: React.FC = () => {
  const { setScreen } = useSessionContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [ready, setReady] = useState(false);
  const [isSucking, setIsSucking] = useState(false);
  const suckPointRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let animationId: number;

    const PARTICLE_COUNT = 70;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2 + 0.6,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.6 + 0.2,
    }));

    const mouse = { x: width / 2, y: height / 2 };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    const handleMove = (e: MouseEvent | TouchEvent) => {
      const point = "touches" in e ? e.touches[0] : (e as MouseEvent);
      if (!point) return;
      mouse.x = point.clientX;
      mouse.y = point.clientY;

      const nx = (point.clientX / width) * 2 - 1;
      const ny = (point.clientY / height) * 2 - 1;
      setTilt({ x: ny * 8, y: nx * -8 });
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("touchmove", handleMove);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Determina o ponto de sucção quando isSucking é true
      const suckPoint = isSucking
        ? suckPointRef.current
        : { x: mouse.x, y: mouse.y };

      particles.forEach((p) => {
        if (isSucking) {
          // Força de atração muito forte para o ponto de sucção
          const dx = suckPoint.x - p.x;
          const dy = suckPoint.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = Math.min(5000 / (dist * dist), 0.5);
          p.vx += dx * force * 0.01;
          p.vy += dy * force * 0.01;
        } else {
          // Força suave de repulsão/atração em relação ao mouse (original)
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = Math.min(1200 / (dist * dist), 0.03);
          p.vx += dx * force * 0.002;
          p.vy += dy * force * 0.002;
          p.vx *= 0.98;
          p.vy *= 0.98;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Durante a sucção, partículas que chegam perto do ponto "desaparecem"
        if (isSucking) {
          const dx = suckPoint.x - p.x;
          const dy = suckPoint.y - p.y;
          if (Math.hypot(dx, dy) < 5) {
            p.alpha *= 0.9; // some gradualmente
            if (p.alpha < 0.01) {
              p.x = Math.random() * width;
              p.y = Math.random() * height;
              p.alpha = 0.2;
              p.vx = 0;
              p.vy = 0;
            }
          }
        }

        // Limites da tela (com wrap, exceto durante sucção para não atrapalhar)
        if (!isSucking) {
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;
        } else {
          // Durante sucção, as partículas podem sair da tela livremente
          // (serão reposicionadas se estiverem muito longe)
          if (Math.abs(p.x - suckPoint.x) > width * 2 || Math.abs(p.y - suckPoint.y) > height * 2) {
            p.x = Math.random() * width;
            p.y = Math.random() * height;
            p.vx = 0;
            p.vy = 0;
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
        ctx.fill();
      });

      // Linhas entre partículas (apenas se não estiver sugando, para não sobrecarregar)
      if (!isSucking) {
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const a = particles[i];
            const b = particles[j];
            const d = Math.hypot(a.x - b.x, a.y - b.y);
            if (d < 120) {
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.strokeStyle = `rgba(180,140,255,${0.12 * (1 - d / 120)})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleMove);
    };
  }, [isSucking]);

  const handleButtonClick = useCallback(() => {
    if (isSucking) return; // evita múltiplos cliques
    const button = buttonRef.current;
    if (button) {
      const rect = button.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      suckPointRef.current = { x: centerX, y: centerY };
    } else {
      // fallback para centro da tela
      suckPointRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    }
    setIsSucking(true);
    // Após a animação de sucção, navega para a escolha da experiência
    setTimeout(() => {
      setScreen("experience-select");
    }, 900);
  }, [isSucking, setScreen]);

  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[#0a0714] text-white"
      onClick={handleButtonClick}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="vive-blob vive-blob-1" />
        <div className="vive-blob vive-blob-2" />
        <div className="vive-blob vive-blob-3" />
      </div>

      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" />

      <div className="vive-grid pointer-events-none absolute inset-0 opacity-[0.15]" />

      {/* Overlay radial que se contrai durante a sucção */}
      <div
        className="pointer-events-none absolute inset-0 transition-all duration-700"
        style={{
          background: isSucking
            ? `radial-gradient(circle at ${suckPointRef.current.x}px ${suckPointRef.current.y}px, transparent 0%, #0a0714 60%)`
            : "radial-gradient(ellipse at center, transparent 35%, #0a0714 100%)",
          opacity: isSucking ? 1 : 0.8,
        }}
      />

      <div
        className={`relative z-10 flex flex-col items-center transition-all duration-1000 ease-out ${
          ready ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
        } ${isSucking ? "scale-50 opacity-0 pointer-events-none" : ""}`}
        style={{
          transition: isSucking
            ? "transform 0.7s cubic-bezier(0.6, -0.28, 0.735, 0.045), opacity 0.7s ease-in"
            : "transform 1s ease-out, opacity 1s ease-out",
        }}
      >
        <div className="mb-3 flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-white/70 backdrop-blur-sm">
          <span className="vive-dot" />
          Experiência com Inteligência Artificial
        </div>

        <h1 className="vive-title mb-4 select-none text-7xl font-black tracking-tight md:text-8xl">
          VIVE AI
        </h1>

        <p
          className={`mb-14 text-xl font-light text-white/80 md:text-2xl transition-all delay-300 duration-1000 ${
            ready ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          Transforme sua foto. <span className="text-white">Viva a experiência.</span>
        </p>

        <button
          ref={buttonRef}
          onMouseLeave={() => !isSucking && setTilt({ x: 0, y: 0 })}
          style={{
            transform: isSucking
              ? `perspective(600px) rotateX(0deg) rotateY(0deg) scale(0.5)`
              : `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: isSucking
              ? "transform 0.7s cubic-bezier(0.6, -0.28, 0.735, 0.045)"
              : "transform 0.3s ease-out",
          }}
          className={`vive-cta group relative overflow-hidden rounded-2xl px-14 py-7 text-2xl font-bold text-[#0a0714] shadow-[0_0_60px_rgba(168,85,247,0.45)] transition-all duration-700 will-change-transform ${
            ready ? "scale-100 opacity-100" : "scale-90 opacity-0"
          } ${isSucking ? "opacity-0 pointer-events-none" : ""}`}
        >
          {/* Anel giratório ao redor do botão */}
          <span className="vive-cta-ring" />
          {/* Conteúdo do botão */}
          <span className="relative z-10 flex items-center justify-center gap-3">
            <svg
              className={`w-6 h-6 ${isSucking ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            TOQUE PARA COMEÇAR
          </span>
          <span className="vive-shine" />
        </button>
      </div>

      {/* Vórtice visual durante a sucção */}
      {isSucking && (
        <div
          className="pointer-events-none fixed z-20"
          style={{
            left: suckPointRef.current.x,
            top: suckPointRef.current.y,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="vive-vortex" />
        </div>
      )}

      <style>{`
        .vive-blob {
          position: absolute;
          border-radius: 9999px;
          filter: blur(90px);
          opacity: 0.55;
          mix-blend-mode: screen;
        }
        .vive-blob-1 {
          width: 40vw; height: 40vw;
          top: -10%; left: -10%;
          background: radial-gradient(circle at 30% 30%, #7C3AED, transparent 70%);
          animation: vive-float-1 16s ease-in-out infinite;
        }
        .vive-blob-2 {
          width: 45vw; height: 45vw;
          bottom: -15%; right: -10%;
          background: radial-gradient(circle at 70% 70%, #06B6D4, transparent 70%);
          animation: vive-float-2 20s ease-in-out infinite;
        }
        .vive-blob-3 {
          width: 30vw; height: 30vw;
          top: 40%; left: 50%;
          background: radial-gradient(circle, #EC4899, transparent 70%);
          animation: vive-float-3 14s ease-in-out infinite;
        }
        @keyframes vive-float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(6vw, 8vh) scale(1.15); }
        }
        @keyframes vive-float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-7vw, -6vh) scale(1.1); }
        }
        @keyframes vive-float-3 {
          0%, 100% { transform: translate(-50%, -30%) scale(1); }
          50% { transform: translate(-45%, -35%) scale(1.25); }
        }

        .vive-grid {
          background-image:
            linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse at center, black 40%, transparent 75%);
        }

        .vive-dot {
          width: 6px; height: 6px; border-radius: 9999px;
          background: #22d3ee;
          box-shadow: 0 0 8px 2px rgba(34,211,238,0.8);
          animation: vive-pulse 1.6s ease-in-out infinite;
        }
        @keyframes vive-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }

        .vive-title {
          background: linear-gradient(90deg, #ffffff, #c4b5fd, #67e8f9, #ffffff);
          background-size: 300% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: vive-gradient-shift 6s linear infinite;
          filter: drop-shadow(0 0 30px rgba(168,85,247,0.35));
        }
        @keyframes vive-gradient-shift {
          0% { background-position: 0% center; }
          100% { background-position: 300% center; }
        }

        .vive-cta {
          background: linear-gradient(135deg, #ffffff 0%, #e9d5ff 50%, #a5f3fc 100%);
          animation: vive-cta-pulse 2.4s ease-in-out infinite;
        }
        .vive-cta:active { transform: scale(0.96) !important; }
        @keyframes vive-cta-pulse {
          0%, 100% { box-shadow: 0 0 40px rgba(168,85,247,0.35), 0 0 0 0 rgba(168,85,247,0.4); }
          50% { box-shadow: 0 0 70px rgba(168,85,247,0.6), 0 0 0 14px rgba(168,85,247,0); }
        }

        .vive-shine {
          position: absolute;
          top: 0; left: -60%;
          width: 50%; height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.75), transparent);
          transform: skewX(-20deg);
          animation: vive-shine-sweep 3.2s ease-in-out infinite;
        }
        @keyframes vive-shine-sweep {
          0% { left: -60%; }
          40% { left: 130%; }
          100% { left: 130%; }
        }

        /* Novo: anel giratório ao redor do botão */
        .vive-cta-ring {
          position: absolute;
          inset: -4px;
          border-radius: 1.2rem;
          background: conic-gradient(
            from 0deg,
            transparent 0%,
            rgba(168,85,247,0.8) 25%,
            rgba(34,211,238,0.8) 50%,
            transparent 75%
          );
          animation: vive-ring-spin 3s linear infinite;
          z-index: 0;
          pointer-events: none;
          filter: blur(2px);
        }
        @keyframes vive-ring-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Vórtice central durante sucção */
        .vive-vortex {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: conic-gradient(
            from 0deg,
            rgba(168,85,247,0.9),
            rgba(34,211,238,0.9),
            rgba(236,72,153,0.9),
            rgba(168,85,247,0.9)
          );
          filter: blur(10px);
          animation: vive-vortex-spin 0.5s linear infinite, vive-vortex-scale 0.9s ease-out forwards;
          box-shadow: 0 0 80px 30px rgba(168,85,247,0.6);
        }
        @keyframes vive-vortex-spin {
          0% { transform: rotate(0deg) scale(0.1); }
          100% { transform: rotate(360deg) scale(1.5); }
        }
        @keyframes vive-vortex-scale {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
    
  );
};

export default Welcome;