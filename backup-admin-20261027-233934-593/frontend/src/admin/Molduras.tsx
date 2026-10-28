import React, { useMemo, useState } from "react";
import Layout from "./layout";
import {
  Image as ImageIcon,
  Plus,
  Search,
  Pencil,
  Trash2,
  Power,
  Eye,
  Layers,
} from "lucide-react";

interface Moldura {
  id: number;
  nome: string;
  descricao: string;
  categoria: string;
  formato: string;
  status: "Ativa" | "Inativa";
  usos: number;
  imagem: string;
}

const moldurasIniciais: Moldura[] = [
  {
    id: 1,
    nome: "Moldura Elegance",
    descricao: "Moldura clássica e sofisticada para eventos sociais.",
    categoria: "Elegante",
    formato: "10x15",
    status: "Ativa",
    usos: 42,
    imagem: "https://placehold.co/300x200/7C3AED/ffffff?text=Elegance",
  },
  {
    id: 2,
    nome: "Festa Neon",
    descricao: "Visual moderno e colorido para festas e baladas.",
    categoria: "Festa",
    formato: "10x15",
    status: "Ativa",
    usos: 31,
    imagem: "https://placehold.co/300x200/EC4899/ffffff?text=Neon",
  },
  {
    id: 3,
    nome: "Casamento",
    descricao: "Moldura delicada para casamentos e celebrações.",
    categoria: "Casamento",
    formato: "15x20",
    status: "Ativa",
    usos: 28,
    imagem: "https://placehold.co/300x200/10B981/ffffff?text=Wedding",
  },
  {
    id: 4,
    nome: "Corporativo",
    descricao: "Layout profissional para eventos empresariais.",
    categoria: "Corporativo",
    formato: "10x15",
    status: "Inativa",
    usos: 15,
    imagem: "https://placehold.co/300x200/64748B/ffffff?text=Business",
  },
  {
    id: 5,
    nome: "Aniversário",
    descricao: "Moldura divertida para aniversários e comemorações.",
    categoria: "Festa",
    formato: "10x15",
    status: "Ativa",
    usos: 22,
    imagem: "https://placehold.co/300x200/F59E0B/ffffff?text=Party",
  },
  {
    id: 6,
    nome: "Minimalista",
    descricao: "Design limpo e moderno para diferentes ocasiões.",
    categoria: "Minimalista",
    formato: "15x20",
    status: "Ativa",
    usos: 18,
    imagem: "https://placehold.co/300x200/334155/ffffff?text=Minimal",
  },
];

export default function Molduras() {
  const [molduras, setMolduras] = useState<Moldura[]>(moldurasIniciais);
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("Todos");

  const categorias = [
    "Todos",
    "Elegante",
    "Festa",
    "Casamento",
    "Corporativo",
    "Minimalista",
  ];

  const moldurasFiltradas = useMemo(() => {
    return molduras.filter((moldura) => {
      const correspondeBusca =
        moldura.nome.toLowerCase().includes(busca.toLowerCase()) ||
        moldura.descricao.toLowerCase().includes(busca.toLowerCase());

      const correspondeCategoria =
        categoria === "Todos" || moldura.categoria === categoria;

      return correspondeBusca && correspondeCategoria;
    });
  }, [molduras, busca, categoria]);

  const totalAtivas = molduras.filter(
    (moldura) => moldura.status === "Ativa"
  ).length;

  const totalUsos = molduras.reduce(
    (total, moldura) => total + moldura.usos,
    0
  );

  const alternarStatus = (id: number) => {
    setMolduras((atual) =>
      atual.map((moldura) =>
        moldura.id === id
          ? {
              ...moldura,
              status:
                moldura.status === "Ativa" ? "Inativa" : "Ativa",
            }
          : moldura
      )
    );
  };

  const excluirMoldura = (id: number) => {
    const moldura = molduras.find((item) => item.id === id);

    if (!moldura) return;

    const confirmar = window.confirm(
      `Deseja realmente excluir a moldura "${moldura.nome}"?`
    );

    if (confirmar) {
      setMolduras((atual) =>
        atual.filter((item) => item.id !== id)
      );
    }
  };

  const adicionarMoldura = () => {
    window.alert(
      "O cadastro de uma nova moldura será implementado na próxima etapa."
    );
  };

  const editarMoldura = (nome: string) => {
    window.alert(
      `A edição da moldura "${nome}" será implementada na próxima etapa.`
    );
  };

  const visualizarMoldura = (nome: string) => {
    window.alert(`Visualização da moldura "${nome}".`);
  };

  return (
    <Layout
      title="03. MOLDURAS"
      currentPath="/molduras"
    >
      {/* Cabeçalho */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Molduras
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Gerencie as molduras disponíveis para as fotos do seu
            photobooth.
          </p>
        </div>

        <button
          onClick={adicionarMoldura}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-vive-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus size={18} />
          Nova moldura
        </button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-vive-primary/10 flex items-center justify-center">
              <Layers
                size={21}
                className="text-vive-primary"
              />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Total de molduras
              </p>

              <p className="text-2xl font-bold text-gray-900">
                {molduras.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-green-50 flex items-center justify-center">
              <Power
                size={21}
                className="text-green-500"
              />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Molduras ativas
              </p>

              <p className="text-2xl font-bold text-gray-900">
                {totalAtivas}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center">
              <ImageIcon
                size={21}
                className="text-blue-500"
              />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Utilizações
              </p>

              <p className="text-2xl font-bold text-gray-900">
                {totalUsos}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar moldura..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-vive-primary/30 focus:border-vive-primary"
            />
          </div>

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

      {/* Grade de molduras */}
      {moldurasFiltradas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {moldurasFiltradas.map((moldura) => (
            <div
              key={moldura.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Imagem */}
              <div className="relative">
                <img
                  src={moldura.imagem}
                  alt={moldura.nome}
                  className="w-full h-44 object-cover"
                />

                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                      moldura.status === "Ativa"
                        ? "bg-green-500 text-white"
                        : "bg-gray-500 text-white"
                    }`}
                  >
                    {moldura.status}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3">
                  <span className="px-2.5 py-1 rounded-md bg-white/90 text-gray-700 text-xs font-semibold">
                    {moldura.formato}
                  </span>
                </div>
              </div>

              {/* Conteúdo */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {moldura.nome}
                    </h3>

                    <span className="text-xs text-vive-primary font-medium">
                      {moldura.categoria}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <ImageIcon size={14} />
                    {moldura.usos}
                  </div>
                </div>

                <p className="text-sm text-gray-500 leading-relaxed mb-5">
                  {moldura.descricao}
                </p>

                {/* Ações */}
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() =>
                      visualizarMoldura(moldura.nome)
                    }
                    title="Visualizar"
                    className="h-10 rounded-lg border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <Eye size={17} />
                  </button>

                  <button
                    onClick={() =>
                      alternarStatus(moldura.id)
                    }
                    title={
                      moldura.status === "Ativa"
                        ? "Desativar"
                        : "Ativar"
                    }
                    className={`h-10 rounded-lg border flex items-center justify-center transition-colors ${
                      moldura.status === "Ativa"
                        ? "border-green-200 text-green-500 hover:bg-green-50"
                        : "border-gray-200 text-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    <Power size={17} />
                  </button>

                  <button
                    onClick={() =>
                      editarMoldura(moldura.nome)
                    }
                    title="Editar"
                    className="h-10 rounded-lg border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <Pencil size={17} />
                  </button>

                  <button
                    onClick={() =>
                      excluirMoldura(moldura.id)
                    }
                    title="Excluir"
                    className="h-10 rounded-lg border border-red-100 text-red-400 flex items-center justify-center hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Search size={22} className="text-gray-400" />
          </div>

          <h4 className="font-semibold text-gray-900 mb-1">
            Nenhuma moldura encontrada
          </h4>

          <p className="text-sm text-gray-500">
            Tente alterar a busca ou selecionar outra categoria.
          </p>
        </div>
      )}
    </Layout>
  );
}