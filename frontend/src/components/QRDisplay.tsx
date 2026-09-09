import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { photoboothApi } from "../api/client";
import { useSessionContext } from "../context/SessionContext";

const AUTO_ADVANCE_MS = 20000; // segue para o agradecimento após um tempo, mesmo sem interação

/** Tela 12 - QR Code para download digital da foto. */
const QRDisplay: React.FC = () => {
  const { sessionId, setScreen } = useSessionContext();
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  // Busca a URL de download assim que a tela é exibida (com tratamento de erro
  // e possibilidade de tentar novamente, para nunca "travar" a tela em silêncio)
  useEffect(() => {
    let cancelled = false;

    if (!sessionId) {
      setFetchError("Sessão não encontrada. Não foi possível gerar o QR Code.");
      console.error("QRDisplay: sessionId ausente ao tentar gerar o QR Code.");
      return;
    }

    setFetchError(null);
    photoboothApi
      .getQrCode(sessionId)
      .then((res) => {
        if (!cancelled) setDownloadUrl(res.download_url);
      })
      .catch((err) => {
        console.error("QRDisplay: falha ao buscar o QR Code:", err);
        if (!cancelled) {
          setFetchError("Não foi possível gerar o QR Code agora.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [sessionId, attempt]);

  // Segue automaticamente para o agradecimento após um tempo de exibição
  useEffect(() => {
    const timeout = setTimeout(() => setScreen("thank-you"), AUTO_ADVANCE_MS);
    return () => clearTimeout(timeout);
  }, [setScreen]);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-y-auto bg-[#0a0714] p-6 text-white">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.18),transparent_70%)]" />
      </div>

      <div className="relative z-10 flex flex-col items-center py-4">
        <h2 className="mb-6 text-center text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-cyan-200 md:text-4xl">
          ESCANEIE O QR CODE
        </h2>

        <div className="qr-frame rounded-2xl bg-white p-5 shadow-[0_0_60px_rgba(168,85,247,0.35)]">
          {downloadUrl ? (
            <QRCodeSVG value={downloadUrl} size={220} />
          ) : fetchError ? (
            <div className="flex h-[220px] w-[220px] flex-col items-center justify-center gap-3 text-center">
              <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86l-8.18 14.18A2 2 0 003.82 21h16.36a2 2 0 001.71-2.96L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <p className="text-xs font-medium text-red-600">{fetchError}</p>
              <button
                onClick={() => setAttempt((n) => n + 1)}
                className="rounded-full bg-red-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-red-600 transition-colors hover:bg-red-100"
              >
                Tentar novamente
              </button>
            </div>
          ) : (
            <div className="h-[220px] w-[220px] animate-pulse bg-black/5" />
          )}
        </div>

        <p className="mt-4 text-sm text-white/60">para baixar sua foto</p>

        <div className="mt-6 flex items-center gap-8 text-white/50">
          <div className="flex flex-col items-center gap-2">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7V5a2 2 0 012-2h2M3 17v2a2 2 0 002 2h2m10-16h2a2 2 0 012 2v2m-4 12h2a2 2 0 002-2v-2M8 12a4 4 0 108 0 4 4 0 00-8 0z" />
            </svg>
            <span className="text-[10px] uppercase tracking-wide text-center">Aponte a câmera<br />do seu celular</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span className="text-[10px] uppercase tracking-wide text-center">Acesse o link</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
            </svg>
            <span className="text-[10px] uppercase tracking-wide text-center">Baixe e<br />compartilhe</span>
          </div>
        </div>

        <button
          onClick={() => setScreen("thank-you")}
          className="mt-6 rounded-full border border-white/20 bg-white/5 px-8 py-2.5 text-sm font-semibold uppercase tracking-widest text-white/70 backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/10"
        >
          Concluir
        </button>
      </div>
    </div>
  );
};

export default QRDisplay;
