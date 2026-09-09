import React, { useEffect, useState } from "react";
import { useSessionContext } from "../context/SessionContext";

const PRINT_DURATION_MS = 4000;

/**
 * Tela 11 - Imprimindo sua foto. Mostra uma impressora estilizada e uma
 * barra de progresso enquanto a Fujifilm ASK 400 finaliza a impressão.
 * Ao concluir, segue para o QR Code (caso a opção "ambos" tenha sido
 * escolhida) ou direto para o agradecimento.
 */
const Printing: React.FC = () => {
  const { outputOption, setScreen } = useSessionContext();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - start) / PRINT_DURATION_MS) * 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setScreen(outputOption === "both" ? "qr" : "thank-you");
        }, 500);
      }
    }, 80);
    return () => clearInterval(interval);
  }, [outputOption, setScreen]);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[#0a0714] text-white">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.18),transparent_70%)]" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <h2 className="mb-8 text-center text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-cyan-200 md:text-4xl">
          IMPRIMINDO SUA FOTO...
        </h2>

        {/* Ícone de impressora */}
        <div className="print-icon-wrap relative mb-8 flex h-28 w-32 items-center justify-center">
          <svg className="h-full w-full text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.3}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 9V4a1 1 0 011-1h10a1 1 0 011 1v5M6 18H4a1 1 0 01-1-1v-6a1 1 0 011-1h16a1 1 0 011 1v6a1 1 0 01-1 1h-2m-10 0v3a1 1 0 001 1h6a1 1 0 001-1v-3m-8 0h8"
            />
          </svg>
          <div className="print-page" style={{ height: `${Math.min(progress, 100) * 0.4}px` }} />
        </div>

        {/* Barra de progresso */}
        <div className="h-2 w-72 overflow-hidden rounded-full bg-white/10 md:w-96">
          <div
            className="h-full rounded-full bg-gradient-to-r from-vive-primary to-vive-secondary transition-[width] duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="mt-4 text-sm text-white/50">Aguarde alguns segundos.</p>
      </div>

      <style>{`
        .print-page {
          position: absolute;
          bottom: 18px;
          width: 60%;
          background: linear-gradient(to bottom, #ffffff, #e9d5ff);
          border-radius: 2px;
          box-shadow: 0 4px 20px rgba(168,85,247,0.4);
          transition: height 0.1s linear;
        }
      `}</style>
    </div>
  );
};

export default Printing;
