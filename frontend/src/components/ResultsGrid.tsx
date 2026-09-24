import React, { useState } from "react";
import { useSessionContext } from "../context/SessionContext";

/**
 * Tela de resultados:
 * exibe a foto gerada pela IA e permite
 * continuar para seleção de moldura ou refazer a captura.
 */
const ResultsGrid: React.FC = () => {
  const { results, chooseResult, setScreen } = useSessionContext();
  const [confirming, setConfirming] = useState(false);

  const resultUrl = results[0];

  const handleContinue = async () => {
    setConfirming(true);

    try {
      await chooseResult(0);

      /*
       * chooseResult() já direciona para:
       * "frame-select"
       *
       * Não precisamos chamar setScreen("qr") aqui.
       */
    } catch (error) {
      console.error("Erro ao confirmar escolha:", error);
      setConfirming(false);
    }
  };

  const handleRedo = () => {
    /*
     * O nome correto da tela no SessionContext é "camera".
     */
    setScreen("camera");
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#0a0714] p-6 text-white">
      {/* Fundo tecnológico */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.15),transparent_70%)]" />

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,rgba(34,211,238,0.06),transparent_60%)]" />

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(236,72,153,0.04),transparent_60%)]" />

        <div className="absolute inset-0 opacity-30">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-white/40"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `twinkle ${
                  6 + Math.random() * 10
                }s linear infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

        <div className="absolute inset-0 opacity-[0.05]">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:60px_60px]" />

          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:60px_60px]" />
        </div>
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center">
        {/* Título */}
        <div className="mb-6 text-center">
          <div className="mb-3 inline-block rounded-full border border-vive-primary/30 bg-white/5 px-6 py-2 backdrop-blur-sm">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-vive-primary/90">
              IA GENERATIVA
            </span>
          </div>

          <h2 className="bg-gradient-to-r from-white via-vive-primary to-vive-secondary bg-[length:300%_100%] bg-clip-text text-3xl font-black tracking-tight text-transparent animate-gradient-shift md:text-4xl">
            SUA FOTO ESTÁ PRONTA!
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-white/60">
            Confira o resultado abaixo
          </p>
        </div>

        {/* Resultado */}
        <div className="relative w-full max-w-md overflow-hidden rounded-2xl shadow-[0_0_40px_rgba(124,58,237,0.25)] ring-1 ring-white/10">
          <div className="relative aspect-square w-full">
            {resultUrl ? (
              <img
                src={resultUrl}
                alt="Resultado gerado"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-white/5 text-sm text-white/50">
                Nenhum resultado disponível
              </div>
            )}
          </div>
        </div>

        {/* Botões */}
        <div className="mt-8 flex w-full max-w-md gap-4">
          {/* Refazer */}
          <button
            type="button"
            disabled={confirming}
            onClick={handleRedo}
            className="group relative flex-1 overflow-hidden rounded-full border border-white/20 px-6 py-3 text-sm font-bold uppercase tracking-widest text-white/80 transition-all duration-300 hover:scale-105 hover:border-white/40 hover:text-white active:scale-95 disabled:pointer-events-none disabled:opacity-40"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <svg
                className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-180"
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

              REFAZER
            </span>
          </button>

          {/* Continuar */}
          <button
            type="button"
            disabled={confirming}
            onClick={handleContinue}
            className="group relative flex-1 overflow-hidden rounded-full px-6 py-3 text-sm font-bold uppercase tracking-widest text-white transition-all duration-300 hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
          >
            <span className="absolute inset-0 animate-gradient-shift rounded-full bg-gradient-to-r from-vive-primary via-vive-secondary to-vive-primary bg-[length:300%_100%]" />

            <span className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            <span className="absolute inset-0 animate-pulse-slow rounded-full bg-vive-primary/50 blur-2xl transition-all duration-700 group-hover:bg-vive-primary/70" />

            <span className="relative z-10 flex items-center justify-center gap-2">
              {confirming ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />

                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>

                  ENVIANDO...
                </>
              ) : (
                <>
                  CONTINUAR

                  <svg
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </>
              )}
            </span>

            <span className="absolute inset-0 -translate-x-full skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% {
            opacity: 0.1;
            transform: scale(0.8);
          }

          50% {
            opacity: 0.8;
            transform: scale(1.2);
          }
        }

        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }

          100% {
            background-position: 300% 50%;
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.5;
          }

          50% {
            transform: scale(1.2);
            opacity: 0.9;
          }
        }

        .animate-gradient-shift {
          animation: gradient-shift 3s linear infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ResultsGrid;