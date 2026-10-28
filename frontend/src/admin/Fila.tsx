import {useRecords, DataState, perform, notify} from './data';
import {adminApi} from './api';
import React, { useEffect, useState } from "react";
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
  id: string;
  cliente: string;
  arquivo: string;
  horario: string;
  copias: number;
  status: "Aguardando" | "Imprimindo" | "Concluído" | "Erro";
}

export default function Fila() {
  const {rows,reload,loading,error}=useRecords('sessions?limit=500');
  const [hidden,setHidden]=useState<string[]>(()=>JSON.parse(sessionStorage.getItem('vive-hidden-completed')||'[]'));
  useEffect(()=>{const timer=setInterval(()=>{void reload();},15000);return()=>clearInterval(timer);},[reload]);
  const jobs:Job[]=rows.filter(s=>!hidden.includes(s.id)).map(s=>({id:s.id,cliente:s.evento_id||s.cliente_id||s.totem_id,arquivo:s.results?.[0]?.split('/').pop()||'Foto em processamento',horario:new Date(s.created_at).toLocaleTimeString('pt-BR'),copias:s.printed?1:0,status:s.status==='error'?'Erro':s.status==='printing'?'Imprimindo':s.printed||['ready','chosen','printed'].includes(s.status)?'Concluído':'Aguardando'}));

  const [filtro, setFiltro] = useState("Todos");

  const limparConcluidos=()=>{const ids=[...hidden,...jobs.filter(j=>j.status==='Concluído').map(j=>j.id)];setHidden(ids);sessionStorage.setItem('vive-hidden-completed',JSON.stringify(ids));notify('Concluídos ocultos nesta sessão. O histórico foi preservado.');};
  const cancelar=(id:string)=>{if(window.confirm('Cancelar esta sessão aguardando processamento?'))void perform(()=>adminApi.post('/sessions/'+id+'/cancel'),()=>{void reload();});};
  const tentarNovamente=(id:string)=>{void perform(()=>adminApi.post('/sessions/'+id+'/reprocess'),()=>{void reload();});};
  const iniciarImpressao=(_id:string)=>notify('A impressão física ainda não está integrada neste projeto.',true);

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
      <DataState loading={loading} error={error} count={jobs.length}/>
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
              onClick={()=>{void reload();}}
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