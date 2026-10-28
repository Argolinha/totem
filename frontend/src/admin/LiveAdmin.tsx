import {FormEvent, useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import Layout from './layout';
import {adminApi, errorMessage, assetUrl, Row} from './api';

type Field = {key:string; label:string; type?:string; required?:boolean; options?:string[]};
const common: Field[] = [{key:'nome',label:'Nome',required:true}];
const definitions: Record<string,{title:string;fields:Field[];columns:string[]}> = {
  clientes:{title:'Clientes',columns:['nome','email','telefone','ativo'],fields:[...common,{key:'email',label:'E-mail',type:'email'},{key:'telefone',label:'Telefone'},{key:'documento',label:'Documento'},{key:'empresa',label:'Empresa'},{key:'endereco',label:'Endereço'},{key:'observacoes',label:'Observações',type:'textarea'},{key:'ativo',label:'Ativo',type:'checkbox'}]},
  eventos:{title:'Eventos',columns:['nome','cliente_id','data_evento','local','status'],fields:[...common,{key:'cliente_id',label:'Cliente',type:'cliente',required:true},{key:'data_evento',label:'Data do evento',type:'datetime-local',required:true},{key:'local',label:'Local'},{key:'hora_inicio',label:'Início',type:'time'},{key:'hora_fim',label:'Fim',type:'time'},{key:'status',label:'Status',options:['agendado','realizado','cancelado']},{key:'observacoes',label:'Observações',type:'textarea'}]},
  efeitos:{title:'Efeitos de IA',columns:['nome','prompt','ativo','ordem'],fields:[...common,{key:'prompt',label:'Prompt',type:'textarea',required:true},{key:'provider_preferido',label:'Provedor preferido (opcional)'},{key:'ordem',label:'Ordem',type:'number'},{key:'ativo',label:'Ativo',type:'checkbox'}]},
  orcamentos:{title:'Orçamentos',columns:['titulo','cliente_id','valor_total','status','data_evento_prevista'],fields:[{key:'titulo',label:'Título',required:true},{key:'cliente_id',label:'Cliente',type:'cliente',required:true},{key:'data_evento_prevista',label:'Data prevista',type:'datetime-local'},{key:'validade',label:'Validade',type:'datetime-local'},{key:'observacoes',label:'Observações',type:'textarea'}]},
  molduras:{title:'Molduras',columns:['nome','arquivo_path','ativa','padrao'],fields:[...common,{key:'padrao',label:'Padrão',type:'checkbox'}]},
};
const labels:Record<string,string>={nome:'Nome',email:'E-mail',telefone:'Telefone',ativo:'Ativo',ativa:'Ativa',cliente_id:'Cliente',data_evento:'Data',local:'Local',status:'Status',prompt:'Prompt',ordem:'Ordem',titulo:'Título',valor_total:'Total',data_evento_prevista:'Data prevista',arquivo_path:'Imagem',padrao:'Padrão',created_at:'Criada em',totem_id:'Totem',printed:'Impressa',id:'Sessão'};
const metricLabels:Record<string,string>={total_sessions:'Sessões',sessions_hoje:'Sessões hoje',total_fotos_impressas:'Fotos impressas',total_clientes:'Clientes ativos',eventos_agendados:'Eventos agendados',orcamentos_abertos:'Orçamentos abertos',receita_total_orcamentos_aprovados:'Receita de orçamentos aprovados',fila_offline:'Fila offline'};
const button='px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50';
const input='border rounded-lg p-2 w-full bg-white';
export default function LiveAdmin() {
  const location=useLocation(); const navigate=useNavigate();
  const section=location.pathname.split('/')[2] || 'dashboard'; const def=definitions[section];
  const [rows,setRows]=useState<Row[]>([]); const [clients,setClients]=useState<Row[]>([]); const [stats,setStats]=useState<Row>({});
  const [error,setError]=useState(''); const [notice,setNotice]=useState(''); const [loading,setLoading]=useState(true); const [busy,setBusy]=useState(false);
  const [query,setQuery]=useState(''); const [editing,setEditing]=useState<Row|null>(null); const [draft,setDraft]=useState<Row>({}); const [items,setItems]=useState<Row[]>([]); const [file,setFile]=useState<File|null>(null);
  const isSessions=['fila','fotos','impressao'].includes(section); const isStats=['dashboard','relatorios'].includes(section); const isSystem=['config','sistema'].includes(section);
  async function load() {
    setLoading(true); setError('');
    try {
      if(def || isSessions) {
        const [r,c]=await Promise.all([adminApi.get(isSessions?'/sessions?limit=500':`/${section}`),adminApi.get('/clientes')]);setRows(r.data);setClients(c.data);
      } else if(isStats) {setStats((await adminApi.get('/dashboard/stats')).data);}
      else if(isSystem) {setStats((await adminApi.get('/system')).data);}
      else navigate('/admin/dashboard',{replace:true});
    } catch(e) {setError(errorMessage(e));} finally {setLoading(false);}
  }
  useEffect(()=>{setRows([]);setStats({});setEditing(null);setQuery('');setNotice(''); void load();},[section]);
  useEffect(()=>{if(isSessions){const timer=window.setInterval(()=>{void load();},15000);return()=>window.clearInterval(timer);}},[section]);
  function open(row:Row={}) {
    const values:Row={ativo:true,padrao:false,ordem:0,status:'agendado',...row};
    def?.fields.forEach(f=>{if(f.type==='datetime-local' && values[f.key]) values[f.key]=values[f.key].slice(0,16);});
    setDraft(values);setItems(row.itens?.map((x:Row)=>({...x})) || [{descricao:'Serviço de photobooth',quantidade:1,valor_unitario:0}]);setEditing(row);setFile(null);setError('');
  }
  useEffect(()=>{if(location.pathname.endsWith('/adicionar')) open();},[location.pathname]);
  async function action(fn:()=>Promise<unknown>,message:string) {
    setBusy(true);setError('');setNotice('');try {await fn();setNotice(message);await load();}catch(e){setError(errorMessage(e));}finally{setBusy(false);}
  }
  async function save(e:FormEvent) {
    e.preventDefault();setBusy(true);setError('');
    try {
      if(section==='molduras') {
        if(!file) throw new Error('Selecione uma imagem.');
        const form=new FormData();form.append('file',file);form.append('nome',draft.nome);form.append('padrao',String(!!draft.padrao));await adminApi.post('/molduras',form);
      } else {
        const payload:Row={};for(const f of def.fields){const value=draft[f.key];payload[f.key]=f.type==='checkbox'?!!value:f.type==='number'?Number(value||0):value || null;}
        if(section==='orcamentos'){payload.itens=items.map(i=>({descricao:i.descricao,quantidade:Number(i.quantidade),valor_unitario:Number(i.valor_unitario)}));if(editing?.id)payload.status=draft.status;}
        if(editing?.id)await adminApi.put(`/${section}/${editing.id}`,payload);else await adminApi.post(`/${section}`,payload);
      }
      setEditing(null);setNotice('Salvo no banco de dados.');if(location.pathname.endsWith('/adicionar'))navigate('/admin/clientes');await load();
    }catch(e:any){setError(e.response?errorMessage(e):e.message);}finally{setBusy(false);}
  }
  function display(key:string,value:any):string {
    if(value===null || value===undefined)return '—';if(typeof value==='boolean')return value?'Sim':'Não';
    if(key==='cliente_id')return clients.find(c=>c.id===value)?.nome || value;
    if(key==='valor_total' || key.startsWith('receita_'))return Number(value).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
    if(['created_at','data_evento','data_evento_prevista'].includes(key))return new Date(value).toLocaleString('pt-BR');return String(value);
  }
  const columns=def?.columns || ['id','totem_id','status','created_at','printed'];
  const filtered=rows.filter(r=> (!query || columns.some(k=>display(k,r[k]).toLowerCase().includes(query.toLowerCase()))) && (section!=='impressao' || ['printing','printed'].includes(r.status)) && (section!=='fila' || ['uploaded','processing','queued_offline','error'].includes(r.status)));
  function exportCSV(){const entries=Object.entries(stats).filter(([,v])=>typeof v!=='object');const csv='\uFEFFIndicador;Valor\r\n'+entries.map(([k,v])=>`"${metricLabels[k]||k}";"${String(v).replace(/"/g,'""')}"`).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));const a=document.createElement('a');a.href=url;a.download='relatorio-vive.csv';a.click();URL.revokeObjectURL(url);}
  return <Layout title={def?.title || ({dashboard:'Dashboard',fila:'Fila de processamento',fotos:'Fotos',impressao:'Impressão',relatorios:'Relatórios',config:'Configurações',sistema:'Sistema'} as Record<string,string>)[section] || 'Admin'} currentPath={`/admin/${section}`}>
    <div className="flex gap-3 mb-6"><button className={button} disabled={busy||loading} onClick={()=>void load()}>Atualizar</button>{def && <button className={button} disabled={busy} onClick={()=>open()}>Adicionar</button>}{section==='relatorios' && <button className={button} disabled={loading} onClick={exportCSV}>Exportar CSV</button>}</div>
    {error && <p role="alert" className="p-4 mb-4 bg-red-50 text-red-800 rounded">{error}</p>}{notice && <p role="status" className="p-4 mb-4 bg-green-50 text-green-800 rounded">{notice}</p>}
    {loading && <p role="status">Carregando…</p>}
    {isStats && <><div className="grid grid-cols-2 xl:grid-cols-4 gap-4">{Object.entries(stats).filter(([,v])=>typeof v!=='object').map(([k,v])=><div key={k} className="bg-white border rounded-xl p-5"><p className="text-gray-500">{metricLabels[k]||k}</p><strong className="text-2xl">{display(k,v)}</strong></div>)}</div><h2 className="font-bold mt-8 mb-3">Sessões por status</h2>{Object.entries(stats.sessions_por_status||{}).map(([k,v])=><p key={k}>{k}: {String(v)}</p>)}</>}
    {isSystem && <div className="bg-white p-6 rounded-xl border space-y-3"><p>Configuração em uso no servidor. Para alterar estes valores, edite o arquivo <code>backend/.env</code> e reinicie backend e celery.</p>{Object.entries(stats).map(([k,v])=><p key={k}><strong>{k}: </strong>{String(v)}</p>)}</div>}
    {(def||isSessions) && <><input aria-label="Buscar" placeholder="Buscar nos registros carregados…" className={input+' mb-4'} value={query} onChange={e=>setQuery(e.target.value)}/>{section==='impressao' && <p className="mb-3 text-amber-800">O projeto enviado simula a impressão. A conexão com uma impressora física precisa ser implementada.</p>}{isSessions && <p className="text-sm text-gray-500 mb-3">Até 500 sessões recentes. Atualização automática a cada 15 segundos.</p>}<div className="overflow-x-auto bg-white rounded-xl border"><table className="w-full text-sm text-left"><thead><tr>{columns.map(k=><th key={k} className="p-3">{labels[k]||k}</th>)}<th className="p-3">Ações</th></tr></thead><tbody>{filtered.map(r=><tr key={r.id} className="border-t">{columns.map(k=><td key={k} className="p-3 max-w-xs break-words">{k==='arquivo_path'?<a href={assetUrl(r[k])} target="_blank" rel="noreferrer"><img src={assetUrl(r[k])} alt={r.nome} className="h-16"/></a>:display(k,r[k])}</td>)}<td className="p-3"><div className="flex flex-wrap gap-2">{def && section!=='molduras' && <button disabled={busy} className={button} onClick={()=>open(r)}>Editar</button>}{def && <button disabled={busy} className={button} onClick={()=>{if(window.confirm('Excluir este registro?'))void action(()=>adminApi.delete(`/${section}/${r.id}`),'Registro excluído.');}}>Excluir</button>}{section==='orcamentos' && r.status==='aprovado' && <button disabled={busy} className={button} onClick={()=>void action(()=>adminApi.post(`/orcamentos/${r.id}/converter-em-evento`),'Evento criado.')}>Converter em evento</button>}{section==='efeitos' && <label className={button}>Enviar cena<input type="file" className="block w-48" accept="image/*" disabled={busy} onChange={e=>{const f=e.target.files?.[0];if(f){const data=new FormData();data.append('file',f);void action(()=>adminApi.post(`/efeitos/${r.id}/scene`,data),'Cena enviada.');}e.target.value='';}}/></label>}{isSessions && ['error','queued_offline'].includes(r.status) && <button className={button} disabled={busy} onClick={()=>void action(()=>adminApi.post(`/sessions/${r.id}/reprocess`),'Sessão encaminhada para processamento.')}>Reprocessar</button>}</div>{r.error_message && <p className="text-red-700">{r.error_message}</p>}{isSessions && r.results?.map((url:string,i:number)=><a key={url} href={assetUrl(url)} target="_blank" rel="noreferrer" className="inline-block m-1"><img src={assetUrl(url)} alt={r.effect_names?.[i]||'Foto gerada'} className="h-24 rounded"/></a>)}</td></tr>)}</tbody></table>{!loading&&!filtered.length&&<p className="p-6 text-gray-500">Nenhum registro encontrado.</p>}</div></>}
    {editing && def && <div className="fixed inset-0 bg-black/40 z-20 flex items-start justify-center overflow-y-auto p-6"><form onSubmit={save} className="bg-white rounded-xl p-6 w-full max-w-2xl space-y-4"><h2 className="font-bold text-xl">{editing.id?'Editar':'Adicionar'} · {def.title}</h2>{error&&<p role="alert" className="text-red-700">{error}</p>}{def.fields.map(f=><label key={f.key} className="block">{f.label}{f.type==='checkbox'?<input className="ml-3" type="checkbox" checked={!!draft[f.key]} onChange={e=>setDraft({...draft,[f.key]:e.target.checked})}/>:f.type==='cliente'?<select className={input} required value={draft[f.key]||''} onChange={e=>setDraft({...draft,[f.key]:e.target.value})}><option value="">Selecione um cliente</option>{clients.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}</select>:f.options?<select className={input} value={draft[f.key]||f.options[0]} onChange={e=>setDraft({...draft,[f.key]:e.target.value})}>{f.options.map(o=><option key={o}>{o}</option>)}</select>:f.type==='textarea'?<textarea className={input} required={f.required} value={draft[f.key]||''} onChange={e=>setDraft({...draft,[f.key]:e.target.value})}/>:<input className={input} required={f.required} type={f.type||'text'} value={draft[f.key]??''} onChange={e=>setDraft({...draft,[f.key]:e.target.value})}/>}</label>)}
    {section==='molduras'&&<label className="block">Imagem<input type="file" accept="image/*" required onChange={e=>setFile(e.target.files?.[0]||null)}/></label>}
    {section==='orcamentos'&&<fieldset className="space-y-3"><legend>Itens do orçamento</legend>{items.map((item,i)=><div key={i} className="grid grid-cols-4 gap-2"><label className="col-span-2">Descrição<input className={input} required value={item.descricao} onChange={e=>setItems(items.map((v,j)=>j===i?{...v,descricao:e.target.value}:v))}/></label><label>Quantidade<input className={input} type="number" min="1" step="1" required value={item.quantidade} onChange={e=>setItems(items.map((v,j)=>j===i?{...v,quantidade:e.target.value}:v))}/></label><label>Preço unitário<input className={input} type="number" min="0" step="0.01" required value={item.valor_unitario} onChange={e=>setItems(items.map((v,j)=>j===i?{...v,valor_unitario:e.target.value}:v))}/></label><button type="button" className={button} onClick={()=>setItems(items.filter((_,j)=>j!==i))}>Remover item</button></div>)}<button type="button" className={button} onClick={()=>setItems([...items,{descricao:'',quantidade:1,valor_unitario:0}])}>Adicionar item</button>{editing.id&&<label className="block">Status<select className={input} value={draft.status} onChange={e=>setDraft({...draft,status:e.target.value})}>{['rascunho','enviado','aprovado','recusado','convertido'].map(s=><option key={s}>{s}</option>)}</select></label>}</fieldset>}
    <div className="flex gap-3"><button className={button} disabled={busy}>{busy?'Salvando…':'Salvar'}</button><button type="button" className={button} disabled={busy} onClick={()=>{setEditing(null);if(location.pathname.endsWith('/adicionar'))navigate('/admin/clientes');}}>Cancelar</button></div></form></div>}
  </Layout>;
}
