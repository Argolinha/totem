import React, { useEffect, useState } from "react";
import { useSessionContext } from "../context/SessionContext";

const RESET_DELAY_MS = 8000;

/** Tela 13/14 - Agradecimento e retorno automático do fluxo para o próximo usuário. */
const ThankYou: React.FC = () => {
  const { resetFlow } = useSessionContext();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      setProgress(Math.min(100, ((Date.now() - start) / RESET_DELAY_MS) * 100));
    }, 100);
    const timeout = setTimeout(resetFlow, RESET_DELAY_MS);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [resetFlow]);

  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[#06030f] text-white"
      onClick={resetFlow}
    >
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="ty-bg-glow" />
      </div>

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        {/* Ícone de coração pulsante */}
        <svg className="mb-6 h-12 w-12 text-fuchsia-300 ty-heart" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21s-6.716-4.35-9.428-8.06C.86 10.24 1.2 6.9 3.6 5.02c2.1-1.64 4.98-1.2 6.66.86L12 7.8l1.74-1.92c1.68-2.06 4.56-2.5 6.66-.86 2.4 1.88 2.74 5.22 1.03 7.92C18.716 16.65 12 21 12 21z" />
        </svg>

        <h2 className="mb-3 text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-cyan-200 md:text-5xl">
          OBRIGADO POR VIVER<br />ESSA EXPERIÊNCIA!
        </h2>
        <p className="mb-1 text-lg text-white/70">Nos vemos em breve!</p>
        <p className="mt-6 text-xs uppercase tracking-[0.3em] text-white/40">
          Pronto para a próxima experiência
        </p>

        {/* Barra de retorno automático */}
        <div className="mt-6 h-1 w-56 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-vive-primary to-vive-secondary"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-3 text-[11px] text-white/30">Toque na tela para começar uma nova sessão</p>
      </div>

      <style>{`
        .ty-bg-glow {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse at 30% 40%, rgba(139, 92, 246, 0.22), transparent 60%),
            radial-gradient(ellipse at 70% 60%, rgba(34, 211, 238, 0.14), transparent 55%);
          filter: blur(70px);
          animation: tyGlowPulse 6s ease-in-out infinite alternate;
        }
        @keyframes tyGlowPulse {
          0% { opacity: 0.7; transform: scale(1); }
          100% { opacity: 1; transform: scale(1.1); }
        }
        .ty-heart {
          animation: tyHeartBeat 1.6s ease-in-out infinite;
          filter: drop-shadow(0 0 16px rgba(236,72,153,0.6));
        }
        @keyframes tyHeartBeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
};

export default ThankYou;
