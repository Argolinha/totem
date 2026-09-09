import React, { useState } from "react";
import { useSessionContext, Screen } from "../context/SessionContext";

/**
 * Painel de desenvolvimento: permite pular direto para qualquer tela do
 * fluxo, preenchendo automaticamente os dados mocados necessários
 * (sessão, resultados, moldura, opção de saída etc.) via
 * `devJumpToScreen`. Só é renderizado em modo mock/dev (ver App.tsx).
 *
 * Isso resolve o problema de telas como "printing", "qr" e "thank-you"
 * só serem alcançáveis passando pelo fluxo inteiro, incluindo a câmera.
 */
const SCREENS: { id: Screen; label: string }[] = [
  { id: "welcome", label: "Boas-vindas" },
  { id: "experience-select", label: "Escolha da experiência" },
  { id: "people-select", label: "Nº de pessoas" },
  { id: "camera", label: "Câmera" },
  { id: "processing", label: "Processando" },
  { id: "results", label: "Resultados (grid)" },
  { id: "frame-select", label: "Escolha da moldura" },
  { id: "final-preview", label: "Prévia final" },
  { id: "output-options", label: "Imprimir / QR" },
  { id: "printing", label: "Imprimindo" },
  { id: "qr", label: "QR Code" },
  { id: "thank-you", label: "Obrigado" },
  { id: "error", label: "Erro" },
];

const DevScreenSwitcher: React.FC = () => {
  const { screen, devJumpToScreen } = useSessionContext();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-[9999] font-sans">
      {open && (
        <div className="mb-2 max-h-[70vh] w-64 overflow-y-auto rounded-xl border border-white/15 bg-black/90 p-3 shadow-2xl backdrop-blur-md">
          <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-widest text-white/50">
            Dev · Ir para tela (mock)
          </p>
          <div className="flex flex-col gap-1">
            {SCREENS.map((s) => (
              <button
                key={s.id}
                onClick={() => devJumpToScreen(s.id)}
                className={`rounded-lg px-3 py-2 text-left text-xs font-semibold transition-colors ${
                  screen === s.id
                    ? "bg-vive-primary/80 text-white"
                    : "bg-white/5 text-white/80 hover:bg-white/15"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Abrir navegação de desenvolvimento"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/80 text-white shadow-xl backdrop-blur-md transition-transform hover:scale-105"
      >
        {open ? "✕" : "🛠"}
      </button>
    </div>
  );
};

export default DevScreenSwitcher;
