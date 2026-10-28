import {adminApi, errorMessage} from './api';
import {notify} from './data';
import React, { useEffect, useState } from "react";
import Layout from "./layout";
import {
  Printer,
  CheckCircle,
  AlertCircle,
  Settings,
  RefreshCw,
  FileImage,
  Copy,
  Save,
  Wifi,
} from "lucide-react";

export default function Impressao() {
  const [impressora, setImpressora] = useState("Fujifilm ASK-400");
  const [papel, setPapel] = useState("10x15 cm");
  const [qualidade, setQualidade] = useState("Alta");
  const [copias, setCopias] = useState(1);
  const [modo, setModo] = useState("Automático");
  const [salvo, setSalvo] = useState(false);

  const [busy,setBusy]=useState(false);const [loaded,setLoaded]=useState(false);
  useEffect(()=>{adminApi.get('/preferences/impressao').then(r=>{const v=r.data;if(v.impressora!==undefined)setImpressora(v.impressora);if(v.papel!==undefined)setPapel(v.papel);if(v.qualidade!==undefined)setQualidade(v.qualidade);if(v.copias!==undefined)setCopias(v.copias);if(v.modo!==undefined)setModo(v.modo);setLoaded(true);}).catch(e=>notify(errorMessage(e),true));},[]);
  const salvarConfiguracoes=async()=>{if(busy||!loaded)return;setBusy(true);setSalvo(false);try{await adminApi.put('/preferences/impressao',{impressora,papel,qualidade,copias,modo});setSalvo(true);}catch(e){notify(errorMessage(e),true);}finally{setBusy(false);}};

  return (
    <Layout
      title="04. IMPRESSÃO"
      currentPath="/impressao"
    >
      {/* Cabeçalho */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Configuração de Impressão
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Configure a impressora e os parâmetros das fotografias.
          </p>
        </div>

        <button
          disabled={busy||!loaded} onClick={salvarConfiguracoes}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-vive-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Save size={18} />
          Salvar configurações
        </button>
      </div>

      {/* Mensagem de sucesso */}
      {salvo && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
          <CheckCircle size={20} />

          <div>
            <p className="text-sm font-semibold">
              Configurações salvas
            </p>

            <p className="text-xs mt-0.5">
              As configurações de impressão foram atualizadas.
            </p>
          </div>
        </div>
      )}

      {/* Status da impressora */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
              <Printer
                size={24}
                className="text-green-500"
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900">
                  {impressora}
                </h3>

                <span className="flex items-center gap-1.5 text-xs font-semibold text-green-500">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Não monitorada
                </span>
              </div>

              <p className="text-sm text-gray-500 mt-1">
                Preferência de impressora cadastrada
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              onClick={() =>
                notify("A impressão física ainda não está integrada neste projeto.",true)
              }
            >
              <RefreshCw size={17} />
              Testar conexão
            </button>

            <button
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              onClick={() =>
                notify("Configure o driver e a impressora no sistema operacional do totem.")
              }
            >
              <Settings size={17} />
              Configurar
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Configurações */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-vive-primary/10 flex items-center justify-center">
              <Settings
                size={20}
                className="text-vive-primary"
              />
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-900">
                Preferências
              </h3>

              <p className="text-xs text-gray-500">
                Defina como as fotos serão impressas.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Impressora */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Impressora
              </label>

              <select
                value={impressora}
                onChange={(e) => setImpressora(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-vive-primary/30 focus:border-vive-primary"
              >
                <option>Fujifilm ASK-400</option>
                <option>DS-RX1HS</option>
                <option>DNP DS620</option>
                <option>Impressora não selecionada</option>
              </select>
            </div>

            {/* Papel */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tamanho do papel
              </label>

              <select
                value={papel}
                onChange={(e) => setPapel(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-vive-primary/30 focus:border-vive-primary"
              >
                <option>10x15 cm</option>
                <option>15x20 cm</option>
                <option>20x30 cm</option>
              </select>
            </div>

            {/* Qualidade */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Qualidade
              </label>

              <select
                value={qualidade}
                onChange={(e) => setQualidade(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-vive-primary/30 focus:border-vive-primary"
              >
                <option>Rascunho</option>
                <option>Normal</option>
                <option>Alta</option>
                <option>Máxima</option>
              </select>
            </div>

            {/* Número de cópias */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cópias por foto
              </label>

              <div className="flex items-center">
                <button
                  onClick={() =>
                    setCopias((valor) => Math.max(1, valor - 1))
                  }
                  className="w-11 h-11 border border-gray-200 rounded-l-lg bg-gray-50 text-gray-600 hover:bg-gray-100"
                >
                  −
                </button>

                <div className="w-16 h-11 border-y border-gray-200 flex items-center justify-center text-sm font-semibold text-gray-900">
                  {copias}
                </div>

                <button
                  onClick={() =>
                    setCopias((valor) => Math.min(10, valor + 1))
                  }
                  className="w-11 h-11 border border-gray-200 rounded-r-lg bg-gray-50 text-gray-600 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Modo de impressão */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Modo de impressão
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {["Automático", "Manual", "Economia"].map(
                (opcao) => (
                  <button
                    key={opcao}
                    onClick={() => setModo(opcao)}
                    className={`p-4 rounded-lg border text-left transition-colors ${
                      modo === opcao
                        ? "border-vive-primary bg-vive-primary/5"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <p
                      className={`text-sm font-semibold ${
                        modo === opcao
                          ? "text-vive-primary"
                          : "text-gray-800"
                      }`}
                    >
                      {opcao}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      {opcao === "Automático" &&
                        "Imprime automaticamente após o processamento."}

                      {opcao === "Manual" &&
                        "Exige confirmação antes de imprimir."}

                      {opcao === "Economia" &&
                        "Prioriza economia de papel e tinta."}
                    </p>
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Resumo */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-base font-bold text-gray-900 mb-5">
              Resumo atual
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Impressora
                </span>

                <span className="text-sm font-semibold text-gray-900">
                  {impressora}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Papel
                </span>

                <span className="text-sm font-semibold text-gray-900">
                  {papel}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Qualidade
                </span>

                <span className="text-sm font-semibold text-gray-900">
                  {qualidade}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Cópias
                </span>

                <span className="text-sm font-semibold text-gray-900">
                  {copias}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Modo
                </span>

                <span className="text-sm font-semibold text-gray-900">
                  {modo}
                </span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-base font-bold text-gray-900 mb-5">
              Status
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle
                  size={19}
                  className="text-green-500"
                />

                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Impressora não monitorada
                  </p>

                  <p className="text-xs text-gray-500">
                    Integração física pendente
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Wifi
                  size={19}
                  className="text-green-500"
                />

                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Conexão física pendente
                  </p>

                  <p className="text-xs text-gray-500">
                    Configure o driver da impressora no host
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FileImage
                  size={19}
                  className="text-vive-primary"
                />

                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Formato da foto
                  </p>

                  <p className="text-xs text-gray-500">
                    JPEG • {papel}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Alerta */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
            <div className="flex gap-3">
              <AlertCircle
                size={19}
                className="text-amber-500 shrink-0 mt-0.5"
              />

              <div>
                <p className="text-sm font-semibold text-amber-800">
                  Atenção
                </p>

                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                  As preferências são salvas no banco de dados.
                  A integração real com a impressora será conectada
                  posteriormente ao sistema.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Teste de impressão */}
      <div className="mt-6 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-vive-primary/10 flex items-center justify-center">
              <Printer
                size={21}
                className="text-vive-primary"
              />
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-900">
                Teste de impressão
              </h3>

              <p className="text-xs text-gray-500 mt-1">
                Envie uma página de teste para verificar a impressora.
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              notify("Nenhum teste foi enviado: integração com a impressora física pendente.",true)
            }
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-vive-primary text-vive-primary text-sm font-semibold hover:bg-vive-primary/5 transition-colors"
          >
            <Printer size={17} />
            Imprimir teste
          </button>
        </div>
      </div>
    </Layout>
  );
}