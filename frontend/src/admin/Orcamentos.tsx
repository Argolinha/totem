
import { useState } from "react";
import type { ReactNode } from "react";
import {
  FileText,
  Search,
  Bell,
  ChevronDown,
  Plus,
  Clock3,
  CheckCircle2,
  XCircle,
  CalendarDays,
  Users,
  MoreHorizontal,
  List,
  Columns3,
} from "lucide-react";

import Layout from "./layout";

type Orcamento = {
  id: number;
  nome: string;
  tipo: string;
  valor: string;
  data: string;
  convidados: string;
  cor: string;
  inicial: string;
};

type Coluna = {
  id: string;
  titulo: string;
  quantidade: number;
  valorTotal: string;
  cor: string;
  fundo: string;
  icon: ReactNode;
  orcamentos: Orcamento[];
};

const colunasIniciais: Coluna[] = [
  {
    id: "novos",
    titulo: "Novos",
    quantidade: 5,
    valorTotal: "R$ 9.800",
    cor: "#7C3AED",
    fundo: "#F5F0FF",
    icon: <FileText size={18} />,
    orcamentos: [
      {
        id: 1,
        nome: "João Lucas",
        tipo: "Aniversário",
        valor: "R$ 1.800",
        data: "10/11/2026",
        convidados: "120 convidados",
        cor: "#B9A7F5",
        inicial: "J",
      },
      {
        id: 2,
        nome: "Camila Reis",
        tipo: "Aniversário",
        valor: "R$ 2.200",
        data: "20/11/2026",
        convidados: "100 convidados",
        cor: "#F45D91",
        inicial: "C",
      },
      {
        id: 3,
        nome: "Lucas Almeida",
        tipo: "Formatura",
        valor: "R$ 2.800",
        data: "18/12/2026",
        convidados: "200 convidados",
        cor: "#4799ED",
        inicial: "L",
      },
      {
        id: 4,
        nome: "Ana Beatriz",
        tipo: "15 anos",
        valor: "R$ 2.800",
        data: "25/11/2026",
        convidados: "150 convidados",
        cor: "#974DE8",
        inicial: "A",
      },
      {
        id: 5,
        nome: "Empresa Prime",
        tipo: "Corporativo",
        valor: "R$ 3.500",
        data: "30/11/2026",
        convidados: "250 convidados",
        cor: "#41BC91",
        inicial: "E",
      },
    ],
  },
  {
    id: "enviados",
    titulo: "Orçamento enviado",
    quantidade: 7,
    valorTotal: "R$ 18.500",
    cor: "#3B82F6",
    fundo: "#EEF5FF",
    icon: <Clock3 size={18} />,
    orcamentos: [
      {
        id: 6,
        nome: "Ana Paula",
        tipo: "Casamento",
        valor: "R$ 2.500",
        data: "18/10/2026",
        convidados: "180 convidados",
        cor: "#EF8C96",
        inicial: "A",
      },
      {
        id: 7,
        nome: "Mariana Silva",
        tipo: "15 anos",
        valor: "R$ 2.800",
        data: "22/11/2026",
        convidados: "150 convidados",
        cor: "#A98AF4",
        inicial: "M",
      },
      {
        id: 8,
        nome: "Cerimonial Belle",
        tipo: "Casamento",
        valor: "R$ 3.200",
        data: "15/03/2027",
        convidados: "190 convidados",
        cor: "#438EEA",
        inicial: "C",
      },
      {
        id: 9,
        nome: "Juliana Mendes",
        tipo: "Aniversário",
        valor: "R$ 2.200",
        data: "28/11/2026",
        convidados: "120 convidados",
        cor: "#F45DAB",
        inicial: "J",
      },
      {
        id: 10,
        nome: "Restaurante Five",
        tipo: "Corporativo",
        valor: "R$ 4.000",
        data: "05/12/2026",
        convidados: "300 convidados",
        cor: "#65C89C",
        inicial: "R",
      },
    ],
  },
  {
    id: "negociacao",
    titulo: "Em negociação",
    quantidade: 8,
    valorTotal: "R$ 8.200",
    cor: "#E8A514",
    fundo: "#FFF9E8",
    icon: <Clock3 size={18} />,
    orcamentos: [
      {
        id: 11,
        nome: "Empresa XPTO",
        tipo: "Corporativo",
        valor: "R$ 4.000",
        data: "05/12/2026",
        convidados: "250 convidados",
        cor: "#65A9EA",
        inicial: "E",
      },
      {
        id: 12,
        nome: "Buffet Z",
        tipo: "Corporativo",
        valor: "R$ 2.000",
        data: "08/11/2026",
        convidados: "200 convidados",
        cor: "#F45D91",
        inicial: "B",
      },
      {
        id: 13,
        nome: "Formatura UVV",
        tipo: "Formatura",
        valor: "R$ 3.500",
        data: "12/12/2026",
        convidados: "300 convidados",
        cor: "#8B5CF6",
        inicial: "F",
      },
      {
        id: 14,
        nome: "Evento Tech",
        tipo: "Corporativo",
        valor: "R$ 2.900",
        data: "18/10/2026",
        convidados: "150 convidados",
        cor: "#65C89C",
        inicial: "E",
      },
    ],
  },
  {
    id: "fechados",
    titulo: "Fechados",
    quantidade: 11,
    valorTotal: "R$ 14.900",
    cor: "#21B77D",
    fundo: "#EDFFF7",
    icon: <CheckCircle2 size={18} />,
    orcamentos: [
      {
        id: 15,
        nome: "Casamento Ana + Pedro",
        tipo: "Casamento",
        valor: "R$ 2.500",
        data: "18/10/2026",
        convidados: "180 convidados",
        cor: "#9C73E9",
        inicial: "A",
      },
      {
        id: 16,
        nome: "Juliana e André",
        tipo: "Casamento",
        valor: "R$ 3.000",
        data: "30/11/2026",
        convidados: "200 convidados",
        cor: "#F24A9D",
        inicial: "J",
      },
      {
        id: 17,
        nome: "Empresa Viva",
        tipo: "Corporativo",
        valor: "R$ 4.000",
        data: "05/12/2026",
        convidados: "250 convidados",
        cor: "#4B9BEA",
        inicial: "E",
      },
      {
        id: 18,
        nome: "Larissa e Pedro",
        tipo: "Casamento",
        valor: "R$ 3.500",
        data: "14/02/2027",
        convidados: "200 convidados",
        cor: "#8B5CF6",
        inicial: "L",
      },
      {
        id: 19,
        nome: "Aniversário Maria",
        tipo: "Aniversário",
        valor: "R$ 1.900",
        data: "10/11/2026",
        convidados: "120 convidados",
        cor: "#F45D91",
        inicial: "M",
      },
    ],
  },
];

function CardResumo({
  icon,
  titulo,
  valor,
  descricao,
  cor,
  fundo,
  crescimento,
}: {
  icon: ReactNode;
  titulo: string;
  valor: string;
  descricao: string;
  cor: string;
  fundo: string;
  crescimento: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-[#E9EAF2] bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          style={{ color: cor, backgroundColor: fundo }}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-medium text-[#7B8197]">
            {titulo}
          </p>

          <p className="mt-1 text-[25px] font-bold leading-none tracking-tight text-[#20243A]">
            {valor}
          </p>

          <p className="mt-2 text-[10px] text-[#8A90A5]">
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

function ItemOrcamento({
  item,
  onDelete,
}: {
  item: Orcamento;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="group rounded-lg border border-[#E8EAF2] bg-white px-3 py-3 shadow-sm transition hover:border-[#D3D4E5]">
      <div className="flex items-start gap-2">
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-medium text-white"
          style={{ backgroundColor: item.cor }}
        >
          {item.inicial}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-1">
            <p className="truncate text-[11px] font-bold leading-[15px] text-[#34384B]">
              {item.nome}
            </p>

            <p className="shrink-0 text-[10px] font-bold text-[#36394B]">
              {item.valor}
            </p>
          </div>

          <p className="mt-[1px] text-[10px] text-[#8A90A5]">
            {item.tipo}
          </p>

          <div className="mt-2 flex items-center gap-1 text-[9px] text-[#8990A5]">
            <CalendarDays size={10} />
            <span>{item.data}</span>
          </div>

          <div className="mt-1 flex items-center justify-between gap-1 text-[9px] text-[#8990A5]">
            <div className="flex min-w-0 items-center gap-1">
              <Users size={10} />
              <span className="truncate">{item.convidados}</span>
            </div>

            <button
              type="button"
              onClick={() => onDelete(item.id)}
              title="Excluir orçamento"
              className="rounded p-1 text-[#A1A5B5] hover:bg-[#F3F3F8]"
            >
              <MoreHorizontal size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ColunaFunil({
  coluna,
  onDelete,
}: {
  coluna: Coluna;
  onDelete: (id: number) => void;
}) {
  return (
    <div
      className="flex min-w-0 flex-col rounded-xl p-2.5"
      style={{ backgroundColor: coluna.fundo }}
    >
      <div className="mb-3 flex items-center gap-2 px-1">
        <div style={{ color: coluna.cor }}>{coluna.icon}</div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-bold text-[#34384B]">
            {coluna.titulo}
          </p>

          <p className="text-[10px] font-semibold text-[#858B9F]">
            {coluna.valorTotal}
          </p>
        </div>

        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-[10px] font-bold text-[#596078]">
          {coluna.quantidade}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {coluna.orcamentos.map((item) => (
          <ItemOrcamento
            key={item.id}
            item={item}
            onDelete={onDelete}
          />
        ))}
      </div>

      {coluna.id === "novos" && (
        <button
          type="button"
          className="mt-3 px-1 text-left text-[10px] font-semibold text-[#6B728D] hover:text-[#6937DF]"
        >
          + Ver mais 2 orçamentos
        </button>
      )}

      {coluna.id === "enviados" && (
        <button
          type="button"
          className="mt-3 px-1 text-left text-[10px] font-semibold text-[#6B728D] hover:text-[#6937DF]"
        >
          + Ver mais 2 orçamentos
        </button>
      )}

      {coluna.id === "fechados" && (
        <button
          type="button"
          className="mt-3 px-1 text-left text-[10px] font-semibold text-[#6B728D] hover:text-[#6937DF]"
        >
          + Ver mais 6 orçamentos
        </button>
      )}
    </div>
  );
}

export default function Orcamentos() {
  const [colunas, setColunas] = useState<Coluna[]>(colunasIniciais);
  const [busca, setBusca] = useState("");
  const [modoVisualizacao, setModoVisualizacao] = useState<
    "colunas" | "lista"
  >("colunas");
  const [ordenacao, setOrdenacao] = useState("recente");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [novoNome, setNovoNome] = useState("");
  const [novoTipo, setNovoTipo] = useState("Casamento");
  const [novoValor, setNovoValor] = useState("");
  const [novoData, setNovoData] = useState("");
  const [novoConvidados, setNovoConvidados] = useState("");

  const excluirOrcamento = (id: number) => {
    setColunas((atual) =>
      atual.map((coluna) => ({
        ...coluna,
        orcamentos: coluna.orcamentos.filter(
          (item) => item.id !== id
        ),
      }))
    );
  };

  const criarOrcamento = () => {
    if (!novoNome.trim() || !novoValor.trim()) {
      alert("Preencha o nome e o valor do orçamento.");
      return;
    }

    const novo: Orcamento = {
      id: Date.now(),
      nome: novoNome,
      tipo: novoTipo,
      valor: novoValor.startsWith("R$")
        ? novoValor
        : `R$ ${novoValor}`,
      data: novoData || "A definir",
      convidados: novoConvidados
        ? `${novoConvidados} convidados`
        : "A definir",
      cor: "#8B5CF6",
      inicial: novoNome.trim().charAt(0).toUpperCase(),
    };

    setColunas((atual) =>
      atual.map((coluna) =>
        coluna.id === "novos"
          ? {
              ...coluna,
              quantidade: coluna.quantidade + 1,
              orcamentos: [novo, ...coluna.orcamentos],
            }
          : coluna
      )
    );

    setNovoNome("");
    setNovoValor("");
    setNovoData("");
    setNovoConvidados("");
    setMostrarFormulario(false);
  };

  const colunasFiltradas = colunas.map((coluna) => ({
    ...coluna,
    orcamentos: coluna.orcamentos
      .filter((item) =>
        `${item.nome} ${item.tipo} ${item.valor}`
          .toLowerCase()
          .includes(busca.toLowerCase())
      )
      .sort((a, b) => {
        if (ordenacao === "nome") {
          return a.nome.localeCompare(b.nome);
        }

        if (ordenacao === "valor") {
          const valorA = Number(
            a.valor.replace(/[^\d,]/g, "").replace(",", ".")
          );

          const valorB = Number(
            b.valor.replace(/[^\d,]/g, "").replace(",", ".")
          );

          return valorB - valorA;
        }

        return 0;
      }),
  }));

  return (
    <Layout
      title="02. ORÇAMENTOS"
      currentPath="/orcamentos"
    >
      <div className="min-h-screen bg-[#F8F9FC] text-[#292D42]">
        {/* CABEÇALHO */}
        <header className="border-b border-[#E9EAF2] bg-white px-5 py-4 sm:px-7 lg:px-8">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0EAFE] text-[#7139E7]">
                <FileText size={23} />
              </div>

              <div className="min-w-0">
                <h1 className="text-[23px] font-bold leading-7 tracking-tight text-[#22263B]">
                  Orçamentos
                </h1>

                <p className="mt-0.5 hidden text-[11px] text-[#8A90A5] sm:block">
                  Gerencie seus orçamentos, acompanhe o funil comercial e converta em eventos.
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <div className="relative hidden w-[250px] lg:block">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8990A5]"
                />

                <input
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar por cliente, evento ou número do orçamento..."
                  className="h-9 w-full rounded-lg border border-[#E4E6F0] bg-[#FBFBFD] pl-9 pr-3 text-[10px] text-[#45495F] outline-none placeholder:text-[#A3A8B8] focus:border-[#8B5CF6]"
                />
              </div>

              <button
                type="button"
                title="Notificações"
                className="relative rounded-lg p-2 text-[#35394D] hover:bg-[#F4F3FA]"
              >
                <Bell size={19} />
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#7540E7]" />
              </button>

              <div className="hidden h-7 w-px bg-[#E9EAF2] sm:block" />

              <button
                type="button"
                className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-[#F6F5FB]"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#6D36DF] text-sm font-medium text-white">
                  L
                </div>

                <div className="hidden text-left sm:block">
                  <p className="text-[11px] font-bold leading-4 text-[#303449]">
                    Larissa
                  </p>

                  <p className="text-[9px] text-[#8B91A5]">
                    Administradora
                  </p>
                </div>

                <ChevronDown size={13} className="text-[#6D7188]" />
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] px-5 py-5 sm:px-7 lg:px-8">
          {/* BUSCA NO MOBILE */}
          <div className="relative mb-4 lg:hidden">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8990A5]"
            />

            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por cliente, evento ou número do orçamento..."
              className="h-10 w-full rounded-lg border border-[#E4E6F0] bg-white pl-9 pr-3 text-xs outline-none focus:border-[#8B5CF6]"
            />
          </div>

          {/* RESUMO */}
          <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-stretch">
            <div className="grid min-w-0 flex-1 grid-cols-2 gap-3 lg:grid-cols-4">
              <CardResumo
                icon={<FileText size={20} />}
                titulo="Orçamentos no total"
                valor="28"
                descricao="este mês"
                crescimento="↑ +12%"
                cor="#7139E7"
                fundo="#F0EAFE"
              />

              <CardResumo
                icon={<Clock3 size={20} />}
                titulo="Em negociação"
                valor="7"
                descricao="em relação ao mês anterior"
                crescimento="↑ +3%"
                cor="#E9A51B"
                fundo="#FFF5DC"
              />

              <CardResumo
                icon={<CheckCircle2 size={20} />}
                titulo="Fechados"
                valor="11"
                descricao="este mês"
                crescimento="↑ +25%"
                cor="#21B77D"
                fundo="#E5FAF1"
              />

              <CardResumo
                icon={<XCircle size={20} />}
                titulo="Perdidos"
                valor="5"
                descricao="em relação ao mês anterior"
                crescimento="↑ +8%"
                cor="#EF5B67"
                fundo="#FFF0F1"
              />
            </div>

            <button
              type="button"
              onClick={() => setMostrarFormulario(true)}
              className="flex h-[70px] shrink-0 items-center justify-center gap-2 rounded-xl bg-[#6B32E8] px-6 text-sm font-semibold text-white shadow-md transition hover:bg-[#5923CE] xl:w-[140px]"
            >
              <Plus size={17} />
              Novo orçamento
            </button>
          </div>

          {/* FUNIL */}
          <section className="rounded-xl border border-[#E8EAF1] bg-white p-3 shadow-sm sm:p-4">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-[14px] font-bold text-[#303449]">
                  Funil de orçamentos
                </h2>

                <p className="mt-1 text-[10px] text-[#8A90A5]">
                  Arraste os orçamentos entre as etapas para atualizar o status.
                </p>
              </div>

              <div className="flex items-center justify-between gap-2 sm:justify-end">
                <select
                  value={ordenacao}
                  onChange={(e) => setOrdenacao(e.target.value)}
                  className="h-8 rounded-md border border-[#E5E7EF] bg-white px-2 text-[10px] text-[#646B82] outline-none focus:border-[#8B5CF6]"
                >
                  <option value="recente">
                    Ordenar por: Data mais recente
                  </option>
                  <option value="nome">
                    Ordenar por: Nome
                  </option>
                  <option value="valor">
                    Ordenar por: Maior valor
                  </option>
                </select>

                <div className="flex h-8 items-center rounded-md border border-[#E5E7EF] bg-white p-0.5">
                  <button
                    type="button"
                    onClick={() => setModoVisualizacao("colunas")}
                    title="Visualização em colunas"
                    className={`flex h-7 w-7 items-center justify-center rounded ${
                      modoVisualizacao === "colunas"
                        ? "bg-[#EEE8FF] text-[#7139E7]"
                        : "text-[#8B91A5]"
                    }`}
                  >
                    <Columns3 size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setModoVisualizacao("lista")}
                    title="Visualização em lista"
                    className={`flex h-7 w-7 items-center justify-center rounded ${
                      modoVisualizacao === "lista"
                        ? "bg-[#EEE8FF] text-[#7139E7]"
                        : "text-[#8B91A5]"
                    }`}
                  >
                    <List size={15} />
                  </button>
                </div>
              </div>
            </div>

            {modoVisualizacao === "colunas" ? (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                {colunasFiltradas.map((coluna) => (
                  <ColunaFunil
                    key={coluna.id}
                    coluna={coluna}
                    onDelete={excluirOrcamento}
                  />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#E9EAF2] text-[10px] text-[#8A90A5]">
                      <th className="px-3 py-3 font-semibold">Cliente</th>
                      <th className="px-3 py-3 font-semibold">Tipo</th>
                      <th className="px-3 py-3 font-semibold">Valor</th>
                      <th className="px-3 py-3 font-semibold">Data</th>
                      <th className="px-3 py-3 font-semibold">Status</th>
                      <th className="px-3 py-3 font-semibold"></th>
                    </tr>
                  </thead>

                  <tbody>
                    {colunasFiltradas.flatMap((coluna) =>
                      coluna.orcamentos.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-[#F0F1F6] text-[11px] last:border-0"
                        >
                          <td className="px-3 py-3 font-semibold text-[#34384B]">
                            {item.nome}
                          </td>

                          <td className="px-3 py-3 text-[#8A90A5]">
                            {item.tipo}
                          </td>

                          <td className="px-3 py-3 font-bold text-[#34384B]">
                            {item.valor}
                          </td>

                          <td className="px-3 py-3 text-[#8A90A5]">
                            {item.data}
                          </td>

                          <td className="px-3 py-3">
                            <span
                              className="rounded-full px-2 py-1 text-[10px] font-semibold"
                              style={{
                                color: coluna.cor,
                                backgroundColor: coluna.fundo,
                              }}
                            >
                              {coluna.titulo}
                            </span>
                          </td>

                          <td className="px-3 py-3">
                            <button
                              type="button"
                              onClick={() => excluirOrcamento(item.id)}
                              className="text-[#9CA2B4] hover:text-[#EF5B67]"
                            >
                              <MoreHorizontal size={15} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>

        {/* MODAL NOVO ORÇAMENTO */}
        {mostrarFormulario && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#202038]/40 px-4 py-6 backdrop-blur-sm">
            <div className="w-full max-w-[430px] rounded-2xl bg-white p-6 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#292D42]">
                    Novo orçamento
                  </h2>

                  <p className="mt-1 text-xs text-[#8A90A5]">
                    Preencha os dados do novo orçamento.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setMostrarFormulario(false)}
                  className="rounded-lg p-2 text-[#8A90A5] hover:bg-[#F5F4FA]"
                >
                  <XCircle size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#4A4E63]">
                    Nome do cliente
                  </label>

                  <input
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                    placeholder="Ex.: João Lucas"
                    className="h-10 w-full rounded-lg border border-[#E1E3ED] px-3 text-sm outline-none focus:border-[#8B5CF6]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#4A4E63]">
                    Tipo de evento
                  </label>

                  <select
                    value={novoTipo}
                    onChange={(e) => setNovoTipo(e.target.value)}
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
                      Valor
                    </label>

                    <input
                      value={novoValor}
                      onChange={(e) => setNovoValor(e.target.value)}
                      placeholder="2.500"
                      className="h-10 w-full rounded-lg border border-[#E1E3ED] px-3 text-sm outline-none focus:border-[#8B5CF6]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[#4A4E63]">
                      Data
                    </label>

                    <input
                      type="date"
                      value={novoData}
                      onChange={(e) => setNovoData(e.target.value)}
                      className="h-10 w-full rounded-lg border border-[#E1E3ED] px-3 text-sm outline-none focus:border-[#8B5CF6]"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#4A4E63]">
                    Número de convidados
                  </label>

                  <input
                    value={novoConvidados}
                    onChange={(e) => setNovoConvidados(e.target.value)}
                    placeholder="120"
                    className="h-10 w-full rounded-lg border border-[#E1E3ED] px-3 text-sm outline-none focus:border-[#8B5CF6]"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setMostrarFormulario(false)}
                  className="h-10 flex-1 rounded-lg border border-[#E1E3ED] text-sm font-semibold text-[#62687E] hover:bg-[#F8F8FC]"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={criarOrcamento}
                  className="h-10 flex-1 rounded-lg bg-[#6B32E8] text-sm font-semibold text-white hover:bg-[#5923CE]"
                >
                  Criar orçamento
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}