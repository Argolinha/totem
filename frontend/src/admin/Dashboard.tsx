import React from 'react';
import Layout from "./layout";
import StatCard from "./statCard";
import { Camera, CheckCircle, Printer, AlertCircle, Wifi, HardDrive, Thermometer } from 'lucide-react';
export default function Dashboard() {
  return (
    <Layout title="01. DASHBOARD" currentPath="/dashboard">
      {/* Header Greeting */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Olá, Admin!</h2>
          <p className="text-sm text-gray-500">Aqui está o resumo geral do seu sistema.</p>
        </div>
        <div className="flex gap-3">
          <select className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-vive-primary cursor-pointer">
            <option>Hoje</option>
            <option>Ontem</option>
            <option>Últimos 7 dias</option>
          </select>
          <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 font-medium flex items-center gap-2">
            <span>25/05/2025</span>
          </div>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <StatCard icon={Camera} title="Fotos Realizadas" value="128" change="+12% vs ontem" changeColor="text-green-500" />
        <StatCard icon={CheckCircle} title="Fotos Processadas" value="112" change="+10% vs ontem" changeColor="text-green-500" />
        <StatCard icon={Printer} title="Impressas" value="98" change="+8% vs ontem" changeColor="text-green-500" />
        <StatCard icon={AlertCircle} title="Pendentes" value="14" change="-9% vs ontem" changeColor="text-red-500" />
      </div>

      {/* Grid de Status, Fila e Gráfico */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Status do Sistema (Col-span 4) */}
        <div className="col-span-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 mb-4">Status do Sistema</h3>
          <div className="space-y-5">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-gray-600"><Printer size={16} /> Impressora Fujifilm ASK-400</div>
              <span className="text-green-500 font-medium flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div> Online</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-gray-600"><Wifi size={16} /> Conexão com a internet</div>
              <span className="text-green-500 font-medium flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div> Online</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-gray-600 w-1/2"><HardDrive size={16} /> Armazenamento</div>
              <div className="flex-1 ml-4">
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className="bg-vive-primary h-2.5 rounded-full" style={{ width: '78%' }}></div>
                </div>
                <p className="text-xs text-right mt-1 text-gray-500">78% utilizado</p>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-gray-600"><Thermometer size={16} /> Temperatura do Sistema</div>
              <span className="text-green-500 font-medium">42°C</span>
            </div>
          </div>
        </div>

        {/* Fila de Impressão (Col-span 4) */}
        <div className="col-span-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-base font-bold text-gray-900">Fila de Impressão</h3>
          </div>
          <div className="space-y-4">
            {[
              { img: '1', time: '14:32:22', status: 'Na fila' },
              { img: '2', time: '14:31:10', status: 'Na fila' },
              { img: '3', time: '14:28:15', status: 'Imprimindo' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <img src={`https://placehold.co/40x40/6366f1/ffffff?text=${item.img}`} alt="Thumb" className="w-10 h-10 rounded-md object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Foto com efeito</p>
                  <p className="text-xs text-gray-500">{item.time}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-md font-medium border ${item.status === 'Imprimindo' ? 'text-vive-primary border-vive-primary/30 bg-vive-primary/5' : 'text-gray-500 border-gray-200'}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
          <button className="w-full text-center text-sm text-vive-primary font-medium mt-5 hover:underline">
            Ver fila completa
          </button>
        </div>

        {/* Gráfico Fotos por Efeito (Col-span 4) */}
        <div className="col-span-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-base font-bold text-gray-900 mb-6">Fotos por Efeito (hoje)</h3>
          <div className="flex-1 flex items-center justify-center gap-8">
            {/* Gráfico de rosca com CSS puro */}
            <div className="relative w-32 h-32 rounded-full" style={{
              background: 'conic-gradient(#7C3AED 0% 45%, #EC4899 45% 65%, #10B981 65% 85%, #9CA3AF 85% 100%)'
            }}>
              <div className="absolute inset-0 m-auto w-20 h-20 bg-white rounded-full"></div>
            </div>
            <div className="space-y-3 text-sm min-w-[140px]">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-vive-primary"></div><span className="text-gray-600 flex-1">Avatar Cartoon</span><span className="font-bold text-gray-900">45%</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-pink-500"></div><span className="text-gray-600 flex-1">Face Swap</span><span className="font-bold text-gray-900">20%</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div><span className="text-gray-600 flex-1">Cenários</span><span className="font-bold text-gray-900">20%</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-400"></div><span className="text-gray-600 flex-1">Outros</span><span className="font-bold text-gray-900">7%</span></div>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}