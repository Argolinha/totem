import React from "react";
import { useSessionContext } from "../context/SessionContext";

const FinalPreview: React.FC = () => {
  const { results, chosenIndex, experience, setScreen } = useSessionContext();
  const previewUrl = results[chosenIndex ?? 0];
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 overflow-y-auto bg-[#06030f] p-6 text-white">
      <h2 className="text-center text-3xl font-black tracking-tight md:text-4xl">CONFIRA SEU RESULTADO</h2>
      {previewUrl ? (
        <img src={previewUrl} alt={`Foto com efeito ${experience?.name || "de IA"}`}
          className="max-h-[62vh] max-w-full object-contain" />
      ) : <p>Resultado indisponível. Inicie uma nova captura.</p>}
      <p className="text-sm text-white/70">{experience?.name}</p>
      <div className="flex gap-4">
        <button onClick={() => setScreen("camera")} className="rounded-full border border-white/30 px-8 py-3 font-bold">REFAZER</button>
        <button disabled={!previewUrl} onClick={() => setScreen("output-options")}
          className="rounded-full bg-vive-primary px-8 py-3 font-bold disabled:opacity-40">CONTINUAR</button>
      </div>
    </div>
  );
};
export default FinalPreview;
