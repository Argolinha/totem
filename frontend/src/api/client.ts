/**
 * Cliente HTTP centralizado (Axios) para comunicação com o backend FastAPI.
 * Contém dois módulos:
 *   - photoboothApi: fluxo do totem (sessão, upload, resultados, impressão)
 *   - adminApi:      painel administrativo / CRM (auth JWT + CRUD real)
 *
 * Não há mais modo mockado: toda a aplicação fala com o backend real.
 * Configure a URL via VITE_API_BASE_URL (.env do frontend).
 */
import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const MOCK_RESULT_IMAGES: string[] = [
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1200",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1200",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1200",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1200",
];

export const MOCK_EFFECT_NAMES: string[] = [
  "Cyberpunk",
  "Cartoon 3D",
  "Anos 80",
  "Anime",
  "Black & White",
  "Aquarela",
];

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Injeta o token JWT do admin automaticamente quando presente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("vive_admin_token");
  if (token && config.url?.includes("/api/admin")) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Se o token expirar/for inválido, desloga automaticamente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && window.location.pathname.startsWith("/admin")) {
      localStorage.removeItem("vive_admin_token");
      localStorage.removeItem("vive_admin_user");
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  }
);

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface SessionStatusResponse {
  id: string;
  status: string;
  error_message?: string | null;
  printer_status?: string | null;
}

export interface ResultsResponse {
  session_id: string;
  status: string;
  results: string[];
  effect_names: string[];
}

export interface QRCodeResponse {
  download_url: string;
  token: string;
  expires_at: string;
}

export interface EfeitoPublico {
  id: string;
  nome: string;
}

export interface MolduraPublica {
  id: string;
  nome: string;
  url: string;
}

export interface Cliente {
  id: string;
  nome: string;
  email?: string | null;
  telefone?: string | null;
  documento?: string | null;
  empresa?: string | null;
  endereco?: string | null;
  observacoes?: string | null;
  origem?: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export type ClienteInput = Omit<Cliente, "id" | "ativo" | "created_at" | "updated_at">;

export interface Evento {
  id: string;
  cliente_id: string;
  nome: string;
  local?: string | null;
  data_evento: string;
  hora_inicio?: string | null;
  hora_fim?: string | null;
  totem_id?: string | null;
  status: string;
  efeito_padrao_id?: string | null;
  moldura_padrao_id?: string | null;
  observacoes?: string | null;
  created_at: string;
}

export interface ItemOrcamento {
  id?: string;
  descricao: string;
  quantidade: number;
  valor_unitario: number;
}

export interface Orcamento {
  id: string;
  cliente_id: string;
  titulo: string;
  data_evento_prevista?: string | null;
  valor_total: number;
  status: string;
  validade?: string | null;
  observacoes?: string | null;
  itens: ItemOrcamento[];
  created_at: string;
}

export interface Efeito {
  id: string;
  nome: string;
  prompt: string;
  scene_file?: string | null;
  provider_preferido?: string | null;
  ativo: boolean;
  ordem: number;
  created_at: string;
}

export interface Moldura {
  id: string;
  nome: string;
  arquivo_path: string;
  ativa: boolean;
  padrao: boolean;
  created_at: string;
}

export interface DashboardStats {
  total_sessions: number;
  sessions_hoje: number;
  total_fotos_impressas: number;
  total_clientes: number;
  eventos_agendados: number;
  orcamentos_abertos: number;
  receita_total_orcamentos_aprovados: number;
  sessions_por_status: Record<string, number>;
  fila_offline: number;
}

export interface SessionAdmin {
  id: string;
  totem_id: string;
  people_count: number;
  status: string;
  error_message?: string | null;
  evento_id?: string | null;
  cliente_id?: string | null;
  created_at: string;
  results: string[];
  effect_names: string[];
  printed: boolean;
}

export interface AdminUser {
  id: string;
  nome: string;
  email: string;
  role: string;
}

// ---------------------------------------------------------------------------
// Fluxo do totem
// ---------------------------------------------------------------------------

export const photoboothApi = {
  createSession: async (peopleCount: 1 | 2): Promise<SessionStatusResponse> => {
    const { data } = await api.post("/api/session", { people_count: peopleCount });
    return data;
  },

  uploadPhoto: async (sessionId: string, blob: Blob): Promise<SessionStatusResponse> => {
    const formData = new FormData();
    formData.append("file", blob, "capture.jpg");
    const { data } = await api.post(`/api/session/${sessionId}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  getStatus: async (sessionId: string): Promise<SessionStatusResponse> => {
    const { data } = await api.get(`/api/session/${sessionId}/status`);
    return data;
  },

  getResults: async (sessionId: string): Promise<ResultsResponse> => {
    const { data } = await api.get(`/api/session/${sessionId}/results`);
    return data;
  },

  chooseImage: async (sessionId: string, chosenIndex: number): Promise<SessionStatusResponse> => {
    const { data } = await api.post(`/api/session/${sessionId}/choose`, { chosen_index: chosenIndex });
    return data;
  },

  getQrCode: async (sessionId: string): Promise<QRCodeResponse> => {
    const { data } = await api.get(`/api/session/${sessionId}/qr`);
    return data;
  },

  getPrinterStatus: async () => {
    const { data } = await api.get(`/api/printer/status`);
    return data;
  },

  getEfeitos: async (): Promise<EfeitoPublico[]> => {
    const { data } = await api.get("/api/efeitos");
    return data;
  },

  getMolduras: async (): Promise<MolduraPublica[]> => {
    const { data } = await api.get("/api/molduras");
    return data;
  },
};

// ---------------------------------------------------------------------------
// Painel administrativo / CRM
// ---------------------------------------------------------------------------

export const adminApi = {
  // --- Autenticação ---
  login: async (email: string, password: string) => {
    const { data } = await api.post("/api/admin/auth/login", { email, password });
    localStorage.setItem("vive_admin_token", data.access_token);
    localStorage.setItem("vive_admin_user", JSON.stringify(data.user));
    return data as { access_token: string; user: AdminUser };
  },
  logout: () => {
    localStorage.removeItem("vive_admin_token");
    localStorage.removeItem("vive_admin_user");
  },
  me: async (): Promise<AdminUser> => {
    const { data } = await api.get("/api/admin/auth/me");
    return data;
  },
  isAuthenticated: () => !!localStorage.getItem("vive_admin_token"),

  // --- Clientes ---
  listarClientes: async (q?: string): Promise<Cliente[]> => {
    const { data } = await api.get("/api/admin/clientes", { params: q ? { q } : {} });
    return data;
  },
  criarCliente: async (payload: Partial<ClienteInput>): Promise<Cliente> => {
    const { data } = await api.post("/api/admin/clientes", payload);
    return data;
  },
  atualizarCliente: async (id: string, payload: Partial<ClienteInput>): Promise<Cliente> => {
    const { data } = await api.put(`/api/admin/clientes/${id}`, payload);
    return data;
  },
  removerCliente: async (id: string): Promise<void> => {
    await api.delete(`/api/admin/clientes/${id}`);
  },

  // --- Eventos ---
  listarEventos: async (params?: { status?: string; cliente_id?: string }): Promise<Evento[]> => {
    const { data } = await api.get("/api/admin/eventos", { params });
    return data;
  },
  criarEvento: async (payload: Partial<Evento>): Promise<Evento> => {
    const { data } = await api.post("/api/admin/eventos", payload);
    return data;
  },
  atualizarEvento: async (id: string, payload: Partial<Evento>): Promise<Evento> => {
    const { data } = await api.put(`/api/admin/eventos/${id}`, payload);
    return data;
  },
  removerEvento: async (id: string): Promise<void> => {
    await api.delete(`/api/admin/eventos/${id}`);
  },

  // --- Orçamentos ---
  listarOrcamentos: async (status?: string): Promise<Orcamento[]> => {
    const { data } = await api.get("/api/admin/orcamentos", { params: status ? { status } : {} });
    return data;
  },
  criarOrcamento: async (payload: {
    cliente_id: string; titulo: string; data_evento_prevista?: string;
    validade?: string; observacoes?: string; itens: ItemOrcamento[];
  }): Promise<Orcamento> => {
    const { data } = await api.post("/api/admin/orcamentos", payload);
    return data;
  },
  atualizarOrcamento: async (id: string, payload: Partial<Orcamento>): Promise<Orcamento> => {
    const { data } = await api.put(`/api/admin/orcamentos/${id}`, payload);
    return data;
  },
  converterOrcamentoEmEvento: async (id: string): Promise<Evento> => {
    const { data } = await api.post(`/api/admin/orcamentos/${id}/converter-em-evento`);
    return data;
  },
  removerOrcamento: async (id: string): Promise<void> => {
    await api.delete(`/api/admin/orcamentos/${id}`);
  },

  // --- Efeitos de IA ---
  listarEfeitos: async (): Promise<Efeito[]> => {
    const { data } = await api.get("/api/admin/efeitos");
    return data;
  },
  criarEfeito: async (payload: Partial<Efeito>): Promise<Efeito> => {
    const { data } = await api.post("/api/admin/efeitos", payload);
    return data;
  },
  atualizarEfeito: async (id: string, payload: Partial<Efeito>): Promise<Efeito> => {
    const { data } = await api.put(`/api/admin/efeitos/${id}`, payload);
    return data;
  },
  removerEfeito: async (id: string): Promise<void> => {
    await api.delete(`/api/admin/efeitos/${id}`);
  },
  uploadCenaEfeito: async (id: string, file: File): Promise<Efeito> => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post(`/api/admin/efeitos/${id}/scene`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  // --- Molduras ---
  listarMoldurasAdmin: async (): Promise<Moldura[]> => {
    const { data } = await api.get("/api/admin/molduras");
    return data;
  },
  criarMoldura: async (nome: string, file: File, padrao = false): Promise<Moldura> => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post("/api/admin/molduras", formData, {
      params: { nome, padrao },
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  removerMoldura: async (id: string): Promise<void> => {
    await api.delete(`/api/admin/molduras/${id}`);
  },

  // --- Sessões / Fila / Fotos ---
  listarSessions: async (status?: string): Promise<SessionAdmin[]> => {
    const { data } = await api.get("/api/admin/sessions", { params: status ? { status } : {} });
    return data;
  },
  reprocessarSession: async (id: string): Promise<SessionAdmin> => {
    const { data } = await api.post(`/api/admin/sessions/${id}/reprocess`);
    return data;
  },

  // --- Dashboard / Relatórios ---
  getDashboardStats: async (): Promise<DashboardStats> => {
    const { data } = await api.get("/api/admin/dashboard/stats");
    return data;
  },
};

export default api;
