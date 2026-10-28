import React, {useEffect, useState} from 'react';
import {adminApi, assetUrl, Row, errorMessage} from './api';
import {notify} from './data';
import Layout from "./layout";
import StatCard from "./statCard";
import { Camera, CheckCircle, Printer, AlertCircle, Wifi, HardDrive, Thermometer } from 'lucide-react';
export default function Dashboard() {
  const [periodo,setPeriodo]=useState('Hoje');const [overview,setOverview]=useState<Row>({fila:[],efeitos:{}});const [user,setUser]=useState('Admin');
  useEffect(()=>{let alive=true;adminApi.get('/dashboard/overview',{params:{periodo}}).then(r=>{if(alive)setOverview(r.data);}).catch(e=>notify(errorMessage(e),true));return()=>{alive=false;};},[periodo]);
  useEffect(()=>{adminApi.get('/auth/me').then(r=>setUser(r.data.nome)).catch(()=>{});},[]);
  const colors=['#7C3AED','#EC4899','#10B981','#9CA3AF','#3B82F6','#F59E0B'];
  const effects=Object.entries(overview.efeitos||{}) as [string,number][];const total=effects.reduce((n,[,v])=>n+v,0);let position=0;
  const gradient=total?'conic-gradient('+effects.map(([,v],i)=>{const begin=position;position+=v/total*100;return `${colors[i%colors.length]} ${begin}% ${position}%`;}).join(',')+')':'#E5E7EB';

  return (
    <Layout title="01. DASHBOARD" currentPath="/dashboard">
      {/* Header Greeting */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Olá, {user}!</h2>
          <p className="text-sm text-gray-500">Aqui está o resumo geral do seu sistema.</p>
        </div>
        <div className="flex gap-3">
          <select aria-label="Período do dashboard" value={periodo} onChange={e=>setPeriodo(e.target.value)} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-vive-primary cursor-pointer">
            <option>Hoje</option>
            <option>Ontem</option>
            <option>Últimos 7 dias</option>
          </select>
          <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 font-medium flex items-center gap-2">
            <span>{new Date().toLocaleDateString("pt-BR")}</span>
          </div>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <StatCard icon={Camera} title="Fotos Realizadas" value={String(overview.total??"—")} change={periodo} changeColor="text-green-500" />
        <StatCard icon={CheckCircle} title="Fotos Processadas" value={String(overview.processadas??"—")} change={periodo} changeColor="text-green-500" />
        <StatCard icon={Printer} title="Impressas" value={String(overview.impressas??"—")} change={periodo} changeColor="text-green-500" />
        <StatCard icon={AlertCircle} title="Pendentes" value={String(overview.pendentes??"—")} change={periodo} changeColor="text-red-500" />
      </div>

      {/* Grid de Status, Fila e Gráfico */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Status do Sistema (Col-span 4) */}
        <div className="col-span-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 mb-4">Status do Sistema</h3>
          <div className="space-y-5">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-gray-600"><Printer size={16} /> Impressora</div>
              <span className="text-gray-500 font-medium flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-gray-400"></div> Não monitorada</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-gray-600"><Wifi size={16} /> Conexão com a API</div>
              <span className="text-green-500 font-medium flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div> {overview.total!==undefined?"Conectada":"Verificando"}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-gray-600 w-1/2"><HardDrive size={16} /> Armazenamento</div>
              <div className="flex-1 ml-4">
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className="bg-vive-primary h-2.5 rounded-full" style={{ width: `${overview.disco_percentual||0}%` }}></div>
                </div>
                <p className="text-xs text-right mt-1 text-gray-500">{overview.disco_percentual??"—"}% utilizado</p>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-gray-600"><Thermometer size={16} /> Temperatura do Sistema</div>
              <span className="text-green-500 font-medium">Não monitorada</span>
            </div>
          </div>
        </div>

        {/* Fila de Impressão (Col-span 4) */}
        <div className="col-span-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-base font-bold text-gray-900">Fila de Impressão</h3>
          </div>
          <div className="space-y-4">
            {(overview.fila||[]).map((r:Row)=>({img:r.results?.[0]||'',time:new Date(r.created_at).toLocaleTimeString('pt-BR'),status:r.status})).map((item: {img:string;time:string;status:string}, i:number) => (
              <div key={i} className="flex items-center gap-3">
                <img src={item.img?assetUrl(item.img):"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%23EDE9FE'/%3E%3C/svg%3E"} alt="Thumb" className="w-10 h-10 rounded-md object-cover" />
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
          <button onClick={()=>window.location.assign("/admin/fila")} className="w-full text-center text-sm text-vive-primary font-medium mt-5 hover:underline">
            Ver fila completa
          </button>
        </div>

        {/* Gráfico Fotos por Efeito (Col-span 4) */}
        <div className="col-span-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-base font-bold text-gray-900 mb-6">Fotos por Efeito ({periodo.toLowerCase()})</h3>
          <div className="flex-1 flex items-center justify-center gap-8">
            {/* Gráfico de rosca com CSS puro */}
            <div className="relative w-32 h-32 rounded-full" style={{
              background: gradient
            }}>
              <div className="absolute inset-0 m-auto w-20 h-20 bg-white rounded-full"></div>
            </div>
            <div className="space-y-3 text-sm min-w-[140px]">
              {effects.length?effects.map(([name,count],i)=><div key={name} className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{backgroundColor:colors[i%colors.length]}}/><span className="text-gray-600 flex-1">{name}</span><span className="font-bold text-gray-900">{Math.round(count/total*100)}%</span></div>):<p className="text-gray-500 text-xs">Sem fotos no período.</p>}

            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}