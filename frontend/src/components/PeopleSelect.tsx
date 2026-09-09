import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSessionContext } from "../context/SessionContext";

/**
 * Tela 02 - Escolha entre foto individual ou em dupla.
 * Redesign premium: borboleta tecnológica 3D em SVG, partículas, 
 * botões glassmorphism e efeito de sucção portal.
 */
const PeopleSelect: React.FC = () => {
  const { setPeopleCount, setScreen } = useSessionContext();
  const [sucking, setSucking] = useState(false);
  const [suckingButton, setSuckingButton] = useState<1 | 2 | null>(null);
  const suckPointRef = useRef({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [reducedMotion, setReducedMotion] = useState(false);

  // Verifica preferência de redução de movimento
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Parallax sutil (apenas desktop)
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (reducedMotion) return;
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    setMousePos({ x, y });
  }, [reducedMotion]);

  const handleSelect = useCallback(
    (count: 1 | 2, e: React.MouseEvent<HTMLButtonElement>) => {
      if (sucking) return;

      const rect = e.currentTarget.getBoundingClientRect();
      suckPointRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };

      setSuckingButton(count);
      setSucking(true);

      // Após a animação de sucção, navega para a câmera
      setTimeout(() => {
        setPeopleCount(count);
        setScreen("camera");
      }, 900);
    },
    [sucking, setPeopleCount, setScreen]
  );

  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[#06030f] text-white"
      onMouseMove={handleMouseMove}
    >
      {/* Fundo tecnológico com gradientes e partículas */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="tech-bg-glow" />
        <div className="tech-bg-grid" />
        <div className="particle-field" style={{ transform: `translate(${(mousePos.x - 0.5) * -10}px, ${(mousePos.y - 0.5) * -10}px)` }}>
          {Array.from({ length: 25 }).map((_, i) => (
            <span
              key={i}
              className="particle"
              style={{
                left: `${(i * 37) % 100}%`,
                top: `${(i * 53) % 100}%`,
                animationDelay: `${(i * 0.4) % 6}s`,
                animationDuration: `${4 + (i % 4)}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Botão voltar */}
      <button
        onClick={() => !sucking && setScreen("experience-select")}
        aria-label="Voltar"
        className="absolute left-6 top-6 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 backdrop-blur-sm transition-all hover:border-purple-400/50 hover:bg-white/10"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Borboleta 3D tecnológica */}
      <div className="butterfly-container pointer-events-none absolute inset-0 z-0">
        <svg
          className="butterfly-svg"
          viewBox="0 0 400 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ opacity: reducedMotion ? 0.5 : 0.35 }}
        >
          {/* Corpo */}
          <ellipse cx="200" cy="150" rx="5" ry="35" fill="url(#bodyGrad)" opacity="0.9" />
          {/* Antenas */}
          <path d="M200 115 Q190 75 170 65" stroke="#22d3ee" strokeWidth="1.2" opacity="0.8" />
          <circle cx="170" cy="65" r="2.5" fill="#22d3ee" opacity="0.9" />
          <path d="M200 115 Q210 75 230 65" stroke="#22d3ee" strokeWidth="1.2" opacity="0.8" />
          <circle cx="230" cy="65" r="2.5" fill="#22d3ee" opacity="0.9" />

          {/* Asa superior esquerda */}
          <g className="wing wing-left-top">
            <path
              d="M195 130 C120 80 80 40 60 60 C40 80 60 130 100 160 C130 180 180 170 195 130Z"
              fill="url(#wingGrad1)"
              stroke="rgba(168,85,247,0.7)"
              strokeWidth="0.8"
              opacity="0.5"
            />
            <path d="M170 120 L140 90 L110 80" stroke="#a78bfa" strokeWidth="1.2" fill="none" opacity="0.7" />
            <circle cx="140" cy="90" r="2" fill="#a78bfa" opacity="0.9" />
            <circle cx="110" cy="80" r="1.5" fill="#a78bfa" opacity="0.7" />
            <path d="M150 140 L120 130 L90 140" stroke="#67e8f9" strokeWidth="1" fill="none" opacity="0.6" />
            <circle cx="120" cy="130" r="1.5" fill="#67e8f9" opacity="0.8" />
          </g>

          {/* Asa superior direita */}
          <g className="wing wing-right-top">
            <path
              d="M205 130 C280 80 320 40 340 60 C360 80 340 130 300 160 C270 180 220 170 205 130Z"
              fill="url(#wingGrad2)"
              stroke="rgba(168,85,247,0.7)"
              strokeWidth="0.8"
              opacity="0.5"
            />
            <path d="M230 120 L260 90 L290 80" stroke="#a78bfa" strokeWidth="1.2" fill="none" opacity="0.7" />
            <circle cx="260" cy="90" r="2" fill="#a78bfa" opacity="0.9" />
            <circle cx="290" cy="80" r="1.5" fill="#a78bfa" opacity="0.7" />
            <path d="M250 140 L280 130 L310 140" stroke="#67e8f9" strokeWidth="1" fill="none" opacity="0.6" />
            <circle cx="280" cy="130" r="1.5" fill="#67e8f9" opacity="0.8" />
          </g>

          {/* Asa inferior esquerda */}
          <g className="wing wing-left-bottom">
            <path
              d="M190 170 C130 200 100 240 90 230 C80 220 90 180 130 160 C150 150 180 160 190 170Z"
              fill="url(#wingGrad3)"
              stroke="rgba(236,72,153,0.6)"
              strokeWidth="0.8"
              opacity="0.4"
            />
            <path d="M170 180 L140 200 L110 210" stroke="#f472b6" strokeWidth="1" fill="none" opacity="0.6" />
            <circle cx="140" cy="200" r="1.5" fill="#f472b6" opacity="0.8" />
          </g>

          {/* Asa inferior direita */}
          <g className="wing wing-right-bottom">
            <path
              d="M210 170 C270 200 300 240 310 230 C320 220 310 180 270 160 C250 150 220 160 210 170Z"
              fill="url(#wingGrad4)"
              stroke="rgba(236,72,153,0.6)"
              strokeWidth="0.8"
              opacity="0.4"
            />
            <path d="M230 180 L260 200 L290 210" stroke="#f472b6" strokeWidth="1" fill="none" opacity="0.6" />
            <circle cx="260" cy="200" r="1.5" fill="#f472b6" opacity="0.8" />
          </g>

          {/* Definições de gradiente */}
          <defs>
            <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
            <radialGradient id="wingGrad1" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.05" />
            </radialGradient>
            <radialGradient id="wingGrad2" cx="70%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.05" />
            </radialGradient>
            <radialGradient id="wingGrad3" cx="30%" cy="70%" r="70%">
              <stop offset="0%" stopColor="#f472b6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.05" />
            </radialGradient>
            <radialGradient id="wingGrad4" cx="70%" cy="70%" r="70%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.05" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Conteúdo principal */}
      <div
        className={`relative z-10 flex flex-col items-center transition-all duration-700 ${
          sucking ? "scale-50 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.50em] text-white/50">
          Vive · Photo Experience
        </div>
        <h2 className="mb-12 text-5xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-cyan-200">
          QUANTAS PESSOAS?
        </h2>
        <div className="flex gap-8">
          {/* Botão 1 pessoa */}
          <button
            disabled={sucking}
            aria-label="Selecionar 1 pessoa"
            onClick={(e) => handleSelect(1, e)}
            className={`people-btn group relative overflow-hidden rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md transition-all duration-300 ${
              suckingButton === 1 ? "animate-suck" : "hover:scale-105 hover:border-purple-400/60 hover:shadow-[0_0_40px_rgba(168,85,247,0.4)]"
            }`}
          >
            <span className="btn-ring" />
            <span className="relative z-10 flex items-center gap-3 px-10 py-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person-fill" viewBox="0 0 16 16">
  <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
</svg>
              <span className="text-lg font-semibold">1 PESSOA</span>
            </span>
            <span className="btn-shine" />
          </button>

          {/* Botão 2 pessoas */}
          <button
            disabled={sucking}
            aria-label="Selecionar 2 pessoas"
            onClick={(e) => handleSelect(2, e)}
            className={`people-btn group relative overflow-hidden rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md transition-all duration-300 ${
              suckingButton === 2 ? "animate-suck" : "hover:scale-105 hover:border-cyan-400/60 hover:shadow-[0_0_40px_rgba(34,211,238,0.4)]"
            }`}
          >
            <span className="btn-ring" />
            <span className="relative z-10 flex items-center gap-3 px-10 py-6">
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-people-fill" viewBox="0 0 16 16">
  <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"/>
</svg>
              <span className="text-lg font-semibold">2 PESSOAS</span>
            </span>
            <span className="btn-shine" />
          </button>
        </div>
      </div>

      {/* Efeito de sucção */}
      {sucking && (
        <>
          <div
            className="pointer-events-none fixed inset-0 z-20"
            style={{
              background: `radial-gradient(circle at ${suckPointRef.current.x}px ${suckPointRef.current.y}px, transparent 0%, #06030f 70%)`,
              animation: "suck-overlay 0.8s ease-in forwards",
            }}
          />
          <div
            className="pointer-events-none fixed z-30"
            style={{
              left: suckPointRef.current.x,
              top: suckPointRef.current.y,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="vive-vortex" />
          </div>
        </>
      )}

      {/* Estilos globais da tela */}
      <style>{`
        /* Redução de movimento */
        @media (prefers-reduced-motion: reduce) {
          .butterfly-svg,
          .wing,
          .particle,
          .btn-ring,
          .btn-shine,
          .tech-bg-glow,
          .tech-bg-grid {
            animation: none !important;
            transition: none !important;
          }
          .butterfly-container {
            opacity: 0.3;
          }
        }

        /* Fundo tecnológico */
        .tech-bg-glow {
          position: absolute;
          inset: -20%;
          background:
            radial-gradient(ellipse at 30% 40%, rgba(139, 92, 246, 0.15), transparent 60%),
            radial-gradient(ellipse at 70% 60%, rgba(34, 211, 238, 0.1), transparent 50%),
            radial-gradient(ellipse at 50% 80%, rgba(236, 72, 153, 0.05), transparent 70%);
          filter: blur(60px);
          animation: techGlowPulse 8s ease-in-out infinite alternate;
        }
        @keyframes techGlowPulse {
          0% { opacity: 0.7; transform: scale(1); }
          100% { opacity: 1; transform: scale(1.1); }
        }

        .tech-bg-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
        }

        /* Partículas */
        .particle-field {
          position: absolute;
          inset: 0;
          transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .particle {
          position: absolute;
          width: 2px;
          height: 2px;
          border-radius: 50%;
          background: white;
          opacity: 0.4;
          animation: particleFloat 6s ease-in-out infinite;
          box-shadow: 0 0 6px 1px rgba(168,85,247,0.5);
        }
        @keyframes particleFloat {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.4; }
          50% { transform: translateY(-30px) translateX(15px); opacity: 0.1; }
        }

        /* Borboleta */
        .butterfly-container {
          position: absolute;
          top: 50%;
          left: 50%;
          width: min(600px, 90vw);
          height: auto;
          transform-origin: center;
          animation: butterflyPath 22s ease-in-out infinite;
        }
        .butterfly-svg {
          width: 100%;
          height: auto;
          transform-origin: 50% 50%;
          animation: butterflyRotate 12s ease-in-out infinite;
        }
        .wing {
          transform-origin: 200px 150px;
        }
        .wing-left-top,
        .wing-left-bottom {
          animation: wingFlapLeft 2.8s ease-in-out infinite;
        }
        .wing-right-top,
        .wing-right-bottom {
          animation: wingFlapRight 2.8s ease-in-out infinite;
        }

        @keyframes butterflyPath {
          0% { transform: translate(-50%, -50%) translateX(-70vw) translateY(-10vh) rotate(0deg) scale(0.8); opacity: 0; }
          10% { opacity: 0.35; }
          20% { transform: translate(-50%, -50%) translateX(-30vw) translateY(-5vh) rotate(8deg) scale(0.9); }
          40% { transform: translate(-50%, -50%) translateX(0vw) translateY(10vh) rotate(-5deg) scale(1); }
          60% { transform: translate(-50%, -50%) translateX(30vw) translateY(-8vh) rotate(6deg) scale(1.05); }
          80% { transform: translate(-50%, -50%) translateX(60vw) translateY(5vh) rotate(-8deg) scale(0.9); opacity: 0.3; }
          100% { transform: translate(-50%, -50%) translateX(80vw) translateY(-10vh) rotate(0deg) scale(0.7); opacity: 0; }
        }
        @keyframes butterflyRotate {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(2deg); }
          75% { transform: rotate(-2deg); }
        }
        @keyframes wingFlapLeft {
          0%, 100% { transform: rotateY(0deg); }
          50% { transform: rotateY(30deg); }
        }
        @keyframes wingFlapRight {
          0%, 100% { transform: rotateY(0deg); }
          50% { transform: rotateY(-30deg); }
        }

        /* Botões */
        .people-btn {
          position: relative;
          cursor: pointer;
          transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s;
          will-change: transform;
        }
        .people-btn:hover {
          transform: scale(1.05);
        }
        .btn-ring {
          position: absolute;
          inset: -2px;
          border-radius: 1rem;
          background: conic-gradient(
            from 0deg,
            transparent 0%,
            rgba(168,85,247,0.6) 25%,
            rgba(34,211,238,0.6) 50%,
            transparent 75%
          );
          animation: btnRingSpin 4s linear infinite;
          z-index: 0;
          pointer-events: none;
          filter: blur(3px);
          opacity: 0.6;
          transition: opacity 0.3s;
        }
        .people-btn:hover .btn-ring {
          opacity: 1;
        }
        @keyframes btnRingSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .btn-shine {
          position: absolute;
          top: 0;
          left: -60%;
          width: 50%;
          height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.8), transparent);
          transform: skewX(-20deg);
          animation: btnShineSweep 5s ease-in-out infinite;
          z-index: 1;
          pointer-events: none;
        }
        @keyframes btnShineSweep {
          0% { left: -60%; }
          30% { left: 130%; }
          100% { left: 130%; }
        }

        /* Vórtice de sucção */
        .vive-vortex {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          background: conic-gradient(
            from 0deg,
            rgba(168,85,247,0.9),
            rgba(34,211,238,0.9),
            rgba(236,72,153,0.9),
            rgba(168,85,247,0.9)
          );
          filter: blur(12px);
          animation: vortexSpin 0.6s linear infinite, vortexScale 0.9s ease-out forwards;
          box-shadow: 0 0 100px 40px rgba(168,85,247,0.5);
        }
        @keyframes vortexSpin {
          0% { transform: rotate(0deg) scale(0.1); }
          100% { transform: rotate(360deg) scale(1.8); }
        }
        @keyframes vortexScale {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }

        /* Animação do botão sugado */
        .animate-suck {
          animation: buttonSuck 0.8s cubic-bezier(0.6, -0.28, 0.735, 0.045) forwards !important;
          pointer-events: none;
        }
        @keyframes buttonSuck {
          0% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
            filter: brightness(1.5);
          }
          50% {
            transform: scale(1.2) rotate(180deg);
            opacity: 0.5;
            filter: brightness(2);
          }
          100% {
            transform: scale(0) rotate(360deg);
            opacity: 0;
          }
        }

        /* Overlay de sucção */
        @keyframes suck-overlay {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default PeopleSelect;