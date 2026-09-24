import React from "react";

/**
 * Estilo visual de cada moldura cadastrada em SessionContext.tsx (FRAMES).
 * Cada entrada define o gradiente da borda, a cor do glow e um glifo de
 * canto — isso é o que faz a moldura parecer um "modelo" de verdade em vez
 * de uma borda lisa. `animated: true` liga um shift de gradiente (dá a
 * sensação de moldura "viva"/3D nas temáticas mais tecnológicas/festivas.
 */
export interface FrameVisual {
  border: string; // gradiente CSS aplicado como fundo do "quadro"
  glow: string; // cor usada no box-shadow externo
  corner?: string; // glifo decorativo nos 4 cantos
  animated?: boolean;
}

export const FRAME_VISUAL_STYLES: Record<string, FrameVisual> = {
  padrao: {
    border: "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.45))",
    glow: "rgba(255,255,255,0.22)",
  },
  cartoon3d: {
    border: "linear-gradient(135deg, #ff7a18, #ffb347, #ff4d6d)",
    glow: "rgba(255,122,24,0.55)",
    corner: "✦",
  },
  anos80: {
    border: "linear-gradient(135deg, #ff2ea6, #7c3aed, #22d3ee)",
    glow: "rgba(236,72,153,0.55)",
    corner: "▲",
    animated: true,
  },
  anime: {
    border: "linear-gradient(135deg, #f9a8d4, #c4b5fd, #93c5fd)",
    glow: "rgba(196,181,253,0.5)",
    corner: "✧",
  },
  pb: {
    border: "linear-gradient(135deg, #f5f5f5, #9ca3af, #111827)",
    glow: "rgba(255,255,255,0.18)",
    corner: "◆",
  },
  aquarela: {
    border: "linear-gradient(135deg, #a7f3d0, #93c5fd, #fbcfe8)",
    glow: "rgba(147,197,253,0.45)",
    corner: "❋",
  },
  cyberpunk: {
    border: "linear-gradient(135deg, #22d3ee, #a855f7, #ec4899)",
    glow: "rgba(34,211,238,0.6)",
    corner: "⌁",
    animated: true,
  },
  holografico3d: {
    border: "linear-gradient(135deg, #a5f3fc, #f0abfc, #fde68a, #a5f3fc)",
    glow: "rgba(240,171,252,0.55)",
    corner: "◈",
    animated: true,
  },
  dourado3d: {
    border: "linear-gradient(135deg, #fde68a, #f59e0b, #92400e)",
    glow: "rgba(245,158,11,0.5)",
    corner: "✥",
  },
  festa: {
    border: "linear-gradient(135deg, #f43f5e, #f59e0b, #22c55e, #3b82f6, #a855f7)",
    glow: "rgba(244,63,94,0.5)",
    corner: "✺",
    animated: true,
  },
};

interface FrameFrameProps {
  frameId: string;
  children: React.ReactNode;
  className?: string;
  thickness?: number; // espessura da moldura em px
}

/**
 * Envolve a foto (thumbnail ou preview final) com o design real da moldura
 * selecionada: gradiente + glow + leve efeito de profundidade (inset shadow)
 * + glifos nos cantos. Use o mesmo componente em FrameSelect e FinalPreview
 * para a prévia bater exatamente com o resultado final.
 */
const FrameFrame: React.FC<FrameFrameProps> = ({ frameId, children, className = "", thickness = 10 }) => {
  const style = FRAME_VISUAL_STYLES[frameId] ?? FRAME_VISUAL_STYLES.padrao;

  return (
    <div
      className={`frame-frame relative overflow-hidden rounded-xl ${style.animated ? "frame-frame-animated" : ""} ${className}`}
      style={{
        padding: thickness,
        backgroundImage: style.border,
        backgroundSize: style.animated ? "300% 300%" : "100% 100%",
        boxShadow: `0 0 24px ${style.glow}, inset 0 0 14px rgba(0,0,0,0.4)`,
      }}
    >
      <div className="relative overflow-hidden rounded-lg bg-black/20">{children}</div>

      {style.corner && (
        <>
          <span className="frame-corner frame-corner-tl">{style.corner}</span>
          <span className="frame-corner frame-corner-tr">{style.corner}</span>
          <span className="frame-corner frame-corner-bl">{style.corner}</span>
          <span className="frame-corner frame-corner-br">{style.corner}</span>
        </>
      )}

      <style>{`
        .frame-frame-animated { animation: frameGradientShift 6s ease-in-out infinite; }
        @keyframes frameGradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .frame-corner {
          position: absolute;
          font-size: 13px;
          line-height: 1;
          color: rgba(255,255,255,0.95);
          text-shadow: 0 0 6px rgba(0,0,0,0.65);
          pointer-events: none;
        }
        .frame-corner-tl { top: 4px; left: 4px; }
        .frame-corner-tr { top: 4px; right: 4px; }
        .frame-corner-bl { bottom: 4px; left: 4px; }
        .frame-corner-br { bottom: 4px; right: 4px; }
      `}</style>
    </div>
  );
};

export default FrameFrame;