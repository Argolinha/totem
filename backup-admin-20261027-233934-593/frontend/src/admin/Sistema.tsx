import React, { useState } from "react";
import Layout from "./layout";
import {
  Server,
  Wifi,
  Monitor,
  HardDrive,
  RefreshCw,
  Power,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";

export default function Sistema() {
  const [reiniciando, setReiniciando] = useState(false);
  const [reiniciado, setReiniciado] = useState(false);

  const reiniciarSistema = () => {
    const confirmar = window.confirm(
      "Deseja realmente reiniciar o sistema?"
    );

    if (!confirmar) return;

    setReiniciando(true);
    setReiniciado(false);

    setTimeout(() => {
      setReiniciando(false);
      setReiniciado(true);

      setTimeout(() => {
        setReiniciado(false);
      }, 3000);
    }, 2000);
  };

  return (
    <Layout title="07. SISTEMA" currentPath="/sistema">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-vive-primary/10 flex items-center justify-center">
            <Server
              size={22}
              className="text-vive-primary"
            />
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Sistema
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Monitore o estado e as informações do seu photobooth.
            </p>
          </div>
        </div>
      </div>

      {/* Status geral */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Status do sistema
            </h3>

            <p className="text-xs text-gray-500 mt-1">
              Verificação dos principais serviços.
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 text-green-600">
            <CheckCircle size={18} />
            <span className="text-sm font-semibold">
              Sistema operacional
            </span>
          </div>
        </div>
      </div>

      {/* Serviços */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <Wifi
                  size={20}
                  className="text-green-500"
                />
              </div>

              <div>
                <h3 className="font-bold text-gray-900">
                  Internet
                </h3>

                <p className="text-xs text-gray-500">
                  Conexão de rede
                </p>
              </div>
            </div>

            <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Conectado
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <Server
                  size={20}
                  className="text-green-500"
                />
              </div>

              <div>
                <h3 className="font-bold text-gray-900">
                  Serviços
                </h3>

                <p className="text-xs text-gray-500">
                  Serviços da aplicação
                </p>
              </div>
            </div>

            <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Online
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <Monitor
                  size={20}
                  className="text-green-500"
                />
              </div>

              <div>
                <h3 className="font-bold text-gray-900">
                  Câmera
                </h3>

                <p className="text-xs text-gray-500">
                  Dispositivo de captura
                </p>
              </div>
            </div>

            <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Pronta
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <HardDrive
                  size={20}
                  className="text-green-500"
                />
              </div>

              <div>
                <h3 className="font-bold text-gray-900">
                  Armazenamento
                </h3>

                <p className="text-xs text-gray-500">
                  Espaço para fotos
                </p>
              </div>
            </div>

            <span className="text-xs font-semibold text-green-600">
              Normal
            </span>
          </div>
        </div>
      </div>

      {/* Informações */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Info
              size={19}
              className="text-vive-primary"
            />

            <div>
              <h3 className="font-bold text-gray-900">
                Informações do sistema
              </h3>

              <p className="text-xs text-gray-500 mt-1">
                Dados técnicos da instalação.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
          <div>
            <p className="text-xs text-gray-400 mb-1">
              Aplicação
            </p>

            <p className="text-sm font-semibold text-gray-800">
              Vive AI Photobooth
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-1">
              Versão
            </p>

            <p className="text-sm font-semibold text-gray-800">
              1.0.0
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-1">
              Ambiente
            </p>

            <p className="text-sm font-semibold text-gray-800">
              Produção
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-1">
              Status
            </p>

            <p className="text-sm font-semibold text-green-600">
              Operacional
            </p>
          </div>
        </div>
      </div>

      {/* Área de manutenção */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <RefreshCw
              size={19}
              className="text-vive-primary"
            />

            <div>
              <h3 className="font-bold text-gray-900">
                Manutenção
              </h3>

              <p className="text-xs text-gray-500 mt-1">
                Ações administrativas do sistema.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <p className="text-sm font-semibold text-gray-800">
                Reiniciar sistema
              </p>

              <p className="text-xs text-gray-500 mt-1">
                Reinicia os serviços da aplicação.
              </p>
            </div>

            <button
              type="button"
              onClick={reiniciarSistema}
              disabled={reiniciando}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition-colors"
            >
              <RefreshCw
                size={17}
                className={reiniciando ? "animate-spin" : ""}
              />

              {reiniciando
                ? "Reiniciando..."
                : "Reiniciar sistema"}
            </button>
          </div>

          {reiniciado && (
            <div className="mt-5 flex items-center gap-2 px-4 py-3 rounded-lg bg-green-50 text-green-600 text-sm font-medium">
              <CheckCircle size={18} />
              Sistema reiniciado com sucesso!
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={18}
                className="text-amber-500 mt-0.5"
              />

              <p className="text-xs text-gray-500 leading-relaxed">
                O reinício acima é apenas uma simulação nesta versão
                do painel. Quando conectarmos o backend, ele poderá
                reiniciar os serviços reais do photobooth.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Desligar */}
      <div className="mt-6 mb-8 bg-red-50 border border-red-100 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <h3 className="text-sm font-bold text-red-800">
              Desligar sistema
            </h3>

            <p className="text-xs text-red-600 mt-1">
              Esta função ficará disponível quando o hardware do
              totem estiver conectado.
            </p>
          </div>

          <button
            type="button"
            disabled
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-red-200 text-red-500 text-sm font-semibold cursor-not-allowed"
          >
            <Power size={17} />
            Desligar
          </button>
        </div>
      </div>
    </Layout>
  );
}