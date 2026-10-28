
import { useState } from "react";
import Layout from "./layout";

export default function AdicionarCliente() {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [evento, setEvento] = useState("");
  const [data, setData] = useState("");
  const [valor, setValor] = useState("");

  function salvarCliente(e: React.FormEvent) {
    e.preventDefault();

    if (!nome || !telefone || !email) {
      alert("Preencha nome, telefone e e-mail.");
      return;
    }

    alert("Cliente cadastrado com sucesso!");

    setNome("");
    setTelefone("");
    setEmail("");
    setEvento("");
    setData("");
    setValor("");
  }

  return (
    <Layout
      title="Adicionar cliente"
      subtitle="Cadastre um novo cliente no sistema."
      currentPath="/clientes"
    >
      <div className="mx-auto max-w-4xl">
        <div className="rounded-xl bg-white p-6 shadow-sm">

          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Adicionar cliente
          </h2>

          <form
            onSubmit={salvarCliente}
            className="grid grid-cols-1 gap-5 md:grid-cols-2"
          >

            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Nome completo
              </label>

              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Digite o nome"
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
                required
              />
            </div>

            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Telefone
              </label>

              <input
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(00) 00000-0000"
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
                required
              />
            </div>

            <div>
              <label className="mb-2 block font-medium text-gray-700">
                E-mail
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cliente@email.com"
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
                required
              />
            </div>

            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Tipo de evento
              </label>

              <select
                value={evento}
                onChange={(e) => setEvento(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              >
                <option value="">Selecione o evento</option>
                <option value="Casamento">Casamento</option>
                <option value="Aniversário">Aniversário</option>
                <option value="Corporativo">Corporativo</option>
                <option value="15 anos">15 anos</option>
                <option value="Formatura">Formatura</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Data do evento
              </label>

              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Valor estimado
              </label>

              <input
                type="number"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="R$ 0,00"
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              />
            </div>

            <div className="flex gap-3 md:col-span-2">

              <button
                type="submit"
                className="rounded-lg bg-violet-600 px-6 py-3 font-semibold text-white hover:bg-violet-700"
              >
                Salvar cliente
              </button>

              <button
                type="button"
                onClick={() => window.history.back()}
                className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700"
              >
                Cancelar
              </button>

            </div>

          </form>

        </div>
      </div>
    </Layout>
  );
}