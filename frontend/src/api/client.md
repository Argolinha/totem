/**
 * Cliente HTTP centralizado (Axios) para comunicação com o backend
 * FastAPI. Todas as rotas da API ficam encapsuladas aqui, para que os
 * componentes não precisem conhecer os endpoints diretamente.
 */
import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

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

export const photoboothApi = {
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

export default api;
