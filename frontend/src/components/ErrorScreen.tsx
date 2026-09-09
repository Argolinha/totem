import React from "react";
import { useSessionContext } from "../context/SessionContext";

/** Tela exibida em caso de erro de processamento, impressão ou timeout. */
const ErrorScreen: React.FC = () => {
  const { errorMessage, resetFlow } = useSessionContext();

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 bg-red-900 p-8 text-center text-white">
      <h2 className="text-3xl font-bold">OPS! ALGO NÃO SAIU COMO ESPERADO</h2>
      <p className="max-w-xl text-lg opacity-90">
        {errorMessage || "Ocorreu um erro inesperado. Por favor, tente novamente."}
      </p>
      <button onClick={resetFlow} className="btn-touch bg-white text-red-900">
        TENTAR NOVAMENTE
      </button>
    </div>
  );
};

export default ErrorScreen;
