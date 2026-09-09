import React, { useCallback, useRef, useState } from "react";
import { useSessionContext, EXPERIENCES, Experience } from "../context/SessionContext";

/**
 * Tela 02 - Escolha da experiência/estilo de IA.
 * Segue o mesmo design system das demais telas: fundo tecnológico com
 * glow radial + grid, partículas, cards glassmorphism com anel giratório
 * no hover/seleção e efeito de sucção (vórtice) na transição para a
 * próxima etapa.
 */
const ExperienceSelect: React.FC = () => {
  const { setExperience, setScreen } = useSessionContext();
  const [sucking, setSucking] = useState(false);
  const [suckingId, setSuckingId] = useState<string | null>(null);
  const suckPointRef = useRef({ x: 0, y: 0 });

  const handleSelect = useCallback(
    (exp: Experience, e: React.MouseEvent<HTMLButtonElement>) => {
      if (sucking) return;
      const rect = e.currentTarget.getBoundingClientRect();
      suckPointRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
      setSuckingId(exp.id);
      setSucking(true);
      setTimeout(() => {
        setExperience(exp);
        setScreen("people-select");
      }, 800);
    },
    [sucking, setExperience, setScreen]
  );

  const handleBack = useCallback(() => {
    if (sucking) return;
    setScreen("welcome");
  }, [sucking, setScreen]);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[#06030f] p-6 text-white">
      {/* Fundo tecnológico */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="exp-bg-glow" />
        <div className="exp-bg-grid" />
        <div className="absolute inset-0">
          {Array.from({ length: 22 }).map((_, i) => (
            <span
              key={i}
              className="exp-particle"
              style={{
                left: `${(i * 41) % 100}%`,
                top: `${(i * 29) % 100}%`,
                animationDelay: `${(i * 0.35) % 6}s`,
                animationDuration: `${5 + (i % 4)}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Botão voltar */}
      <button
        onClick={handleBack}
        aria-label="Voltar"
        className="absolute left-6 top-6 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 backdrop-blur-sm transition-all hover:border-vive-primary/50 hover:bg-white/10"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Conteúdo */}
      <div
        className={`relative z-10 flex w-full max-w-3xl flex-col items-center transition-all duration-700 ${
          sucking ? "scale-50 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.5em] text-white/50">
          Vive · Photo Experience
        </div>
        <h2 className="mb-2 text-center text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-cyan-200 md:text-5xl">
          ESCOLHA SUA EXPERIÊNCIA
        </h2>
        <p className="mb-10 text-center text-sm text-white/60">
          Selecione o estilo de IA que vai transformar sua foto
        </p>

        <div className="grid w-full grid-cols-3 gap-4">
          {EXPERIENCES.map((exp) => (
            <button
              key={exp.id}
              disabled={sucking}
              onClick={(e) => handleSelect(exp, e)}
              className={`exp-card group relative overflow-hidden rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md transition-all duration-300 ${
                suckingId === exp.id
                  ? "animate-exp-suck"
                  : "hover:scale-105 hover:border-purple-300/60 hover:shadow-[0_0_35px_rgba(168,85,247,0.35)]"
              }`}
            >
              <span className="exp-ring" />
              <div className="relative z-10 flex flex-col items-center gap-3 px-4 py-6">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br ${exp.gradient} shadow-lg`}
                >
                  <svg className="h-8 w-8 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-sm font-bold uppercase tracking-wide text-white/90">
                  {exp.name}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Vórtice de sucção */}
      {sucking && (
        <div
          className="pointer-events-none fixed z-20"
          style={{ left: suckPointRef.current.x, top: suckPointRef.current.y, transform: "translate(-50%, -50%)" }}
        >
          <div className="exp-vortex" />
        </div>
      )}

      <style>{`
        .exp-bg-glow {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at 30% 40%, rgba(139, 92, 246, 0.16), transparent 60%),
            radial-gradient(ellipse at 70% 60%, rgba(34, 211, 238, 0.1), transparent 50%),
            radial-gradient(ellipse at 50% 85%, rgba(236, 72, 153, 0.06), transparent 70%);
          filter: blur(60px);
          animation: expGlowPulse 8s ease-in-out infinite alternate;
        }
        @keyframes expGlowPulse {
          0% { opacity: 0.7; transform: scale(1); }
          100% { opacity: 1; transform: scale(1.08); }
        }
        .exp-bg-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 56px 56px;
          mask-image: radial-gradient(ellipse at center, black 35%, transparent 80%);
        }
        .exp-particle {
          position: absolute;
          width: 2px;
          height: 2px;
          border-radius: 50%;
          background: white;
          opacity: 0.4;
          animation: expParticleFloat 6s ease-in-out infinite;
          box-shadow: 0 0 6px 1px rgba(168,85,247,0.5);
        }
        @keyframes expParticleFloat {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.4; }
          50% { transform: translateY(-26px) translateX(12px); opacity: 0.1; }
        }

        .exp-card { cursor: pointer; will-change: transform; }
        .exp-ring {
          position: absolute;
          inset: -2px;
          border-radius: 1rem;
          background: conic-gradient(from 0deg, transparent 0%, rgba(168,85,247,0.6) 25%, rgba(34,211,238,0.6) 50%, transparent 75%);
          animation: expRingSpin 4s linear infinite;
          opacity: 0;
          transition: opacity 0.3s;
          z-index: 0;
          pointer-events: none;
          filter: blur(3px);
        }
        .exp-card:hover .exp-ring { opacity: 1; }
        @keyframes expRingSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .animate-exp-suck {
          animation: expButtonSuck 0.8s cubic-bezier(0.6, -0.28, 0.735, 0.045) forwards !important;
          pointer-events: none;
        }
        @keyframes expButtonSuck {
          0% { transform: scale(1) rotate(0deg); opacity: 1; filter: brightness(1.5); }
          50% { transform: scale(1.15) rotate(180deg); opacity: 0.5; filter: brightness(2); }
          100% { transform: scale(0) rotate(360deg); opacity: 0; }
        }

        .exp-vortex {
          width: 130px;
          height: 130px;
          border-radius: 50%;
          background: conic-gradient(from 0deg, rgba(168,85,247,0.9), rgba(34,211,238,0.9), rgba(236,72,153,0.9), rgba(168,85,247,0.9));
          filter: blur(12px);
          animation: expVortexSpin 0.6s linear infinite, expVortexScale 0.8s ease-out forwards;
          box-shadow: 0 0 90px 35px rgba(168,85,247,0.5);
        }
        @keyframes expVortexSpin {
          0% { transform: rotate(0deg) scale(0.1); }
          100% { transform: rotate(360deg) scale(1.6); }
        }
        @keyframes expVortexScale {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default ExperienceSelect;
