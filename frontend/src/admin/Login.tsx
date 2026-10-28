import {useState, FormEvent, useEffect} from 'react';
import {Navigate, useNavigate, useLocation} from 'react-router-dom';
import {adminApi, errorMessage} from './api';
export function AdminGuard({children}: {children: React.ReactNode}) {
  const location = useLocation();
  const [valid, setValid] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { if (sessionStorage.getItem('vive_admin_token')) adminApi.get('/auth/me').then(() => setValid(true)).catch(e => setError(errorMessage(e))); }, []);
  if (!sessionStorage.getItem('vive_admin_token')) return <Navigate to="/admin/login" state={{from: location.pathname}} replace />;
  if (error) return <div role="alert" className="p-8">{error} <button onClick={() => window.location.reload()}>Tentar novamente</button></div>;
  return valid ? <>{children}</> : <p className="p-8">Validando acesso…</p>;
}
export default function Login() {
  const [email,setEmail] = useState(''); const [password,setPassword] = useState('');
  const [error,setError] = useState(''); const [busy,setBusy] = useState(false);
  const navigate = useNavigate(); const location = useLocation();
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    try { const {data} = await adminApi.post('/auth/login',{email:email.trim(),password}); sessionStorage.setItem('vive_admin_token',data.access_token); const from = location.state?.from; navigate(typeof from === 'string' && from.startsWith('/admin/') && from !== '/admin/login' ? from : '/admin/dashboard',{replace:true}); }
    catch(e) {setError(errorMessage(e));} finally {setBusy(false);}
  }
  return <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6"><form onSubmit={submit} className="bg-white p-8 rounded-xl shadow w-full max-w-md space-y-5"><h1 className="text-2xl font-bold">Vive AI · Administração</h1><label className="block">E-mail<input className="border p-3 rounded w-full" type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label className="block">Senha<input className="border p-3 rounded w-full" type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}/></label>{error && <p role="alert" className="text-red-700">{error}</p>}<button disabled={busy} className="w-full bg-vive-primary text-white p-3 rounded disabled:opacity-50">{busy?'Entrando…':'Entrar'}</button><a href="/" className="block text-sm">Voltar ao totem</a></form></main>;
}
