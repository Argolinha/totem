import React, { useMemo, useState } from "react";
import Layout from "./layout";
import {
  Image as ImageIcon,
  Search,
  Trash2,
  Eye,
  Download,
  CalendarDays,
  CheckCircle,
} from "lucide-react";

interface Foto {
  id: number;
  nome: string;
  data: string;
  horario: string;
  efeito: string;
  moldura: string;
  imagem: string;
}

const fotosIniciais: Foto[] = [
  {
    id: 1,
    nome: "Foto #001",
    data: "11/09/2026",
    horario: "14:32",
    efeito: "Avatar Cartoon",
    moldura: "Clássica",
    imagem:
      "https://placehold.co/600x600/7C3AED/ffffff?text=FOTO+001",
  },
  {
    id: 2,
    nome: "Foto #002",
    data: "11/09/2026",
    horario: "14:28",
    efeito: "Face Swap",
    moldura: "Festa",
    imagem:
      "https://placehold.co/600x600/EC4899/ffffff?text=FOTO+002",
  },
  {
    id: 3,
    nome: "Foto #003",
    data: "11/09/2026",
    horario: "14:21",
    efeito: "Cenário Mágico",
    moldura: "Neon",
    imagem:
      "https://placehold.co/600x600/10B981/ffffff?text=FOTO+003",
  },
  {
    id: 4,
    nome: "Foto #004",
    data: "11/09/2026",
    horario: "14:15",
    efeito: "Retrato Vintage",
    moldura: "Vintage",
    imagem:
      "https://placehold.co/600x600/F59E0B/ffffff?text=FOTO+004",
  },
  {
    id: 5,
    nome: "Foto #005",
    data: "11/09/2026",
    horario: "13:58",
    efeito: "Avatar Cartoon",
    moldura: "Clássica",
    imagem:
      "https://placehold.co/600x600/3B82F6/ffffff?text=FOTO+005",
  },
  {
    id: 6,
    nome: "Foto #006",
    data: "11/09/2026",
    horario: "13:45",
    efeito: "Face Swap",
    moldura: "Festa",
    imagem:
      "https://placehold.co/600x600/EF4444/ffffff?text=FOTO+006",
  },
];

export default function Fotos() {
  const [fotos, setFotos] = useState<Foto[]>(fotosIniciais);
  const [busca, setBusca] = useState("");
  const [filtroData, setFiltroData] = useState("Todas");
  const [fotoSelecionada, setFotoSelecionada] =
    useState<Foto | null>(null);

  const fotosFiltradas = useMemo(() => {
    return fotos.filter((foto) => {
      const textoBusca = busca.toLowerCase();

      const correspondeBusca =
        foto.nome.toLowerCase().includes(textoBusca) ||
        foto.efeito.toLowerCase().includes(textoBusca) ||
        foto.moldura.toLowerCase().includes(textoBusca);

      const correspondeData =
        filtroData === "Todas" || foto.data === filtroData;

      return correspondeBusca && correspondeData;
    });
  }, [fotos, busca, filtroData]);

  const excluirFoto = (id: number) => {
    const foto = fotos.find((item) => item.id === id);

    if (!foto) return;

    const confirmar = window.confirm(
      "Deseja realmente excluir esta foto?"
    );

    if (!confirmar) return;

    setFotos((atual) =>
      atual.filter((item) => item.id !== id)
    );

    if (fotoSelecionada?.id === id) {
      setFotoSelecionada(null);
    }
  };

  const visualizarFoto = (foto: Foto) => {
    setFotoSelecionada(foto);
  };

  const baixarFoto = (foto: Foto) => {
    const link = document.createElement("a");

    link.href = foto.imagem;
    link.download = `${foto.nome}.jpg`;
    link.target = "_blank";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalFotos = fotos.length;

  const fotosHoje = fotos.filter(
    (foto) => foto.data === "11/09/2026"
  ).length;

  const efeitosUtilizados = new Set(
    fotos.map((foto) => foto.efeito)
  ).size;

  const datasDisponiveis = Array.from(
    new Set(fotos.map((foto) => foto.data))
  );

  return (
    <Layout title="03. FOTOS" currentPath="/fotos">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Fotos capturadas
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Visualize e gerencie as fotos realizadas no seu totem fotográfico.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-vive-primary/10 flex items-center justify-center">
              <ImageIcon
                size={21}
                className="text-vive-primary"
              />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Total de fotos
              </p>

              <p className="text-2xl font-bold text-gray-900">
                {totalFotos}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle
                size={21}
                className="text-green-500"
              />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Fotos hoje
              </p>

              <p className="text-2xl font-bold text-gray-900">
                {fotosHoje}
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
                Efeitos utilizados
              </p>

              <p className="text-2xl font-bold text-gray-900">
                {efeitosUtilizados}
              </p>
            </div>
          </div>
        </div>
      </div>

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
              placeholder="Buscar foto, efeito ou moldura..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-vive-primary/30 focus:border-vive-primary"
            />
          </div>

          <div className="relative">
            <CalendarDays
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />

            <select
              value={filtroData}
              onChange={(e) => setFiltroData(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-vive-primary/30"
            >
              <option value="Todas">
                Todas as datas
              </option>

              {datasDisponiveis.map((data) => (
                <option key={data} value={data}>
                  {data}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Galeria de fotos
            </h3>

            <p className="text-xs text-gray-500 mt-1">
              {fotosFiltradas.length} foto
              {fotosFiltradas.length !== 1 ? "s" : ""} encontrada
              {fotosFiltradas.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <ImageIcon
              size={15}
              className="text-vive-primary"
            />
            Fotos
          </div>
        </div>

        {fotosFiltradas.length > 0 ? (
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {fotosFiltradas.map((foto) => (
              <div
                key={foto.id}
                className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  <img
                    src={foto.imagem}
                    alt={foto.nome}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/45 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => visualizarFoto(foto)}
                      className="w-11 h-11 rounded-full bg-white text-gray-800 flex items-center justify-center hover:scale-105 transition-transform"
                      title="Visualizar foto"
                    >
                      <Eye size={19} />
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">
                        {foto.nome}
                      </h4>

                      <p className="text-xs text-gray-400 mt-1">
                        {foto.data} às {foto.horario}
                      </p>
                    </div>

                    <span className="px-2 py-1 rounded-md bg-vive-primary/10 text-vive-primary text-[10px] font-semibold whitespace-nowrap">
                      {foto.efeito}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-4">
                    <span className="text-xs text-gray-500">
                      Moldura:{" "}
                      <strong className="text-gray-700">
                        {foto.moldura}
                      </strong>
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => visualizarFoto(foto)}
                        title="Visualizar"
                        className="w-9 h-9 rounded-lg border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        onClick={() => baixarFoto(foto)}
                        title="Baixar"
                        className="w-9 h-9 rounded-lg border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      >
                        <Download size={16} />
                      </button>

                      <button
                        onClick={() => excluirFoto(foto.id)}
                        title="Excluir"
                        className="w-9 h-9 rounded-lg border border-red-100 text-red-400 flex items-center justify-center hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Search
                size={22}
                className="text-gray-400"
              />
            </div>

            <h4 className="font-semibold text-gray-900 mb-1">
              Nenhuma foto encontrada
            </h4>

            <p className="text-sm text-gray-500">
              Tente alterar a busca ou selecionar outra data.
            </p>
          </div>
        )}
      </div>

      {fotoSelecionada && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setFotoSelecionada(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900">
                  {fotoSelecionada.nome}
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  {fotoSelecionada.data} às{" "}
                  {fotoSelecionada.horario}
                </p>
              </div>

              <button
                onClick={() => setFotoSelecionada(null)}
                className="w-9 h-9 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center text-xl"
              >
                ×
              </button>
            </div>

            <div className="p-5">
              <div className="rounded-xl overflow-hidden bg-gray-100">
                <img
                  src={fotoSelecionada.imagem}
                  alt={fotoSelecionada.nome}
                  className="w-full max-h-[65vh] object-contain"
                />
              </div>

              <div className="flex items-center justify-between mt-4 gap-4">
                <div className="text-sm text-gray-500">
                  <span>
                    Efeito:{" "}
                    <strong className="text-gray-800">
                      {fotoSelecionada.efeito}
                    </strong>
                  </span>

                  <span className="mx-2">•</span>

                  <span>
                    Moldura:{" "}
                    <strong className="text-gray-800">
                      {fotoSelecionada.moldura}
                    </strong>
                  </span>
                </div>

                <button
                  onClick={() => baixarFoto(fotoSelecionada)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-vive-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  <Download size={17} />
                  Baixar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}