import React, { useState } from "react";
import { useSessionContext, OutputOption } from "../context/SessionContext";

/**
 * Tela 10 - O que o usuário deseja fazer com a foto: imprimir,
 * receber digitalmente via QR Code, ou os dois. Um checkbox permite
 * combinar impressão + QR Code em uma única confirmação.
 */
const OutputOptions: React.FC = () => {
  const { setOutputOption, setScreen } = useSessionContext();
  const [printSelected, setPrintSelected] = useState(false);
  const [qrSelected, setQrSelected] = useState(false);
  const [both, setBoth] = useState(false);

  const toggleBoth = () => {
    const next = !both;
    setBoth(next);
    if (next) {
      setPrintSelected(true);
      setQrSelected(true);
    }
  };

  const handleConfirm = (option?: OutputOption) => {
    let finalOption: OutputOption;
    if (option) {
      finalOption = option;
    } else if (printSelected && qrSelected) {
      finalOption = "both";
    } else if (printSelected) {
      finalOption = "print";
    } else if (qrSelected) {
      finalOption = "qr";
    } else {
      return;
    }
    setOutputOption(finalOption);
    setScreen(finalOption === "qr" ? "qr" : "printing");
  };

  const canConfirm = printSelected || qrSelected;

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[#06030f] p-6 text-white">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="out-bg-glow" />
        <div className="out-bg-grid" />
      </div>

      <button
        onClick={() => setScreen("final-preview")}
        aria-label="Voltar"
        className="absolute left-6 top-6 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 backdrop-blur-sm transition-all hover:border-vive-primary/50 hover:bg-white/10"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center">
        <h2 className="mb-10 text-center text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-cyan-200 md:text-4xl">
          O QUE VOCÊ DESEJA?
        </h2>

        <div className="flex flex-col gap-4 sm:flex-row">
          <button
            onClick={() => {
              setPrintSelected((v) => !v);
              setBoth(false);
            }}
            className={`out-card group relative flex w-56 flex-col items-center gap-3 overflow-hidden rounded-2xl border px-6 py-8 backdrop-blur-md transition-all duration-300 ${
              printSelected
                ? "border-purple-300/70 bg-white/10 shadow-[0_0_35px_rgba(168,85,247,0.4)]"
                : "border-white/15 bg-white/5 hover:border-purple-300/50 hover:scale-105"
            }`}
          >
            <svg className="h-10 w-10 text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 9V4a1 1 0 011-1h10a1 1 0 011 1v5M6 18H4a1 1 0 01-1-1v-6a1 1 0 011-1h16a1 1 0 011 1v6a1 1 0 01-1 1h-2m-10 0v3a1 1 0 001 1h6a1 1 0 001-1v-3m-8 0h8"
              />
            </svg>
            <span className="text-sm font-bold uppercase tracking-wide">Imprimir sua foto</span>
          </button>

          <button
            onClick={() => {
              setQrSelected((v) => !v);
              setBoth(false);
            }}
            className={`out-card group relative flex w-56 flex-col items-center gap-3 overflow-hidden rounded-2xl border px-6 py-8 backdrop-blur-md transition-all duration-300 ${
              qrSelected
                ? "border-cyan-300/70 bg-white/10 shadow-[0_0_35px_rgba(34,211,238,0.4)]"
                : "border-white/15 bg-white/5 hover:border-cyan-300/50 hover:scale-105"
            }`}
          >
            <svg className="h-10 w-10 text-cyan-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4h5v5H4V4zm11 0h5v5h-5V4zM4 15h5v5H4v-5zm7-11h1v3h-1V4zm0 5h1v1h-1V9zm4 0h1v1h-1V9zm4-5h1v3h-1V4zM11 13h1v1h-1v-1zm0 3h1v3h-1v-3zm4-3h1v1h-1v-1zm4 0h1v6h-1v-6zm-4 3h1v3h-1v-3z"
              />
            </svg>
            <span className="text-sm font-bold uppercase tracking-wide">Receber no seu celular</span>
          </button>
        </div>

        <label className="mt-8 flex cursor-pointer items-center gap-3 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm text-white/80 backdrop-blur-sm transition-all hover:border-white/30">
          <input
            type="checkbox"
            checked={both}
            onChange={toggleBoth}
            className="h-4 w-4 accent-vive-primary"
          />
          Imprimir + QR Code (faça os dois)
        </label>

        <button
          disabled={!canConfirm}
          onClick={() => handleConfirm()}
          className="group relative mt-10 overflow-hidden rounded-full px-10 py-3 text-base font-bold uppercase tracking-widest text-white transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none hover:scale-105 active:scale-95"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-vive-primary via-vive-secondary to-vive-primary bg-[length:300%_100%] animate-gradient-shift rounded-full" />
          <span className="relative z-10">CONTINUAR</span>
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg]" />
        </button>
      </div>

      <style>{`
        .out-bg-glow {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse at 30% 40%, rgba(139, 92, 246, 0.15), transparent 60%),
            radial-gradient(ellipse at 70% 60%, rgba(34, 211, 238, 0.1), transparent 50%);
          filter: blur(60px);
          animation: outGlowPulse 8s ease-in-out infinite alternate;
        }
        @keyframes outGlowPulse {
          0% { opacity: 0.7; transform: scale(1); }
          100% { opacity: 1; transform: scale(1.08); }
        }
        .out-bg-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 56px 56px;
          mask-image: radial-gradient(ellipse at center, black 35%, transparent 80%);
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

export default OutputOptions;
