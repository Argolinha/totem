import React, { useState } from "react";
import { useSessionContext } from "../context/SessionContext";

const ResultsGrid: React.FC = () => {
  const { results, effectNames, experience, chooseResult, setScreen } = useSessionContext();
  const preferred = effectNames.findIndex(name => name === experience?.name);
  const [selected, setSelected] = useState(preferred >= 0 ? preferred : 0);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const confirm = async () => {
    setConfirming(true);
    setError("");
    try { await chooseResult(selected); }
    catch { setError("Não foi possível confirmar. Tente novamente."); setConfirming(false); }
  };
  return (
    <div className="h-full overflow-y-auto bg-[#0a0714] p-6 text-white">
      <div className="mx-auto flex min-h-full max-w-5xl flex-col items-center justify-center gap-6 py-6">
        <h2 className="text-center text-3xl font-black">ESCOLHA SEU EFEITO</h2>
        <p className="text-center text-white/60">Confira os efeitos aplicados à sua foto.</p>
        <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-3">
          {results.map((url, index) => (
            <button key={url} type="button" disabled={confirming} aria-pressed={selected === index}
              onClick={() => setSelected(index)}
              className={`overflow-hidden rounded-2xl border-2 bg-white/5 transition ${selected === index ? "border-cyan-300 ring-2 ring-cyan-300/30" : "border-white/15"}`}>
              <img src={url} alt={effectNames[index] || `Efeito ${index + 1}`} className="aspect-square w-full object-contain" />
              <span className="block p-3 text-sm font-bold">{effectNames[index] || `Efeito ${index + 1}`}</span>
            </button>
          ))}
        </div>
        {!results.length && <p role="alert">Nenhum efeito disponível. Refaça a captura.</p>}
        {error && <p role="alert">{error}</p>}
        <div className="flex gap-4">
          <button disabled={confirming} onClick={() => setScreen("camera")} className="rounded-full border border-white/30 px-8 py-3">REFAZER</button>
          <button disabled={confirming || !results.length} onClick={confirm} className="rounded-full bg-violet-600 px-8 py-3 font-bold disabled:opacity-40">{confirming ? "CONFIRMANDO..." : "USAR ESTE EFEITO"}</button>
        </div>
      </div>
    </div>
  );
};
export default ResultsGrid;
