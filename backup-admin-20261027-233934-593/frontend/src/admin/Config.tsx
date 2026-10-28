import React, { useState } from "react";
import Layout from "./layout";
import {
  Settings,
  Camera,
  Clock,
  Printer,
  Volume2,
  Moon,
  Save,
  CheckCircle,
  Monitor,
} from "lucide-react";

export default function Config() {
  const [nomeTotem, setNomeTotem] = useState("Vive AI Photobooth");
  const [qualidade, setQualidade] = useState("Alta");
  const [contagem, setContagem] = useState("5");
  const [impressaoAutomatica, setImpressaoAutomatica] = useState(true);
  const [som, setSom] = useState(true);
  const [modoNoturno, setModoNoturno] = useState(false);
  const [salvo, setSalvo] = useState(false);

  const salvarConfiguracoes = () => {
    setSalvo(true);

    setTimeout(() => {
      setSalvo(false);
    }, 2500);
  };

  return (
    <Layout title="06. CONFIGURAÇÃO" currentPath="/config">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-vive-primary/10 flex items-center justify-center">
            <Settings
              size={22}
              className="text-vive-primary"
            />
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Configurações do sistema
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Configure o funcionamento do seu totem fotográfico.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Configurações gerais */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Monitor
                size={19}
                className="text-vive-primary"
              />

              <div>
                <h3 className="font-bold text-gray-900">
                  Configurações gerais
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  Informações básicas do seu photobooth.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <label className="block">
              <span className="text-sm font-semibold text-gray-700">
                Nome do totem
              </span>

              <input
                type="text"
                value={nomeTotem}
                onChange={(e) => setNomeTotem(e.target.value)}
                className="mt-2 w-full max-w-xl px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-vive-primary/30 focus:border-vive-primary"
                placeholder="Digite o nome do totem"
              />
            </label>
          </div>
        </section>

        {/* Câmera */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Camera
                size={19}
                className="text-vive-primary"
              />

              <div>
                <h3 className="font-bold text-gray-900">
                  Câmera
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  Defina a qualidade das fotos capturadas.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <label className="block max-w-xl">
              <span className="text-sm font-semibold text-gray-700">
                Qualidade da foto
              </span>

              <select
                value={qualidade}
                onChange={(e) => setQualidade(e.target.value)}
                className="mt-2 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-vive-primary/30"
              >
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
                <option value="Ultra">Ultra</option>
              </select>
            </label>
          </div>
        </section>

        {/* Contagem regressiva */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Clock
                size={19}
                className="text-vive-primary"
              />

              <div>
                <h3 className="font-bold text-gray-900">
                  Captura
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  Configure o tempo antes de tirar a foto.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <label className="block max-w-xl">
              <span className="text-sm font-semibold text-gray-700">
                Contagem regressiva
              </span>

              <select
                value={contagem}
                onChange={(e) => setContagem(e.target.value)}
                className="mt-2 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-vive-primary/30"
              >
                <option value="3">3 segundos</option>
                <option value="5">5 segundos</option>
                <option value="7">7 segundos</option>
                <option value="10">10 segundos</option>
              </select>
            </label>
          </div>
        </section>

        {/* Impressão */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Printer
                size={19}
                className="text-vive-primary"
              />

              <div>
                <h3 className="font-bold text-gray-900">
                  Impressão
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  Controle o comportamento da impressora.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between gap-6">
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Impressão automática
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Imprimir automaticamente após a captura da foto.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setImpressaoAutomatica(!impressaoAutomatica)
                }
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  impressaoAutomatica
                    ? "bg-vive-primary"
                    : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    impressaoAutomatica
                      ? "translate-x-7"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Som */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Volume2
                size={19}
                className="text-vive-primary"
              />

              <div>
                <h3 className="font-bold text-gray-900">
                  Áudio
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  Configure os sons da experiência.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between gap-6">
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Sons do sistema
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Reproduzir sons durante a contagem e captura.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSom(!som)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  som ? "bg-vive-primary" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    som
                      ? "translate-x-7"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Modo noturno */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Moon
                size={19}
                className="text-vive-primary"
              />

              <div>
                <h3 className="font-bold text-gray-900">
                  Modo de operação
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  Ajustes para utilização do totem.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between gap-6">
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Modo noturno
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Reduzir elementos visuais durante períodos de pouca utilização.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setModoNoturno(!modoNoturno)
                }
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  modoNoturno
                    ? "bg-vive-primary"
                    : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    modoNoturno
                      ? "translate-x-7"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Botão salvar */}
        <div className="flex items-center justify-end gap-4 pb-8">
          {salvo && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle size={18} />
              Configurações salvas!
            </div>
          )}

          <button
            type="button"
            onClick={salvarConfiguracoes}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-vive-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
          >
            <Save size={18} />
            Salvar configurações
          </button>
        </div>
      </div>
    </Layout>
  );
}