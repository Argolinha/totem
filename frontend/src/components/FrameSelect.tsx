import React from "react";
import { useSessionContext, FRAMES } from "../context/SessionContext";
import FrameFrame from "./frameStyles";

/**
 * Tela 08 - Escolha da moldura do evento que será aplicada à foto final.
 * Mesmo design system: fundo tecnológico, cards glassmorphism com anel
 * giratório, preview da foto escolhida dentro de cada moldura.
 */
const FrameSelect: React.FC = () => {
  const { results, chosenIndex, selectedFrame, setSelectedFrame, setScreen } = useSessionContext();

  const previewUrl = chosenIndex !== null ? results[chosenIndex] : results[0];

  const handleContinue = () => {
    setScreen("final-preview");
  };

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[#06030f] p-6 text-white">
      {/* Fundo tecnológico */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="frame-bg-glow" />
        <div className="frame-bg-grid" />
      </div>

      {/* Botão voltar */}
      <button
        onClick={() => setScreen("results")}
        aria-label="Voltar"
        className="absolute left-6 top-6 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 backdrop-blur-sm transition-all hover:border-vive-primary/50 hover:bg-white/10"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center">
        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.5em] text-white/50">
          Vive · Photo Experience
        </div>
        <h2 className="mb-8 text-center text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-cyan-200 md:text-4xl">
          ESCOLHA SUA MOLDURA
        </h2>

        <div className="flex max-h-[58vh] flex-wrap items-start justify-center gap-6 overflow-y-auto px-1 py-1">
          {FRAMES.map((frame) => (
            <button
              key={frame.id}
              onClick={() => setSelectedFrame(frame)}
              className={`frame-card group relative overflow-hidden rounded-2xl transition-all duration-300 ${
                selectedFrame.id === frame.id ? "scale-105 ring-2 ring-cyan-300/70" : "hover:scale-105"
              }`}
            >
              <FrameFrame frameId={frame.id} thickness={7} className="w-32 md:w-36">
                <div className="relative aspect-[3/4] w-full bg-black/40">
                  {previewUrl && (
                    <img src={previewUrl} alt={frame.name} className="h-full w-full object-cover" />
                  )}
                  {selectedFrame.id === frame.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="rounded-full bg-cyan-400/20 p-1.5 backdrop-blur-sm">
                        <svg className="h-5 w-5 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </FrameFrame>
              <p className="mt-2 text-center text-xs font-semibold uppercase tracking-wide text-white/80">
                {frame.name}
              </p>
              <p className="text-center text-[10px] text-white/40">{frame.description}</p>
            </button>
          ))}
        </div>

        <button
          onClick={handleContinue}
          className="group relative mt-10 overflow-hidden rounded-full px-10 py-3 text-base font-bold uppercase tracking-widest text-white transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-vive-primary via-vive-secondary to-vive-primary bg-[length:300%_100%] animate-gradient-shift rounded-full" />
          <span className="relative z-10">CONTINUAR</span>
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg]" />
        </button>
      </div>

      <style>{`
        .frame-bg-glow {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse at 30% 40%, rgba(139, 92, 246, 0.15), transparent 60%),
            radial-gradient(ellipse at 70% 60%, rgba(34, 211, 238, 0.1), transparent 50%);
          filter: blur(60px);
          animation: frameGlowPulse 8s ease-in-out infinite alternate;
        }
        @keyframes frameGlowPulse {
          0% { opacity: 0.7; transform: scale(1); }
          100% { opacity: 1; transform: scale(1.08); }
        }
        .frame-bg-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 56px 56px;
          mask-image: radial-gradient(ellipse at center, black 35%, transparent 80%);
        }
        .frame-card { cursor: pointer; }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          100% { background-position: 300% 50%; }
        }
        .animate-gradient-shift { animation: gradient-shift 3s linear infinite; }
      `}</style>
    </div>
  );
};

export default FrameSelect;