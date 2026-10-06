
import { useState } from "react";
import Layout from "./layout";
import {
  Search,
  Plus,
  Users,
  UserCheck,
  Clock,
  CheckCircle,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

interface Cliente {
  id: number;
  nome: string;
  telefone: string;
  email: string;
  evento: string;
  data: string;
  valor: string;
  status: string;
}

const clientesIniciais: Cliente[] = [
  {
    id: 1,
    nome: "Ana Paula",
    telefone: "(27) 99912-3456",
    email: "ana.paula@email.com",
    evento: "Casamento",
    data: "20/10/2026",
    valor: "R$ 2.500,00",
    status: "Orçamento enviado",
  },
  {
    id: 2,
    nome: "Empresa XPTO",
    telefone: "(27) 98876-5432",
    email: "contato@xpto.com.br",
    evento: "Corporativo",
    data: "15/11/2026",
    valor: "R$ 4.000,00",
    status: "Fechado",
  },
  {
    id: 3,
    nome: "Mariana Silva",
    telefone: "(27) 99765-4321",
    email: "mariana@email.com",
    evento: "Aniversário",
    data: "05/12/2026",
    valor: "R$ 1.800,00",
    status: "Em negociação",
  },
];

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>(
    clientesIniciais
  );

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [menuAberto, setMenuAberto] = useState<number | null>(null);

  const clientesFiltrados = clientes.filter((cliente) => {
    const texto = busca.toLowerCase();

    const correspondeBusca =
      cliente.nome.toLowerCase().includes(texto) ||
      cliente.telefone.includes(texto) ||
      cliente.email.toLowerCase().includes(texto);

    const correspondeStatus =
      filtroStatus === "Todos" ||
      cliente.status === filtroStatus;

    return correspondeBusca && correspondeStatus;
  });

  function excluirCliente(id: number) {
    const confirmar = window.confirm(
      "Deseja realmente excluir este cliente?"
    );

    if (confirmar) {
      setClientes((atual) =>
        atual.filter((cliente) => cliente.id !== id)
      );
    }

    setMenuAberto(null);
  }

  function statusClasse(status: string) {
    if (status === "Fechado") {
      return "bg-green-100 text-green-700";
    }

    if (status === "Em negociação") {
      return "bg-blue-100 text-blue-700";
    }

    return "bg-yellow-100 text-yellow-700";
  }

  return (
    <Layout
      title="Clientes"
      subtitle="Gerencie seus clientes e acompanhe seus eventos."
      currentPath="/admin/clientes"
    >
      <div className="space-y-6">

        {/* CABEÇALHO */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Lista de clientes
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Consulte e gerencie todos os seus clientes.
            </p>
          </div>

          <a
            href="/admin/clientes/adicionar"
            className="flex items-center justify-center gap-2 rounded-lg bg-vive-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <Plus size={18} />
            Adicionar cliente
          </a>

        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-purple-100 p-3">
                <Users size={22} className="text-purple-600" />
              </div>
            </div>

            <p className="mt-4 text-sm text-gray-500">
              Total de clientes
            </p>

            <h3 className="mt-1 text-3xl font-bold text-gray-900">
              {clientes.length}
            </h3>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="rounded-lg bg-blue-100 p-3 w-fit">
              <UserCheck size={22} className="text-blue-600" />
            </div>

            <p className="mt-4 text-sm text-gray-500">
              Em negociação
            </p>

            <h3 className="mt-1 text-3xl font-bold text-gray-900">
              {clientes.filter(
                (cliente) => cliente.status === "Em negociação"
              ).length}
            </h3>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="rounded-lg bg-yellow-100 p-3 w-fit">
              <Clock size={22} className="text-yellow-600" />
            </div>

            <p className="mt-4 text-sm text-gray-500">
              Orçamentos enviados
            </p>

            <h3 className="mt-1 text-3xl font-bold text-gray-900">
              {clientes.filter(
                (cliente) => cliente.status === "Orçamento enviado"
              ).length}
            </h3>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="rounded-lg bg-green-100 p-3 w-fit">
              <CheckCircle size={22} className="text-green-600" />
            </div>

            <p className="mt-4 text-sm text-gray-500">
              Clientes fechados
            </p>

            <h3 className="mt-1 text-3xl font-bold text-gray-900">
              {clientes.filter(
                (cliente) => cliente.status === "Fechado"
              ).length}
            </h3>
          </div>

        </div>

        {/* FILTROS */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">

          <div className="flex flex-col gap-4 md:flex-row">

            <div className="relative flex-1">
              <Search
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Buscar por nome, telefone ou e-mail..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-vive-primary"
              />
            </div>

            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-600 outline-none focus:border-vive-primary"
            >
              <option value="Todos">Todos os status</option>
              <option value="Orçamento enviado">
                Orçamento enviado
              </option>
              <option value="Em negociação">
                Em negociação
              </option>
              <option value="Fechado">Fechado</option>
            </select>

          </div>

        </div>

        {/* TABELA */}
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-gray-100 p-5">
            <h3 className="font-bold text-gray-900">
              Clientes cadastrados
            </h3>

            <span className="text-sm text-gray-500">
              {clientesFiltrados.length} cliente(s)
            </span>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-left text-sm">

              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="whitespace-nowrap px-5 py-4">
                    Cliente
                  </th>

                  <th className="whitespace-nowrap px-5 py-4">
                    Telefone
                  </th>

                  <th className="whitespace-nowrap px-5 py-4">
                    Evento
                  </th>

                  <th className="whitespace-nowrap px-5 py-4">
                    Data
                  </th>

                  <th className="whitespace-nowrap px-5 py-4">
                    Valor
                  </th>

                  <th className="whitespace-nowrap px-5 py-4">
                    Status
                  </th>

                  <th className="px-5 py-4 text-center">
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">

                {clientesFiltrados.map((cliente) => (

                  <tr
                    key={cliente.id}
                    className="transition hover:bg-gray-50"
                  >

                    <td className="whitespace-nowrap px-5 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {cliente.nome}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {cliente.email}
                        </p>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                      {cliente.telefone}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                      {cliente.evento}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                      {cliente.data}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 font-medium text-gray-900">
                      {cliente.valor}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${statusClasse(
                          cliente.status
                        )}`}
                      >
                        {cliente.status}
                      </span>
                    </td>

                    <td className="relative px-5 py-4 text-center">

                      <button
                        type="button"
                        onClick={() =>
                          setMenuAberto(
                            menuAberto === cliente.id
                              ? null
                              : cliente.id
                          )
                        }
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {menuAberto === cliente.id && (
                        <div className="absolute right-5 top-12 z-20 w-44 rounded-lg border border-gray-200 bg-white py-2 text-left shadow-lg">

                          <button
                            type="button"
                            onClick={() => {
                              alert(
                                `Cliente: ${cliente.nome}\nTelefone: ${cliente.telefone}\nE-mail: ${cliente.email}`
                              );
                              setMenuAberto(null);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                          >
                            <Eye size={16} />
                            Visualizar
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              alert("Edição será adicionada em breve.");
                              setMenuAberto(null);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                          >
                            <Pencil size={16} />
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() => excluirCliente(cliente.id)}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                            Excluir
                          </button>

                        </div>
                      )}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

          {clientesFiltrados.length === 0 && (
            <div className="p-10 text-center text-gray-500">
              Nenhum cliente encontrado.
            </div>
          )}

        </div>

      </div>
    </Layout>
  );
}