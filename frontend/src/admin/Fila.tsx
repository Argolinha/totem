import React, { useState } from "react";
import Layout from "./layout";
import {
  Printer,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  Trash2,
  Play,
  Image as ImageIcon,
} from "lucide-react";

interface Job {
  id: number;
  cliente: string;
  arquivo: string;
  horario: string;
  copias: number;
  status: "Aguardando" | "Imprimindo" | "Concluído" | "Erro";
}

export default function Fila() {
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: 1,
      cliente: "Evento Corporativo",
      arquivo: "foto_001.jpg",
      horario: "14:32",
      copias: 2,
      status: "Imprimindo",
    },
    {
      id: 2,
      cliente: "Casamento Ana & Lucas",
      arquivo: "foto_002.jpg",
      horario: "14:35",
      copias: 1,
      status: "Aguardando",
    },
    {
      id: 3,
      cliente: "Aniversário 15 Anos",
      arquivo: "foto_003.jpg",
      horario: "14:37",
      copias: 3,
      status: "Aguardando",
    },
    {
      id: 4,
      cliente: "Evento Corporativo",
      arquivo: "foto_004.jpg",
      horario: "14:40",
      copias: 1,
      status: "Concluído",
    },
    {
      id: 5,
      cliente: "Formatura",
      arquivo: "foto_005.jpg",
      horario: "14:42",
      copias: 2,
      status: "Erro",
    },
  ]);

  const [filtro, setFiltro] = useState("Todos");

  const limparConcluidos = () => {
    setJobs((atual) =>
      atual.filter((job) => job.status !== "Concluído")
    );
  };

  const cancelar = (id: number) => {
    setJobs((atual) => atual.filter((job) => job.id !== id));
  };

  const tentarNovamente = (id: number) => {
    setJobs((atual) =>
      atual.map((job) =>
        job.id === id
          ? { ...job, status: "Aguardando" }
          : job
      )
    );
  };

  const iniciarImpressao = (id: number) => {
    setJobs((atual) =>
      atual.map((job) =>
        job.id === id
          ? { ...job, status: "Imprimindo" }
          : job
      )
    );

    setTimeout(() => {
      setJobs((atual) =>
        atual.map((job) =>
          job.id === id
            ? { ...job, status: "Concluído" }
            : job
        )
      );
    }, 2500);
  };

  const jobsFiltrados =
    filtro === "Todos"
      ? jobs
      : jobs.filter((job) => job.status === filtro);

  const aguardando = jobs.filter(
    (job) => job.status === "Aguardando"
  ).length;

  const imprimindo = jobs.filter(
    (job) => job.status === "Imprimindo"
  ).length;

  const concluidos = jobs.filter(
    (job) => job.status === "Concluído"
  ).length;

  const erros = jobs.filter(
    (job) => job.status === "Erro"
  ).length;

  const statusConfig = {
    Aguardando: {
      icon: Clock,
      className: "bg-yellow-50 text-yellow-700",
    },
    Imprimindo: {
      icon: Printer,
      className: "bg-blue-50 text-blue-700",
    },
    Concluído: {
      icon: CheckCircle,
      className: "bg-green-50 text-green-700",
    },
    Erro: {
      icon: AlertCircle,
      className: "bg-red-50 text-red-700",
    },
  };

  return (
    <Layout
      title="05. FILA DE IMPRESSÃO"
      currentPath="/fila"
    >
      <div className="space-y-6">

        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Fila de impressão
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Acompanhe e gerencie as fotos que serão impressas.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={limparConcluidos}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50"
            >
              <Trash2 size={17} />
              Limpar concluídos
            </button>

            <button
              onClick={() => window.alert("Fila atualizada!")}
              className="flex items-center gap-2 px-4 py-2 bg-vive-primary text-white rounded-lg hover:opacity-90"
            >
              <RefreshCw size={17} />
              Atualizar
            </button>
          </div>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Aguardando
                </p>

                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {aguardando}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-yellow-50">
                <Clock className="text-yellow-600" size={22} />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Imprimindo
                </p>

                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {imprimindo}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-blue-50">
                <Printer className="text-blue-600" size={22} />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Concluídos
                </p>

                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {concluidos}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-green-50">
                <CheckCircle className="text-green-600" size={22} />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Com erro
                </p>

                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {erros}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-red-50">
                <AlertCircle className="text-red-600" size={22} />
              </div>
            </div>
          </div>

        </div>

        {/* Filtros */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">

          <div className="flex flex-wrap gap-2">

            {[
              "Todos",
              "Aguardando",
              "Imprimindo",
              "Concluído",
              "Erro",
            ].map((item) => (
              <button
                key={item}
                onClick={() => setFiltro(item)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filtro === item
                    ? "bg-vive-primary text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {item}
              </button>
            ))}

          </div>

        </div>

        {/* Tabela */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">
              Trabalhos de impressão
            </h3>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-50">

                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Foto
                  </th>

                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Evento
                  </th>

                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Horário
                  </th>

                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Cópias
                  </th>

                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </th>

                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Ações
                  </th>
                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {jobsFiltrados.map((job) => {

                  const config = statusConfig[job.status];
                  const StatusIcon = config.icon;

                  return (
                    <tr
                      key={job.id}
                      className="hover:bg-gray-50"
                    >

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-3">

                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                            <ImageIcon
                              size={22}
                              className="text-gray-400"
                            />
                          </div>

                          <span className="text-sm font-medium text-gray-900">
                            {job.arquivo}
                          </span>

                        </div>

                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {job.cliente}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {job.horario}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {job.copias}
                      </td>

                      <td className="px-6 py-4">

                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${config.className}`}
                        >
                          <StatusIcon size={14} />
                          {job.status}
                        </span>

                      </td>

                      <td className="px-6 py-4">

                        <div className="flex justify-end gap-2">

                          {job.status === "Aguardando" && (
                            <button
                              onClick={() =>
                                iniciarImpressao(job.id)
                              }
                              title="Iniciar impressão"
                              className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
                            >
                              <Play size={17} />
                            </button>
                          )}

                          {job.status === "Erro" && (
                            <button
                              onClick={() =>
                                tentarNovamente(job.id)
                              }
                              title="Tentar novamente"
                              className="p-2 rounded-lg text-orange-600 hover:bg-orange-50"
                            >
                              <RefreshCw size={17} />
                            </button>
                          )}

                          {job.status !== "Concluído" && (
                            <button
                              onClick={() =>
                                cancelar(job.id)
                              }
                              title="Cancelar"
                              className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                            >
                              <XCircle size={17} />
                            </button>
                          )}

                        </div>

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

            {jobsFiltrados.length === 0 && (
              <div className="py-12 text-center">

                <Printer
                  size={40}
                  className="mx-auto text-gray-300"
                />

                <p className="text-gray-500 mt-3">
                  Nenhum trabalho encontrado.
                </p>

              </div>
            )}

          </div>

        </div>

      </div>
    </Layout>
  );
}