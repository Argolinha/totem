import axios from 'axios';
export type Row = Record<string, any>;
export const adminApi = axios.create({baseURL: (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '') + '/api/admin', timeout: 20000});
adminApi.interceptors.request.use(config => {
  const token = sessionStorage.getItem('vive_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export function logout() { sessionStorage.removeItem('vive_admin_token'); window.location.assign('/admin/login'); }
adminApi.interceptors.response.use(response => response, error => {
  if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) logout();
  return Promise.reject(error);
});
export function errorMessage(error: any): string {
  const detail = error.response?.data?.detail;
  return typeof detail === 'string' ? detail : Array.isArray(detail) ? detail.map((x: any) => `${x.loc?.slice(1).join('.')}: ${x.msg}`).join('; ') : 'Não foi possível conectar à API. Confira se o backend está rodando.';
}

export function assetUrl(value: string): string {
  if (/^https?:\/\//i.test(value)) return value;
  return (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '') + '/' + value.replace(/^\//, '');
}
