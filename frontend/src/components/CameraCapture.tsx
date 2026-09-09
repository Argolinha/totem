import React, { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { useSessionContext } from "../context/SessionContext";

const videoConstraints = {
  width: 1080,
  height: 1080,
  facingMode: "user",
};

const CameraCapture: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const { peopleCount, startSession, submitPhoto, pollUntilReady, setScreen } =
    useSessionContext();

  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const dataUrlToBlob = (dataUrl: string): Blob => {
    const [header, base64] = dataUrl.split(",");
    const mime = header.match(/:(.*?);/)![1];
    const binary = atob(base64);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
    return new Blob([array], { type: mime });
  };

  const capture = useCallback(async () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    setIsCapturing(true);
    try {
      const blob = dataUrlToBlob(imageSrc);
      const sessionId = await startSession(peopleCount);
      await submitPhoto(sessionId, blob);
      await pollUntilReady(sessionId);
    } catch (err) {
      console.error("Erro ao capturar/enviar foto:", err);
      setScreen("error");
    }
  }, [peopleCount, startSession, submitPhoto, pollUntilReady, setScreen]);

  const startCountdown = () => {
    let counter = 3;
    setCountdown(counter);
    const timer = setInterval(() => {
      counter -= 1;
      if (counter === 0) {
        clearInterval(timer);
        setCountdown(null);
        capture();
      } else {
        setCountdown(counter);
      }
    }, 1000);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-[#0a0714] text-white overflow-hidden p-4">
      {/* ===== FUNDO TECNOLÓGICO DINÂMICO ===== */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* Gradientes de base */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.20),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,rgba(34,211,238,0.10),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(236,72,153,0.06),transparent_60%)]" />

        {/* Grid tecnológico animado */}
        <div className="absolute inset-0 tech-grid opacity-20" />

        {/* Linhas de circuito */}
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 1000 800" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 400 L200 400 L250 350 L300 350 L350 400 L500 400" stroke="#a78bfa" strokeWidth="1.5" className="animate-circuit-line" />
          <path d="M1000 200 L800 200 L750 250 L700 250 L650 200 L500 200" stroke="#67e8f9" strokeWidth="1.5" className="animate-circuit-line-delay" />
          <path d="M200 0 L200 150 L250 200 L250 300" stroke="#c084fc" strokeWidth="1.5" className="animate-circuit-line-delay-2" />
          <path d="M800 800 L800 650 L750 600 L750 500" stroke="#f472b6" strokeWidth="1.5" className="animate-circuit-line-delay-3" />
          <circle cx="250" cy="350" r="4" fill="#a78bfa" opacity="0.8">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="750" cy="250" r="4" fill="#67e8f9" opacity="0.8">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="250" cy="200" r="3" fill="#c084fc" opacity="0.8">
            <animate attributeName="opacity" values="0.2;1;0.2" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="750" cy="600" r="3" fill="#f472b6" opacity="0.8">
            <animate attributeName="opacity" values="0.2;1;0.2" dur="3.5s" repeatCount="indefinite" />
          </circle>
        </svg>

        {/* Partículas flutuantes tecnológicas */}
        <div className="absolute inset-0">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="particle-tech"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${2 + Math.random() * 4}px`,
                height: `${2 + Math.random() * 4}px`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${12 + Math.random() * 18}s`,
                background: `rgba(${[168,85,247,103,232,249,236,72,153][i % 3]}, ${0.3 + Math.random() * 0.4})`,
                boxShadow: `0 0 ${6 + Math.random() * 12}px rgba(168,85,247,0.3)`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Botão voltar */}
      <button
        onClick={() => countdown === null && !isCapturing && setScreen("people-select")}
        aria-label="Voltar"
        className="absolute left-6 top-6 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 backdrop-blur-sm transition-all hover:border-vive-primary/50 hover:bg-white/10"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* ===== CONTEÚDO PRINCIPAL ===== */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-3xl">
        {/* 🟣 MENSAGEM DE POSICIONAMENTO COM ANIMAÇÃO TECNOLÓGICA */}
        <div className="text-center mb-5">
          <div className="inline-block rounded-full border border-vive-primary/30 bg-white/5 px-6 py-2 backdrop-blur-sm mb-3 tech-badge">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-vive-primary/90">
              {peopleCount === 1 ? "RETRATO INDIVIDUAL" : "FOTO EM DUPLA"}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight tech-title">
            {peopleCount === 1 ? (
              <>
                <span className="inline-block animate-text-float">Posicione-se</span>
                <span className="inline-block animate-text-float-delay ml-2 font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-vive-primary to-vive-secondary">
                  no centro
                </span>
              </>
            ) : (
              <>
                <span className="inline-block animate-text-float">Posicionem-se</span>
                <span className="inline-block animate-text-float-delay ml-2 font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-vive-primary to-vive-secondary">
                  lado a lado
                </span>
              </>
            )}
          </h2>
          <p className="mt-2 text-sm text-white/60 max-w-md mx-auto tech-subtitle">
            {peopleCount === 1
              ? "Mantenha o rosto bem iluminado e olhe para a câmera"
              : "Certifiquem-se de que todos estão dentro do enquadramento"}
          </p>
        </div>

        {/* 📷 WEBCAM COM MOLDURA E CONTAGEM */}
        <div className="relative aspect-square w-full max-w-[420px] rounded-2xl p-1 bg-gradient-to-br from-vive-primary/50 to-vive-secondary/30 shadow-2xl shadow-vive-primary/30 tech-frame">
          <div className="relative h-full w-full overflow-hidden rounded-xl bg-black/80">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              mirrored
              className="h-full w-full object-cover"
            />

            {/* Guias de enquadramento com estilo tecnológico */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-60">
              <div className="relative h-3/4 w-3/4">
                <div className="absolute left-0 top-0 h-10 w-10 border-l-2 border-t-2 border-vive-primary/70 tech-corner" />
                <div className="absolute right-0 top-0 h-10 w-10 border-r-2 border-t-2 border-vive-primary/70 tech-corner" />
                <div className="absolute bottom-0 left-0 h-10 w-10 border-b-2 border-l-2 border-vive-primary/70 tech-corner" />
                <div className="absolute bottom-0 right-0 h-10 w-10 border-b-2 border-r-2 border-vive-primary/70 tech-corner" />
              </div>
            </div>

            {/* 🔢 CONTAGEM REGRESSIVA */}
            {countdown !== null && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <span className="text-[10rem] md:text-[12rem] font-black text-white drop-shadow-[0_0_60px_rgba(168,85,247,0.9)] animate-countdown-pulse">
                  {countdown}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 🎯 BOTÃO TECNOLÓGICO PREMIUM */}
        <button
          disabled={countdown !== null || isCapturing}
          onClick={startCountdown}
          className="group relative mt-3 overflow-hidden rounded-full px-10 py-3.5 text-base font-bold uppercase tracking-widest text-white transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none hover:scale-105 active:scale-95 tech-button"
        >
          {/* Gradiente tecnológico com borda animada */}
          <span className="absolute inset-0 bg-gradient-to-r from-vive-primary via-vive-secondary to-vive-primary bg-[length:300%_100%] animate-gradient-shift rounded-full" />
          
          {/* Efeito scanline no hover */}
          <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent animate-scanline" />
          </span>

          {/* Brilho superior com glow */}
          <span className="absolute inset-0 bg-gradient-to-t from-transparent via-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />

          {/* Anel de dados giratório */}
          <span className="absolute -inset-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <span className="absolute inset-0 rounded-full border-2 border-vive-secondary/30 animate-spin-slow" />
            <span className="absolute inset-0 rounded-full border-2 border-vive-primary/30 animate-spin-slow-reverse" />
          </span>

          {/* Sombra pulsante tecnológica */}
          <span className="absolute inset-0 rounded-full blur-2xl bg-vive-primary/40 group-hover:bg-vive-primary/60 transition-all duration-700 animate-pulse-slow" />

          <span className="relative z-10 flex items-center justify-center gap-4">
            {/* Ícone da câmera sem animação de pulso, apenas leve rotação no hover */}
            <svg
              className="h-5 w-5 transition-transform duration-500 group-hover:rotate-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {isCapturing ? "ENVIANDO..." : "CAPTURAR FOTO"}
          </span>

          {/* Shine deslizante tecnológico */}
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]" />

          {/* Glitch ocasional no texto */}
          <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <span className="text-white/5 text-[2rem] font-black tracking-widest select-none animate-glitch-text">
              {isCapturing ? "ENVIANDO..." : "CAPTURAR FOTO"}
            </span>
          </span>
        </button>
      </div>

      {/* ===== ESTILOS ===== */}
      <style>{`
        /* Grid tecnológico */
        .tech-grid {
          background-image:
            linear-gradient(rgba(168,85,247,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168,85,247,0.08) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse at center, black 30%, transparent 70%);
          animation: grid-move 20s linear infinite;
        }
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(60px, 60px); }
        }

        /* Linhas de circuito animadas */
        .animate-circuit-line {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: draw-line 8s ease-in-out infinite;
        }
        .animate-circuit-line-delay {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: draw-line 8s ease-in-out 2s infinite;
        }
        .animate-circuit-line-delay-2 {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: draw-line 8s ease-in-out 4s infinite;
        }
        .animate-circuit-line-delay-3 {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: draw-line 8s ease-in-out 6s infinite;
        }
        @keyframes draw-line {
          0% { stroke-dashoffset: 1000; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 0; }
        }

        /* Partículas tecnológicas */
        .particle-tech {
          position: absolute;
          border-radius: 50%;
          animation: float-particle linear infinite;
          opacity: 0.6;
        }
        @keyframes float-particle {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 0.2;
          }
          25% {
            transform: translate(30px, -40px) scale(1.3);
            opacity: 0.8;
          }
          50% {
            transform: translate(-20px, 20px) scale(0.7);
            opacity: 0.4;
          }
          75% {
            transform: translate(40px, -10px) scale(1.5);
            opacity: 0.9;
          }
          100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.2;
          }
        }

        /* Texto com animação de flutuação */
        .animate-text-float {
          animation: text-float 3s ease-in-out infinite;
        }
        .animate-text-float-delay {
          animation: text-float 3s ease-in-out 0.5s infinite;
        }
        @keyframes text-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        .tech-title {
          text-shadow: 0 0 40px rgba(168,85,247,0.3);
        }
        .tech-subtitle {
          text-shadow: 0 0 20px rgba(168,85,247,0.15);
        }
        .tech-badge {
          box-shadow: 0 0 30px rgba(168,85,247,0.15);
        }
        .tech-frame {
          box-shadow: 0 0 60px rgba(168,85,247,0.25);
        }
        .tech-corner {
          animation: corner-pulse 2s ease-in-out infinite;
        }
        @keyframes corner-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }

        /* Scanline */
        .animate-scanline {
          animation: scanline 1.5s linear infinite;
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }

        /* Spins lentos */
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .animate-spin-slow-reverse {
          animation: spin-slow 10s linear infinite reverse;
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Glitch texto */
        .animate-glitch-text {
          animation: glitch-text 0.2s ease-in-out infinite alternate;
        }
        @keyframes glitch-text {
          0% { transform: translate(-2px, 1px) scale(1.02); opacity: 0.3; }
          100% { transform: translate(2px, -1px) scale(0.98); opacity: 0.5; }
        }

        /* Demais animações */
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          100% { background-position: 300% 50%; }
        }
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }
        @keyframes countdown-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        .animate-gradient-shift {
          animation: gradient-shift 3s linear infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
        .animate-countdown-pulse {
          animation: countdown-pulse 0.5s ease-in-out infinite;
        }

        /* Responsividade */
        @media (max-width: 640px) {
          .tech-grid {
            background-size: 30px 30px;
          }
        }
      `}</style>
    </div>
  );
};

export default CameraCapture;