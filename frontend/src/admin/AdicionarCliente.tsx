import {useSearchParams, useNavigate} from 'react-router-dom';
import {adminApi, errorMessage} from './api';

import { useEffect, useState } from "react";
import Layout from "./layout";

export default function AdicionarCliente() {
  const [params]=useSearchParams();const id=params.get('id');const navigate=useNavigate();
  const [busy,setBusy]=useState(false);const [error,setError]=useState('');
  const [ativo,setAtivo]=useState(true);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [evento, setEvento] = useState("");
  const [data, setData] = useState("");
  const [valor, setValor] = useState("");

  useEffect(()=>{if(id)adminApi.get('/clientes/'+id).then(({data:c})=>{setAtivo(c.ativo);setNome(c.nome);setTelefone(c.telefone||'');setEmail(c.email||'');setEvento(c.ui.evento||'');setData(c.ui.data||'');setValor(c.ui.valor||'');}).catch(e=>setError(errorMessage(e)));},[id]);
  async function salvarCliente(e: React.FormEvent) {
    e.preventDefault();if(busy)return;setBusy(true);setError('');
    try {const payload={nome,telefone,email,ativo,ui:{evento,data,valor}};
      if(id)await adminApi.put('/clientes/'+id,payload);else await adminApi.post('/clientes',payload);
      navigate('/admin/clientes');
    }catch(e){setError(errorMessage(e));}finally{setBusy(false);}
  }

  return (
    <Layout
      title={id?"Editar cliente":"Adicionar cliente"}
      subtitle="Cadastre um novo cliente no sistema."
      currentPath="/clientes"
    >
      <div className="mx-auto max-w-4xl">
        <div className="rounded-xl bg-white p-6 shadow-sm">

          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            {id?"Editar cliente":"Adicionar cliente"}
          </h2>

          {error && <p role="alert" className="mb-4 text-red-700">{error}</p>}
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

            <label className="md:col-span-2 text-sm text-gray-700"><input type="checkbox" checked={ativo} onChange={e=>setAtivo(e.target.checked)} className="mr-2"/>Cliente ativo</label>
            <div className="flex gap-3 md:col-span-2">

              <button
                type="submit"
                disabled={busy}
                className="rounded-lg bg-violet-600 px-6 py-3 font-semibold text-white hover:bg-violet-700"
              >
                {busy?"Salvando…":"Salvar cliente"}
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