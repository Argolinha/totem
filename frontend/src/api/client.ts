/**
 * Cliente HTTP centralizado (Axios) para comunicação com o backend
 * FastAPI. Todas as rotas da API ficam encapsuladas aqui, para que os
 * componentes não precisem conhecer os endpoints diretamente.
 *
 * Suporta modo mockado via VITE_USE_MOCK_API=true (não bate no backend real).
 */
import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === "true";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

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

// ---------------------------------------------------------------------------
// Mock helpers
// ---------------------------------------------------------------------------

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const MOCK_EFFECT_NAMES = ["Cyberpunk", "Aquarela", "Anos 80", "Cartoon 3D", "Preto e Branco Dramático", "Vitral"];

// Placeholder images (troque pelas suas próprias, ou use as geradas no backend)
export const MOCK_RESULT_IMAGES = Array.from(
  { length: 6 },
  (_, i) => `https://picsum.photos/seed/vive-ai-${i}/600/800`
);

interface MockSession {
  id: string;
  status: string;
  peopleCount: 1 | 2;
  chosenIndex?: number;
}

const mockSessions = new Map<string, MockSession>();

function genSessionId(): string {
  return `mock-${Math.random().toString(36).slice(2, 10)}`;
}

const mockApi = {
  createSession: async (peopleCount: 1 | 2): Promise<SessionStatusResponse> => {
    await delay(300);
    const id = genSessionId();
    mockSessions.set(id, { id, status: "created", peopleCount });
    return { id, status: "created", error_message: null, printer_status: null };
  },

  uploadPhoto: async (sessionId: string, _blob: Blob): Promise<SessionStatusResponse> => {
    await delay(500);
    const session = mockSessions.get(sessionId);
    if (!session) throw new Error(`Mock session ${sessionId} não encontrada`);
    session.status = "processing";
    // Simula pipeline assíncrono: depois de um tempo, marca como pronto
    setTimeout(() => {
      const s = mockSessions.get(sessionId);
      if (s) s.status = "ready";
    }, 2500);
    return { id: session.id, status: session.status, error_message: null, printer_status: null };
  },

  getStatus: async (sessionId: string): Promise<SessionStatusResponse> => {
    await delay(200);
    const session = mockSessions.get(sessionId);
    if (!session) throw new Error(`Mock session ${sessionId} não encontrada`);
    return { id: session.id, status: session.status, error_message: null, printer_status: null };
  },

  getResults: async (sessionId: string): Promise<ResultsResponse> => {
    await delay(400);
    const session = mockSessions.get(sessionId);
    if (!session) throw new Error(`Mock session ${sessionId} não encontrada`);
    return {
      session_id: session.id,
      status: session.status,
      results: MOCK_RESULT_IMAGES,
      effect_names: MOCK_EFFECT_NAMES,
    };
  },

  chooseImage: async (sessionId: string, chosenIndex: number): Promise<SessionStatusResponse> => {
    await delay(300);
    const session = mockSessions.get(sessionId);
    if (!session) throw new Error(`Mock session ${sessionId} não encontrada`);
    session.chosenIndex = chosenIndex;
    session.status = "printing";
    setTimeout(() => {
      const s = mockSessions.get(sessionId);
      if (s) s.status = "done";
    }, 2000);
    return { id: session.id, status: session.status, error_message: null, printer_status: "printing" };
  },

  getQrCode: async (sessionId: string): Promise<QRCodeResponse> => {
    await delay(300);
    return {
      download_url: `https://example.com/download/${sessionId}`,
      token: `mock-token-${sessionId}`,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    };
  },
};

// ---------------------------------------------------------------------------
// Real API (Axios)
// ---------------------------------------------------------------------------

const realApi = {
  createSession: async (peopleCount: 1 | 2) => {
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
};

export const photoboothApi = USE_MOCK ? mockApi : realApi;

export default api;