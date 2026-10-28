import React, { useMemo, useState } from "react";
import Layout from "./layout";
import {
  Sparkles,
  Plus,
  Search,
  Pencil,
  Trash2,
  Power,
  Wand2,
  Image as ImageIcon,
  CheckCircle,
} from "lucide-react";

interface Efeito {
  id: number;
  nome: string;
  descricao: string;
  categoria: string;
  status: "Ativo" | "Inativo";
  usos: number;
  imagem: string;
}

const efeitosIniciais: Efeito[] = [
  {
    id: 1,
    nome: "Avatar Cartoon",
    descricao: "Transforma a foto em um avatar com estilo cartoon.",
    categoria: "Avatar",
    status: "Ativo",
    usos: 45,
    imagem: "https://placehold.co/120x120/7C3AED/ffffff?text=AI",
  },
  {
    id: 2,
    nome: "Face Swap",
    descricao: "Troca o rosto da pessoa utilizando inteligência artificial.",
    categoria: "Rosto",
    status: "Ativo",
    usos: 20,
    imagem: "https://placehold.co/120x120/EC4899/ffffff?text=AI",
  },
  {
    id: 3,
    nome: "Cenário Mágico",
    descricao: "Remove o fundo e aplica um cenário criado por IA.",
    categoria: "Cenário",
    status: "Ativo",
    usos: 20,
    imagem: "https://placehold.co/120x120/10B981/ffffff?text=AI",
  },
  {
    id: 4,
    nome: "Retrato Vintage",
    descricao: "Aplica um visual retrô e cinematográfico à fotografia.",
    categoria: "Estilo",
    status: "Inativo",
    usos: 7,
    imagem: "https://placehold.co/120x120/9CA3AF/ffffff?text=AI",
  },
];

export default function Efeitos() {
  const [efeitos, setEfeitos] = useState<Efeito[]>(efeitosIniciais);
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("Todos");

  const categorias = ["Todos", "Avatar", "Rosto", "Cenário", "Estilo"];

  const efeitosFiltrados = useMemo(() => {
    return efeitos.filter((efeito) => {
      const correspondeBusca =
        efeito.nome.toLowerCase().includes(busca.toLowerCase()) ||
        efeito.descricao.toLowerCase().includes(busca.toLowerCase());

      const correspondeCategoria =
        categoria === "Todos" || efeito.categoria === categoria;

      return correspondeBusca && correspondeCategoria;
    });
  }, [efeitos, busca, categoria]);

  const alternarStatus = (id: number) => {
    setEfeitos((atual) =>
      atual.map((efeito) =>
        efeito.id === id
          ? {
              ...efeito,
              status: efeito.status === "Ativo" ? "Inativo" : "Ativo",
            }
          : efeito
      )
    );
  };

  const excluirEfeito = (id: number) => {
    const efeito = efeitos.find((item) => item.id === id);

    if (!efeito) return;

    const confirmar = window.confirm(
      `Deseja realmente excluir o efeito "${efeito.nome}"?`
    );

    if (confirmar) {
      setEfeitos((atual) => atual.filter((item) => item.id !== id));
    }
  };

  const adicionarEfeito = () => {
    window.alert(
      "A tela de cadastro de novo efeito será implementada na próxima etapa."
    );
  };

  const editarEfeito = (nome: string) => {
    window.alert(`Edição do efeito "${nome}" será implementada na próxima etapa.`);
  };

  const totalAtivos = efeitos.filter(
    (efeito) => efeito.status === "Ativo"
  ).length;

  const totalUsos = efeitos.reduce((total, efeito) => total + efeito.usos, 0);

  return (
    <Layout title="02. EFEITOS DE IA" currentPath="/efeitos">
      {/* Cabeçalho da página */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Efeitos de Inteligência Artificial
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Gerencie os efeitos disponíveis no seu totem fotográfico.
          </p>
        </div>

        <button
          onClick={adicionarEfeito}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-vive-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus size={18} />
          Novo efeito
        </button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-vive-primary/10 flex items-center justify-center">
              <Wand2 size={21} className="text-vive-primary" />
            </div>

            <div>
              <p className="text-sm text-gray-500">Total de efeitos</p>
              <p className="text-2xl font-bold text-gray-900">
                {efeitos.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle size={21} className="text-green-500" />
            </div>

            <div>
              <p className="text-sm text-gray-500">Efeitos ativos</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalAtivos}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center">
              <ImageIcon size={21} className="text-blue-500" />
            </div>

            <div>
              <p className="text-sm text-gray-500">Utilizações hoje</p>
              <p className="text-2xl font-bold text-gray-900">{totalUsos}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Busca */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar efeito..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-vive-primary/30 focus:border-vive-primary"
            />
          </div>

          {/* Categoria */}
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-vive-primary/30"
          >
            {categorias.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de efeitos */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Efeitos disponíveis
            </h3>

            <p className="text-xs text-gray-500 mt-1">
              {efeitosFiltrados.length} efeito
              {efeitosFiltrados.length !== 1 ? "s" : ""} encontrado
              {efeitosFiltrados.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Sparkles size={15} className="text-vive-primary" />
            IA
          </div>
        </div>

        {efeitosFiltrados.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {efeitosFiltrados.map((efeito) => (
              <div
                key={efeito.id}
                className="p-5 flex flex-col lg:flex-row lg:items-center gap-5 hover:bg-gray-50/70 transition-colors"
              >
                {/* Imagem */}
                <img
                  src={efeito.imagem}
                  alt={efeito.nome}
                  className="w-20 h-20 rounded-xl object-cover shrink-0"
                />

                {/* Informações */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h4 className="font-bold text-gray-900">
                      {efeito.nome}
                    </h4>

                    <span className="px-2 py-1 rounded-md bg-vive-primary/10 text-vive-primary text-[11px] font-semibold">
                      {efeito.categoria}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 mb-3">
                    {efeito.descricao}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>
                      <strong className="text-gray-600">
                        {efeito.usos}
                      </strong>{" "}
                      utilizações
                    </span>

                    <span
                      className={`flex items-center gap-1.5 font-medium ${
                        efeito.status === "Ativo"
                          ? "text-green-500"
                          : "text-gray-400"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          efeito.status === "Ativo"
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      />

                      {efeito.status}
                    </span>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => alternarStatus(efeito.id)}
                    title={
                      efeito.status === "Ativo"
                        ? "Desativar efeito"
                        : "Ativar efeito"
                    }
                    className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-colors ${
                      efeito.status === "Ativo"
                        ? "border-green-200 text-green-500 hover:bg-green-50"
                        : "border-gray-200 text-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    <Power size={17} />
                  </button>

                  <button
                    onClick={() => editarEfeito(efeito.nome)}
                    title="Editar efeito"
                    className="w-10 h-10 rounded-lg border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <Pencil size={17} />
                  </button>

                  <button
                    onClick={() => excluirEfeito(efeito.id)}
                    title="Excluir efeito"
                    className="w-10 h-10 rounded-lg border border-red-100 text-red-400 flex items-center justify-center hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Search size={22} className="text-gray-400" />
            </div>

            <h4 className="font-semibold text-gray-900 mb-1">
              Nenhum efeito encontrado
            </h4>

            <p className="text-sm text-gray-500">
              Tente alterar a busca ou selecionar outra categoria.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}