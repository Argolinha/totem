import React from 'react';
import Layout from "./layout";import { Plus, Eye, Edit2, Trash2 } from 'lucide-react';

// Tipagem do Objeto Evento
interface Event {
  id: number;
  name: string;
  period: string;
  status: 'Ativo' | 'Inativo';
}

const events: Event[] = [
  { id: 1, name: 'Festa de Aniversário - João', period: '20/05/2025 - 25/05/2025', status: 'Ativo' },
  { id: 2, name: 'Casamento - Marina & Lucas', period: '18/05/2025 - 18/05/2025', status: 'Inativo' },
  { id: 3, name: 'Formatura Medicina 2025', period: '10/05/2025 - 11/05/2025', status: 'Inativo' },
  { id: 4, name: 'Evento Corporativo - TechDay', period: '01/05/2025 - 01/05/2025', status: 'Inativo' },
  { id: 5, name: 'Debutante - Ana Clara', period: '28/04/2025 - 28/04/2025', status: 'Inativo' },
];

export default function Eventos() {
  return (
    <Layout title="Eventos" subtitle="Gerencie os eventos e suas configurações." currentPath="/eventos">
      
      {/* Header Actions */}
      <div className="flex justify-end mb-6">
        <button className="flex items-center gap-2 bg-vive-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-vive-primary/90 transition-colors shadow-sm shadow-vive-primary/30">
          <Plus size={18} />
          Novo Evento
        </button>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500 text-sm bg-gray-50/50">
              <th className="font-medium p-4 pl-6">Nome do Evento</th>
              <th className="font-medium p-4">Período</th>
              <th className="font-medium p-4">Status</th>
              <th className="font-medium p-4 text-center pr-6">Ações</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="p-4 pl-6 text-sm font-medium text-gray-800">{event.name}</td>
                <td className="p-4 text-sm text-gray-600">{event.period}</td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${
                    event.status === 'Ativo' 
                      ? 'bg-green-50 text-green-600 border-green-200' 
                      : 'bg-gray-50 text-gray-600 border-gray-200'
                  }`}>
                    {event.status}
                  </span>
                </td>
                <td className="p-4 pr-6">
                  <div className="flex items-center justify-center gap-4 text-gray-400">
                    <button className="hover:text-vive-primary transition-colors" title="Visualizar"><Eye size={18} /></button>
                    <button className="hover:text-vive-primary transition-colors" title="Editar"><Edit2 size={18} /></button>
                    <button className="hover:text-red-500 transition-colors" title="Excluir"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </Layout>
  );
}