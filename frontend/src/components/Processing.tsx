import React from "react";
import { useSessionContext } from "../context/SessionContext";

/**
 * Tela 06 - Exibida enquanto o backend/Celery gera as variações de IA.
 * Segue o design premium: fundo tecnológico, anel giratório com glow
 * conic-gradient e ícone de sparkle central, no mesmo estilo das demais
 * telas do fluxo.
 */
const Processing: React.FC = () => {
  const { experience } = useSessionContext();

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[#0a0714] text-white">
      {/* Fundo tecnológico */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.18),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,rgba(34,211,238,0.08),transparent_60%)]" />
        <div className="proc-grid absolute inset-0 opacity-20" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Anel giratório com glow */}
        <div className="proc-ring-wrap relative mb-10 flex h-48 w-48 items-center justify-center">
          <div className="proc-ring" />
          <div className="proc-ring proc-ring-reverse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="h-14 w-14 text-white proc-sparkle" fill="none" viewBox="0 0 24 24">
              <path
                d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2z"
                fill="url(#procSparkleGrad)"
              />
              <defs>
                <linearGradient id="procSparkleGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#c4b5fd" />
                  <stop offset="100%" stopColor="#67e8f9" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        <h2 className="mb-2 text-center text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-cyan-200 md:text-4xl">
          CRIANDO SUA EXPERIÊNCIA{experience ? ` ${experience.name.toUpperCase()}` : ""}...
        </h2>
        <p className="mt-2 text-center text-sm text-white/60">
          Isso pode levar alguns segundos.
        </p>
      </div>

      <style>{`
        .proc-grid {
          background-image:
            linear-gradient(rgba(168,85,247,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168,85,247,0.08) 1px, transparent 1px);
          background-size: 56px 56px;
          mask-image: radial-gradient(ellipse at center, black 30%, transparent 70%);
        }
        .proc-ring {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background: conic-gradient(from 0deg, transparent 0%, #a855f7 45%, #22d3ee 55%, transparent 100%);
          -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 6px), black calc(100% - 6px));
          mask: radial-gradient(farthest-side, transparent calc(100% - 6px), black calc(100% - 6px));
          animation: procSpin 2.2s linear infinite;
          filter: drop-shadow(0 0 18px rgba(168,85,247,0.55));
        }
        .proc-ring-reverse {
          inset: 16px;
          animation: procSpinReverse 3s linear infinite;
          opacity: 0.7;
        }
        @keyframes procSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes procSpinReverse { 0% { transform: rotate(360deg); } 100% { transform: rotate(0deg); } }
        .proc-sparkle {
          animation: procSparklePulse 1.6s ease-in-out infinite;
          filter: drop-shadow(0 0 14px rgba(196,181,253,0.8));
        }
        @keyframes procSparklePulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default Processing;
