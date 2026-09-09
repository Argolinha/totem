import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Configuração padrão do Vite para React + TypeScript.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // permite acesso via IP na rede local (útil para testar no totem)
  },
});
