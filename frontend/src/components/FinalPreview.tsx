import React from "react";
import { useSessionContext } from "../context/SessionContext";

/**
 * Tela 09 - Prévia final: mostra a foto escolhida dentro da moldura
 * selecionada, estilo "polaroid" com a marca Vive AI, antes de seguir
 * para as opções de saída (imprimir / QR Code).
 */
const FinalPreview: React.FC = () => {
  const { results, chosenIndex, selectedFrame, setScreen } = useSessionContext();
  const previewUrl = chosenIndex !== null ? results[chosenIndex] : results[0];

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[#06030f] p-6 text-white">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="fp-bg-glow" />
      </div>

      <button
        onClick={() => setScreen("frame-select")}
        aria-label="Voltar"
        className="absolute left-6 top-6 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 backdrop-blur-sm transition-all hover:border-vive-primary/50 hover:bg-white/10"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="relative z-10 flex flex-col items-center">
        <h2 className="mb-8 text-center text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-cyan-200 md:text-4xl">
          CONFIRA SEU RESULTADO
        </h2>

        {/* Cartão estilo polaroid */}
        <div className="fp-polaroid rounded-2xl bg-white p-3 pb-6 shadow-2xl">
          <div className="relative aspect-[3/4] w-64 overflow-hidden rounded-lg bg-black/10 md:w-72">
            {previewUrl && <img src={previewUrl} alt="Resultado final" className="h-full w-full object-cover" />}
          </div>
          <p className="mt-3 text-center text-sm font-black tracking-tight text-[#0a0714]">
            Vive <span className="text-vive-primary">AI</span>
          </p>
          <p className="text-center text-[10px] uppercase tracking-[0.3em] text-black/40">Photobooth</p>
        </div>

        <p className="mt-4 text-xs uppercase tracking-[0.3em] text-white/40">
          Moldura: {selectedFrame.name}
        </p>

        <div className="mt-8 flex items-center gap-4">
          <button
            onClick={() => setScreen("camera")}
            className="rounded-full border border-white/20 bg-white/5 px-8 py-3 text-base font-bold uppercase tracking-widest text-white/80 backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:bg-white/10"
          >
            Refazer
          </button>

          <button
            onClick={() => setScreen("output-options")}
            className="group relative overflow-hidden rounded-full px-10 py-3 text-base font-bold uppercase tracking-widest text-white transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-vive-primary via-vive-secondary to-vive-primary bg-[length:300%_100%] animate-gradient-shift rounded-full" />
            <span className="relative z-10">CONTINUAR</span>
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg]" />
          </button>
        </div>
      </div>

      <style>{`
        .fp-bg-glow {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse at 30% 40%, rgba(139, 92, 246, 0.15), transparent 60%),
            radial-gradient(ellipse at 70% 60%, rgba(34, 211, 238, 0.1), transparent 50%);
          filter: blur(60px);
          animation: fpGlowPulse 8s ease-in-out infinite alternate;
        }
        @keyframes fpGlowPulse {
          0% { opacity: 0.7; transform: scale(1); }
          100% { opacity: 1; transform: scale(1.08); }
        }
        .fp-polaroid {
          animation: fpFloat 5s ease-in-out infinite;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(168,85,247,0.25);
        }
        @keyframes fpFloat {
          0%, 100% { transform: translateY(0) rotate(-1deg); }
          50% { transform: translateY(-8px) rotate(1deg); }
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          100% { background-position: 300% 50%; }
        }
        .animate-gradient-shift { animation: gradient-shift 3s linear infinite; }
      `}</style>
    </div>
  );
};

export default FinalPreview;
