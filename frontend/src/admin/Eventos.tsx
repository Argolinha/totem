
import { useState } from "react";
import {
  CalendarDays,
  Search,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock3,
  CheckCircle2,
  Users,
  MapPin,
  Heart,
  Gift,
  Camera,
  Printer,
  UserRound,
  Sparkles,
  FileText,
  Pencil,
  Copy,
  MoreHorizontal,
  X,
  Check,
  Circle,
  ChevronDown as Down,
} from "lucide-react";

import Layout from "./layout";

type Evento = {
  id: number;
  nome: string;
  tipo: string;
  cliente: string;
  local: string;
  convidados: number;
  horario: string;
  data: string;
  status: string;
  cor: string;
};

const eventosIniciais: Evento[] = [
  {
    id: 1,
    nome: "Casamento Ana + Pedro",
    tipo: "Casamento",
    cliente: "Ana Paula",
    local: "Cerimonial X Vila Velha - ES",
    convidados: 180,
    horario: "19:00",
    data: "18/10/2026",
    status: "Confirmado",
    cor: "#6954EA",
  },
  {
    id: 2,
    nome: "Aniversário Mariana 15 anos",
    tipo: "Aniversário",
    cliente: "Mariana Silva",
    local: "Espaço Festas Vitória - ES",
    convidados: 150,
    horario: "18:00",
    data: "22/10/2026",
    status: "Em preparação",
    cor: "#4DA5ED",
  },
  {
    id: 3,
    nome: "Evento Corporativo",
    tipo: "Corporativo",
    cliente: "Empresa XPTO",
    local: "Hotel Golden Serra - ES",
    convidados: 250,
    horario: "17:00",
    data: "25/10/2026",
    status: "Em produção",
    cor: "#E8A51C",
  },
  {
    id: 4,
    nome: "Formatura Turma 2026",
    tipo: "Formatura",
    cliente: "Formatura UVV",
    local: "UFES Vitória - ES",
    convidados: 300,
    horario: "20:00",
    data: "08/11/2026",
    status: "Confirmado",
    cor: "#21B77D",
  },
  {
    id: 5,
    nome: "Aniversário João Lucas",
    tipo: "Aniversário",
    cliente: "João Lucas",
    local: "Buffet Alegria Vila Velha - ES",
    convidados: 120,
    horario: "19:00",
    data: "10/11/2026",
    status: "Em negociação",
    cor: "#E8A51C",
  },
];

const diasCalendario = [
  { dia: 27, mes: "set", atual: false },
  { dia: 28, mes: "set", atual: false },
  { dia: 29, mes: "set", atual: false },
  { dia: 30, mes: "set", atual: false },
  { dia: 1, atual: true },
  { dia: 2, atual: true },
  { dia: 3, atual: true },
  { dia: 4, atual: true },
  { dia: 5, atual: true },
  { dia: 6, atual: true },
  { dia: 7, atual: true },
  { dia: 8, atual: true },
  { dia: 9, atual: true },
  { dia: 10, atual: true },
  { dia: 11, atual: true },
  { dia: 12, atual: true },
  { dia: 13, atual: true },
  { dia: 14, atual: true },
  { dia: 15, atual: true },
  { dia: 16, atual: true },
  { dia: 17, atual: true },
  { dia: 18, atual: true },
  { dia: 19, atual: true },
  { dia: 20, atual: true },
  { dia: 21, atual: true },
  { dia: 22, atual: true },
  { dia: 23, atual: true },
  { dia: 24, atual: true },
  { dia: 25, atual: true },
  { dia: 26, atual: true },
  { dia: 27, atual: true },
  { dia: 28, atual: true },
  { dia: 29, atual: true },
  { dia: 30, atual: true },
  { dia: 31, atual: true },
  { dia: 1, mes: "nov", atual: false },
  { dia: 2, mes: "nov", atual: false },
  { dia: 3, mes: "nov", atual: false },
  { dia: 4, mes: "nov", atual: false },
  { dia: 5, mes: "nov", atual: false },
  { dia: 6, mes: "nov", atual: false },
  { dia: 7, mes: "nov", atual: false },
];

const eventosCalendario: Record<
  number,
  { nome: string; cor: string; tipo: string }[]
> = {
  5: [{ nome: "Empresa XPTO", cor: "#4DA5ED", tipo: "corporativo" }],
  10: [{ nome: "Aniversário Lucas", cor: "#7C3AED", tipo: "aniversario" }],
  12: [{ nome: "Formatura UVV", cor: "#21B77D", tipo: "formatura" }],
  18: [{ nome: "Casamento Ana + Pedro", cor: "#6954EA", tipo: "casamento" }],
  22: [{ nome: "15 anos Mariana", cor: "#E95099", tipo: "aniversario" }],
  25: [{ nome: "Evento Tech", cor: "#E8A51C", tipo: "corporativo" }],
};

function CardResumo({
  icon,
  titulo,
  valor,
  descricao,
  crescimento,
  cor,
  fundo,
}: {
  icon: React.ReactNode;
  titulo: string;
  valor: string;
  descricao: string;
  crescimento: string;
  cor: string;
  fundo: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-[#E7EAF3] bg-white p-3 shadow-sm sm:p-4">
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ color: cor, backgroundColor: fundo }}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-medium text-[#737B91]">
            {titulo}
          </p>

          <p className="mt-1 text-[25px] font-bold leading-none tracking-tight text-[#172039]">
            {valor}
          </p>

          <p className="mt-2 text-[10px] text-[#80889E]">
            <span className="font-semibold" style={{ color: cor }}>
              {crescimento}
            </span>{" "}
            {descricao}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const estilos: Record<string, string> = {
    Confirmado: "bg-[#DDF9EC] text-[#159B61]",
    "Em preparação": "bg-[#E3F2FF] text-[#2186D5]",
    "Em produção": "bg-[#FFF1CF] text-[#B77A00]",
    "Em negociação": "bg-[#FFF1CF] text-[#B77A00]",
  };

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-md px-2 py-1 text-[9px] font-semibold ${
        estilos[status] || "bg-[#F0F1F6] text-[#6F758A]"
      }`}
    >
      {status}
    </span>
  );
}

function Calendario({
  selecionado,
  setSelecionado,
}: {
  selecionado: number;
  setSelecionado: (dia: number) => void;
}) {
  const [visualizacao, setVisualizacao] = useState("Mês");

  return (
    <div className="rounded-xl border border-[#E7EAF3] bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-[#EDF0F6] p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E8F0] text-[#3D4560] hover:bg-[#F5F3FF]"
            >
              <ChevronLeft size={16} />
            </button>

            <h3 className="text-[14px] font-bold text-[#252D44]">
              Outubro 2026
            </h3>

            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E8F0] text-[#3D4560] hover:bg-[#F5F3FF]"
            >
              <ChevronRight size={16} />
            </button>

            <button
              type="button"
              className="hidden rounded-md bg-[#F0EAFE] px-3 py-2 text-[10px] font-semibold text-[#6838E6] sm:block"
            >
              Hoje
            </button>
          </div>

          <div className="flex h-8 rounded-md border border-[#E5E8F0] p-0.5">
            {["Mês", "Semana", "Dia"].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setVisualizacao(item)}
                className={`rounded px-3 text-[10px] font-medium ${
                  visualizacao === item
                    ? "bg-[#EEE8FF] font-bold text-[#6937E2]"
                    : "text-[#737B91]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="w-fit rounded-md bg-[#F0EAFE] px-3 py-2 text-[10px] font-semibold text-[#6838E6] sm:hidden"
        >
          Hoje
        </button>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[480px]">
          <div className="grid grid-cols-7 border-b border-[#EDF0F6]">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(
              (dia) => (
                <div
                  key={dia}
                  className="py-2 text-center text-[9px] font-semibold text-[#69738C]"
                >
                  {dia}
                </div>
              )
            )}
          </div>

          {visualizacao === "Mês" ? (
            <div className="grid grid-cols-7">
              {diasCalendario.map((dia, index) => {
                const eventos = dia.atual
                  ? eventosCalendario[dia.dia] || []
                  : [];

                const isSelecionado = dia.dia === selecionado;

                return (
                  <button
                    type="button"
                    key={index}
                    onClick={() => dia.atual && setSelecionado(dia.dia)}
                    className={`relative min-h-[54px] border-b border-r border-[#EDF0F6] p-1.5 text-left transition hover:bg-[#F8F6FF] sm:min-h-[66px] ${
                      !dia.atual ? "bg-[#FBFCFE]" : "bg-white"
                    } ${isSelecionado ? "bg-[#F0EBFF]" : ""}`}
                  >
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium ${
                        isSelecionado
                          ? "bg-[#6D38E8] text-white"
                          : dia.atual
                            ? "text-[#46516B]"
                            : "text-[#A9B0C0]"
                      }`}
                    >
                      {dia.dia}
                    </span>

                    <div className="mt-1 flex flex-col gap-1">
                      {eventos.map((evento) => (
                        <span
                          key={evento.nome}
                          className="block truncate rounded px-1 py-1 text-[8px] font-semibold"
                          style={{
                            color: evento.cor,
                            backgroundColor: `${evento.cor}18`,
                          }}
                        >
                          <span
                            className="mr-1 inline-block h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: evento.cor }}
                          />
                          {evento.nome}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex min-h-[220px] items-center justify-center text-sm text-[#8991A6]">
              Visualização de {visualizacao.toLowerCase()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetalhesEvento({
  evento,
  onClose,
}: {
  evento: Evento;
  onClose: () => void;
}) {
  return (
    <div className="rounded-xl border border-[#E7EAF3] bg-white p-3 shadow-sm sm:p-4">
      <div className="relative mb-3 overflow-hidden rounded-lg">
        <div className="flex h-[132px] items-center justify-center bg-gradient-to-br from-[#211036] via-[#55215E] to-[#211B45]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(224,84,196,0.28),transparent_40%)]" />
          <div className="relative px-4 text-center">
            <p className="font-serif text-[21px] italic text-[#F4B9E9]">
              Momentos
            </p>
            <p className="font-serif text-[17px] italic text-[#F4B9E9]">
              que ficam
            </p>
            <p className="font-serif text-[17px] italic text-[#F4B9E9]">
              para sempre
            </p>
            <p className="mt-2 text-[12px] font-bold tracking-wider text-white">
              Vive AI
            </p>
          </div>
        </div>

        <div className="absolute left-2 top-2 rounded-md bg-[#13BD79] px-2 py-1 text-[9px] font-semibold text-white">
          Confirmado
        </div>

        <button
          type="button"
          className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-[#7139E7] px-2 py-1.5 text-[9px] font-semibold text-white"
        >
          <Pencil size={11} />
          Editar
        </button>
      </div>

      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-[15px] font-bold text-[#20283E]">
            {evento.nome}
          </h3>
        </div>

        <div className="shrink-0 rounded-lg bg-[#F4F5FA] px-3 py-2 text-center">
          <p className="text-[15px] font-bold text-[#20283E]">18</p>
          <p className="text-[9px] font-bold uppercase text-[#69738C]">
            OUT
          </p>
        </div>
      </div>

      <div className="space-y-3 text-[10px]">
        <div className="flex gap-3">
          <Heart size={14} className="shrink-0 text-[#68738E]" />
          <span className="w-[80px] shrink-0 text-[#7B849B]">Cliente</span>
          <span className="font-semibold text-[#30384F]">
            Ana Paula
          </span>
        </div>

        <div className="flex gap-3">
          <Clock3 size={14} className="shrink-0 text-[#68738E]" />
          <span className="w-[80px] shrink-0 text-[#7B849B]">Horário</span>
          <span className="font-semibold text-[#30384F]">
            Sábado 19:00 às 00:00
          </span>
        </div>

        <div className="flex gap-3">
          <MapPin size={14} className="shrink-0 text-[#68738E]" />
          <span className="w-[80px] shrink-0 text-[#7B849B]">Local</span>
          <span className="font-semibold text-[#30384F]">
            Cerimonial X Vila Velha - ES
          </span>
        </div>

        <div className="flex gap-3">
          <Gift size={14} className="shrink-0 text-[#68738E]" />
          <span className="w-[80px] shrink-0 text-[#7B849B]">
            Tipo de evento
          </span>
          <span className="font-semibold text-[#30384F]">
            Casamento
          </span>
        </div>

        <div className="flex gap-3">
          <Users size={14} className="shrink-0 text-[#68738E]" />
          <span className="w-[80px] shrink-0 text-[#7B849B]">
            Convidados
          </span>
          <span className="font-semibold text-[#30384F]">
            180 pessoas
          </span>
        </div>

        <div className="flex gap-3">
          <Camera size={14} className="shrink-0 text-[#68738E]" />
          <span className="w-[80px] shrink-0 text-[#7B849B]">
            Equipamento
          </span>
          <span className="font-semibold text-[#30384F]">
            Totem Principal + Impressora Fujifilm ASK 300
          </span>
        </div>

        <div className="flex gap-3">
          <UserRound size={14} className="shrink-0 text-[#68738E]" />
          <span className="w-[80px] shrink-0 text-[#7B849B]">
            Operador responsável
          </span>
          <span className="font-semibold text-[#30384F]">
            Larissa Pereira
          </span>
        </div>

        <div className="flex gap-3">
          <Sparkles size={14} className="shrink-0 text-[#68738E]" />
          <span className="w-[80px] shrink-0 text-[#7B849B]">
            Experiências IA
          </span>
          <div className="flex flex-wrap gap-1">
            <span className="rounded bg-[#F0EAFE] px-2 py-1 text-[9px] font-semibold text-[#7139E7]">
              Avatar Cartoon
            </span>
            <span className="rounded bg-[#F0EAFE] px-2 py-1 text-[9px] font-semibold text-[#7139E7]">
              Cenário Mágico
            </span>
            <span className="rounded bg-[#F0EAFE] px-2 py-1 text-[9px] font-semibold text-[#7139E7]">
              Preto e Branco
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <FileText size={14} className="shrink-0 text-[#68738E]" />
          <span className="w-[80px] shrink-0 text-[#7B849B]">
            Moldura
          </span>
          <span className="font-semibold text-[#30384F]">
            Casamento Flora
          </span>
          <button
            type="button"
            className="text-[9px] font-semibold text-[#7139E7]"
          >
            Visualizar
          </button>
        </div>

        <div className="flex gap-3">
          <Pencil size={14} className="shrink-0 text-[#68738E]" />
          <span className="w-[80px] shrink-0 text-[#7B849B]">
            Observações
          </span>
          <span className="font-semibold leading-4 text-[#30384F]">
            Cliente solicitou personalização com as iniciais A + P.
            Chegar 2h antes para montagem.
          </span>
        </div>
      </div>

      <div className="mt-5 border-t border-[#EDF0F6] pt-4">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-[13px] font-bold text-[#20283E]">
            Etapas do evento
          </h4>

          <span className="text-[12px] font-bold text-[#6937E2]">
            100%
          </span>
        </div>

        <div className="relative mb-4">
          <div className="absolute left-[10px] right-[10px] top-3 h-1 rounded-full bg-[#DDE1EC]" />
          <div className="absolute left-[10px] top-3 h-1 w-[70%] rounded-full bg-[#20B77D]" />

          <div className="relative flex justify-between">
            {[
              { label: "Orçamento", ativo: true },
              { label: "Confirmado", ativo: true },
              { label: "Em preparação", ativo: true },
              { label: "Em produção", ativo: true },
              { label: "Concluído", ativo: false },
            ].map((etapa) => (
              <div
                key={etapa.label}
                className="flex w-[20%] flex-col items-center gap-2 text-center"
              >
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                    etapa.ativo
                      ? "border-[#20B77D] bg-[#20B77D] text-white"
                      : "border-[#D8DDE9] bg-white text-[#D8DDE9]"
                  }`}
                >
                  {etapa.ativo ? <Check size={13} /> : <Circle size={12} />}
                </div>

                <span className="text-[8px] font-medium leading-3 text-[#56617B]">
                  {etapa.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="flex h-9 items-center justify-center gap-2 rounded-md bg-[#6B32E8] px-3 text-[10px] font-semibold text-white hover:bg-[#5923CE]"
          >
            <Camera size={13} />
            Registrar fotos
          </button>

          <button
            type="button"
            className="flex h-9 items-center justify-center gap-2 rounded-md border border-[#E3E6EF] px-3 text-[10px] font-semibold text-[#59627B] hover:bg-[#F8F7FD]"
          >
            <Pencil size={13} />
            Editar evento
          </button>

          <button
            type="button"
            className="flex h-9 items-center justify-center gap-2 rounded-md border border-[#E3E6EF] px-3 text-[10px] font-semibold text-[#59627B] hover:bg-[#F8F7FD]"
          >
            <Copy size={13} />
            Duplicar
          </button>

          <button
            type="button"
            className="flex h-9 items-center justify-center gap-2 rounded-md border border-[#E3E6EF] px-3 text-[10px] font-semibold text-[#59627B] hover:bg-[#F8F7FD]"
          >
            Mais ações
            <Down size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

function TabelaEventos({ eventos }: { eventos: Evento[] }) {
  return (
    <div className="rounded-xl border border-[#E7EAF3] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#EDF0F6] px-4 py-3">
        <h3 className="text-[13px] font-bold text-[#20283E]">
          Próximos eventos
        </h3>

        <button
          type="button"
          className="text-[10px] font-semibold text-[#7139E7] hover:underline"
        >
          Ver todos
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px] border-collapse">
          <thead>
            <tr className="border-b border-[#EDF0F6] text-left text-[9px] font-semibold text-[#778199]">
              <th className="px-3 py-2">Data</th>
              <th className="px-3 py-2">Horário</th>
              <th className="px-3 py-2">Evento</th>
              <th className="px-3 py-2">Cliente</th>
              <th className="px-3 py-2">Local</th>
              <th className="px-3 py-2">Convidados</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Ações</th>
            </tr>
          </thead>

          <tbody>
            {eventos.map((evento) => {
              const [dia, mes, ano] = evento.data.split("/");

              return (
                <tr
                  key={evento.id}
                  className="border-b border-[#F0F2F7] text-[10px] last:border-0 hover:bg-[#FCFBFF]"
                >
                  <td className="px-3 py-2">
                    <div className="flex h-9 w-9 flex-col items-center justify-center rounded-md bg-[#F3F4F9]">
                      <span className="text-[13px] font-bold leading-4 text-[#263049]">
                        {dia}
                      </span>
                      <span className="text-[8px] font-semibold uppercase text-[#7D879C]">
                        {mes === "10"
                          ? "OUT"
                          : mes === "11"
                            ? "NOV"
                            : mes}
                      </span>
                    </div>
                  </td>

                  <td className="px-3 py-2 text-[#65708A]">
                    {evento.horario}
                  </td>

                  <td className="px-3 py-2">
                    <p className="font-bold text-[#31394F]">
                      {evento.tipo}
                    </p>
                    <p className="mt-0.5 text-[9px] text-[#7F899F]">
                      {evento.nome.replace(evento.tipo, "").trim()}
                    </p>
                  </td>

                  <td className="px-3 py-2 font-medium text-[#4E5872]">
                    {evento.cliente}
                  </td>

                  <td className="max-w-[120px] px-3 py-2 text-[#65708A]">
                    {evento.local}
                  </td>

                  <td className="px-3 py-2 text-[#65708A]">
                    {evento.convidados}
                  </td>

                  <td className="px-3 py-2">
                    <StatusBadge status={evento.status} />
                  </td>

                  <td className="px-3 py-2">
                    <button
                      type="button"
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E8F0] text-[#7D879C] hover:bg-[#F2F0FF]"
                    >
                      <MoreHorizontal size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Eventos() {
  const [aba, setAba] = useState("Calendário");
  const [busca, setBusca] = useState("");
  const [selecionado, setSelecionado] = useState(18);
  const [mostrarNovo, setMostrarNovo] = useState(false);
  const [eventos, setEventos] = useState(eventosIniciais);

  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("Casamento");
  const [cliente, setCliente] = useState("");
  const [data, setData] = useState("");
  const [horario, setHorario] = useState("");
  const [local, setLocal] = useState("");
  const [convidados, setConvidados] = useState("");

  const eventosFiltrados = eventos.filter((evento) =>
    `${evento.nome} ${evento.cliente} ${evento.local}`
      .toLowerCase()
      .includes(busca.toLowerCase())
  );

  const criarEvento = () => {
    if (!nome.trim() || !cliente.trim() || !data) {
      alert("Preencha nome, cliente e data.");
      return;
    }

    const partes = data.split("-");

    const novoEvento: Evento = {
      id: Date.now(),
      nome,
      tipo,
      cliente,
      local: local || "A definir",
      convidados: Number(convidados) || 0,
      horario: horario || "A definir",
      data: `${partes[2]}/${partes[1]}/${partes[0]}`,
      status: "Em preparação",
      cor: "#6954EA",
    };

    setEventos((atual) => [...atual, novoEvento]);

    setNome("");
    setCliente("");
    setData("");
    setHorario("");
    setLocal("");
    setConvidados("");
    setMostrarNovo(false);
  };

  return (
    <Layout title="01. EVENTOS" currentPath="/eventos">
      <div className="min-h-screen bg-[#F8F9FC] text-[#20283E]">
        {/* CABEÇALHO */}
        <header className="border-b border-[#E7EAF3] bg-white px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0EAFE] text-[#7139E7]">
                <CalendarDays size={23} />
              </div>

              <div className="min-w-0">
                <h1 className="text-[23px] font-bold leading-7 tracking-tight text-[#222B43]">
                  Eventos
                </h1>

                <p className="mt-0.5 hidden text-[11px] text-[#7D879E] sm:block">
                  Gerencie seus eventos confirmados, acompanhe as próximas datas e organize toda a operação.
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-4">
              <div className="relative hidden w-[240px] lg:block">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8992A8]"
                />

                <input
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar evento, cliente ou local..."
                  className="h-10 w-full rounded-lg border border-[#DDE2EE] bg-white pl-9 pr-3 text-[11px] text-[#424B63] outline-none placeholder:text-[#9AA2B5] focus:border-[#8B5CF6]"
                />
              </div>

              <button
                type="button"
                title="Notificações"
                className="relative rounded-lg p-2 text-[#30394F] hover:bg-[#F4F2FC]"
              >
                <Bell size={19} />
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#7139E7]" />
              </button>

              <div className="hidden h-8 w-px bg-[#E7EAF3] sm:block" />

              <button
                type="button"
                className="flex items-center gap-2 rounded-lg p-1 hover:bg-[#F5F3FC]"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#6D36DF] text-sm font-medium text-white">
                  L
                </div>

                <div className="hidden text-left sm:block">
                  <p className="text-[11px] font-bold leading-4 text-[#30394F]">
                    Larissa
                  </p>

                  <p className="text-[9px] text-[#7D879E]">
                    Administradora
                  </p>
                </div>

                <ChevronDown size={13} className="text-[#6D7188]" />
              </button>
            </div>
          </div>
        </header>

        <main className="px-4 py-4 sm:px-6 lg:px-8">
          {/* BUSCA MOBILE */}
          <div className="relative mb-4 lg:hidden">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8992A8]"
            />

            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar evento, cliente ou local..."
              className="h-10 w-full rounded-lg border border-[#DDE2EE] bg-white pl-9 pr-3 text-xs outline-none focus:border-[#8B5CF6]"
            />
          </div>

          {/* CARDS */}
          <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
            <CardResumo
              icon={<CalendarDays size={21} />}
              titulo="Eventos este mês"
              valor="12"
              crescimento="↑ 33%"
              descricao="em relação ao mês anterior"
              cor="#6D36DF"
              fundo="#F0EAFE"
            />

            <CardResumo
              icon={<Clock3 size={21} />}
              titulo="Próximos eventos"
              valor="3"
              crescimento="↑"
              descricao="esta semana"
              cor="#E8A51C"
              fundo="#FFF4D9"
            />

            <CardResumo
              icon={<CheckCircle2 size={21} />}
              titulo="Eventos realizados"
              valor="25"
              crescimento="↑ 18%"
              descricao="no ano"
              cor="#21B77D"
              fundo="#E5FAF1"
            />

            <CardResumo
              icon={<Users size={21} />}
              titulo="Pessoas fotografadas"
              valor="2.850"
              crescimento=""
              descricao="neste ano"
              cor="#7139E7"
              fundo="#F0EAFE"
            />
          </div>

          {/* BOTÃO NOVO EVENTO */}
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={() => setMostrarNovo(true)}
              className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#6B32E8] px-5 text-[12px] font-semibold text-white shadow-sm transition hover:bg-[#5923CE]"
            >
              <Plus size={17} />
              Novo evento
            </button>
          </div>

          {/* ABAS */}
          <div className="mb-4 flex items-center gap-5 overflow-x-auto border-b border-[#E7EAF3]">
            {["Calendário", "Lista de eventos", "Agenda da equipe"].map(
              (item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setAba(item)}
                  className={`relative whitespace-nowrap pb-3 text-[11px] font-medium ${
                    aba === item
                      ? "font-bold text-[#6937E2]"
                      : "text-[#64708A]"
                  }`}
                >
                  {item}

                  {aba === item && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#7139E7]" />
                  )}
                </button>
              )
            )}
          </div>

          {aba === "Calendário" && (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.55fr_1fr]">
              <div className="min-w-0">
                <Calendario
                  selecionado={selecionado}
                  setSelecionado={setSelecionado}
                />

                <div className="mt-4">
                  <TabelaEventos eventos={eventosFiltrados} />
                </div>
              </div>

              <div className="min-w-0">
                <DetalhesEvento
                  evento={eventos[0]}
                  onClose={() => setSelecionado(0)}
                />
              </div>
            </div>
          )}

          {aba === "Lista de eventos" && (
            <TabelaEventos eventos={eventosFiltrados} />
          )}

          {aba === "Agenda da equipe" && (
            <div className="rounded-xl border border-[#E7EAF3] bg-white p-8 text-center shadow-sm">
              <Users
                size={40}
                className="mx-auto mb-3 text-[#7139E7]"
              />

              <h3 className="text-lg font-bold text-[#20283E]">
                Agenda da equipe
              </h3>

              <p className="mt-2 text-sm text-[#7D879E]">
                Organize os operadores e responsáveis pelos eventos.
              </p>
            </div>
          )}
        </main>

        {/* MODAL NOVO EVENTO */}
        {mostrarNovo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#202038]/40 px-4 py-6 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-[480px] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#292D42]">
                    Novo evento
                  </h2>

                  <p className="mt-1 text-xs text-[#8A90A5]">
                    Cadastre um novo evento.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setMostrarNovo(false)}
                  className="rounded-lg p-2 text-[#8A90A5] hover:bg-[#F5F4FA]"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#4A4E63]">
                    Nome do evento
                  </label>

                  <input
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex.: Casamento Ana + Pedro"
                    className="h-10 w-full rounded-lg border border-[#E1E3ED] px-3 text-sm outline-none focus:border-[#8B5CF6]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#4A4E63]">
                    Cliente
                  </label>

                  <input
                    value={cliente}
                    onChange={(e) => setCliente(e.target.value)}
                    placeholder="Nome do cliente"
                    className="h-10 w-full rounded-lg border border-[#E1E3ED] px-3 text-sm outline-none focus:border-[#8B5CF6]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#4A4E63]">
                    Tipo de evento
                  </label>

                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    className="h-10 w-full rounded-lg border border-[#E1E3ED] bg-white px-3 text-sm outline-none focus:border-[#8B5CF6]"
                  >
                    <option>Casamento</option>
                    <option>Aniversário</option>
                    <option>15 anos</option>
                    <option>Formatura</option>
                    <option>Corporativo</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[#4A4E63]">
                      Data
                    </label>

                    <input
                      type="date"
                      value={data}
                      onChange={(e) => setData(e.target.value)}
                      className="h-10 w-full rounded-lg border border-[#E1E3ED] px-3 text-sm outline-none focus:border-[#8B5CF6]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[#4A4E63]">
                      Horário
                    </label>

                    <input
                      type="time"
                      value={horario}
                      onChange={(e) => setHorario(e.target.value)}
                      className="h-10 w-full rounded-lg border border-[#E1E3ED] px-3 text-sm outline-none focus:border-[#8B5CF6]"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#4A4E63]">
                    Local
                  </label>

                  <input
                    value={local}
                    onChange={(e) => setLocal(e.target.value)}
                    placeholder="Ex.: Cerimonial X"
                    className="h-10 w-full rounded-lg border border-[#E1E3ED] px-3 text-sm outline-none focus:border-[#8B5CF6]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#4A4E63]">
                    Número de convidados
                  </label>

                  <input
                    type="number"
                    value={convidados}
                    onChange={(e) => setConvidados(e.target.value)}
                    placeholder="180"
                    className="h-10 w-full rounded-lg border border-[#E1E3ED] px-3 text-sm outline-none focus:border-[#8B5CF6]"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setMostrarNovo(false)}
                  className="h-10 flex-1 rounded-lg border border-[#E1E3ED] text-sm font-semibold text-[#62687E] hover:bg-[#F8F8FC]"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={criarEvento}
                  className="h-10 flex-1 rounded-lg bg-[#6B32E8] text-sm font-semibold text-white hover:bg-[#5923CE]"
                >
                  Criar evento
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}