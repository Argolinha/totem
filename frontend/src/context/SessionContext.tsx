/**
 * Context responsável por gerenciar o estado global do fluxo do totem:
 * qual "tela" está ativa, dados da sessão atual no backend, resultados
 * gerados pela IA e a imagem escolhida. Evita prop-drilling entre os
 * componentes de cada etapa do fluxo.
 */
import React, { createContext, useCallback, useContext, useState } from "react";
import { photoboothApi, MOCK_RESULT_IMAGES, MOCK_EFFECT_NAMES } from "../api/client";

export type Screen =
  | "welcome"
  | "experience-select"
  | "people-select"
  | "camera"
  | "processing"
  | "results"
  | "frame-select"
  | "final-preview"
  | "output-options"
  | "printing"
  | "qr"
  | "thank-you"
  | "error";

export interface Experience {
  id: string;
  name: string;
  gradient: string; // classes tailwind para o preview do card
}

export const EXPERIENCES: Experience[] = [
  { id: "cyberpunk", name: "Cyberpunk", gradient: "from-fuchsia-600 via-purple-700 to-cyan-500" },
  { id: "cartoon3d", name: "Cartoon 3D", gradient: "from-orange-400 via-amber-500 to-rose-500" },
  { id: "anos80", name: "Anos 80", gradient: "from-pink-500 via-fuchsia-500 to-indigo-500" },
  { id: "anime", name: "Anime", gradient: "from-violet-500 via-purple-500 to-pink-400" },
  { id: "pb", name: "Black & White", gradient: "from-zinc-300 via-zinc-500 to-zinc-800" },
  { id: "aquarela", name: "Aquarela", gradient: "from-sky-300 via-purple-300 to-pink-300" },
];

export interface Frame {
  id: string;
  name: string;
}

export const FRAMES: Frame[] = [
  { id: "padrao", name: "Padrão" },
  { id: "evento1", name: "Evento 1" },
  { id: "evento2", name: "Evento 2" },
];

export type OutputOption = "print" | "qr" | "both";

interface SessionContextValue {
  screen: Screen;
  setScreen: (screen: Screen) => void;

  sessionId: string | null;
  peopleCount: 1 | 2;
  setPeopleCount: (n: 1 | 2) => void;

  experience: Experience | null;
  setExperience: (exp: Experience) => void;

  results: string[];
  effectNames: string[];
  chosenIndex: number | null;

  selectedFrame: Frame;
  setSelectedFrame: (frame: Frame) => void;

  outputOption: OutputOption | null;
  setOutputOption: (opt: OutputOption) => void;

  errorMessage: string | null;

  startSession: (peopleCount: 1 | 2) => Promise<string>;
  submitPhoto: (sessionId: string, blob: Blob) => Promise<void>;
  pollUntilReady: (sessionId: string) => Promise<void>;
  chooseResult: (index: number) => Promise<void>;
  resetFlow: () => void;

  /**
   * Atalho de desenvolvimento: preenche o estado da sessão com dados
   * mocados suficientes para qualquer tela renderizar corretamente e
   * navega direto para ela, sem precisar passar pelo fluxo completo
   * (câmera, polling, impressão etc). Só deve ser exposto/usado em
   * modo mock/dev.
   */
  devJumpToScreen: (target: Screen) => void;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 60000; // 60s de tolerância para a geração das 6 imagens

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [peopleCount, setPeopleCount] = useState<1 | 2>(1);
  const [experience, setExperience] = useState<Experience | null>(null);
  const [results, setResults] = useState<string[]>([]);
  const [effectNames, setEffectNames] = useState<string[]>([]);
  const [chosenIndex, setChosenIndex] = useState<number | null>(null);
  const [selectedFrame, setSelectedFrame] = useState<Frame>(FRAMES[0]);
  const [outputOption, setOutputOption] = useState<OutputOption | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const startSession = useCallback(async (count: 1 | 2) => {
    const session = await photoboothApi.createSession(count);
    setSessionId(session.id);
    setPeopleCount(count);
    return session.id as string;
  }, []);

  const submitPhoto = useCallback(async (sid: string, blob: Blob) => {
    setScreen("processing");
    await photoboothApi.uploadPhoto(sid, blob);
  }, []);

  /**
   * Faz polling do status da sessão até que os 6 resultados estejam
   * prontos (status "ready"), tratando também os casos de fila offline
   * e erro, mantendo o usuário informado durante toda a espera.
   */
  const pollUntilReady = useCallback(async (sid: string) => {
    const startedAt = Date.now();

    return new Promise<void>((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          const status = await photoboothApi.getStatus(sid);

          if (status.status === "ready") {
            clearInterval(interval);
            const res = await photoboothApi.getResults(sid);
            setResults(res.results);
            setEffectNames(res.effect_names);
            setScreen("results");
            resolve();
            return;
          }

          if (status.status === "error") {
            clearInterval(interval);
            setErrorMessage(status.error_message || "Ocorreu um erro no processamento.");
            setScreen("error");
            reject(new Error(status.error_message || "Erro no processamento"));
            return;
          }

          if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
            clearInterval(interval);
            setErrorMessage(
              status.status === "queued_offline"
                ? "Sem conexão com a internet no momento. Sua foto foi salva e será processada assim que a conexão voltar."
                : "O processamento está demorando mais que o esperado."
            );
            setScreen("error");
            reject(new Error("timeout"));
          }
          // Caso contrário (uploaded/queued_offline/processing) continua aguardando
        } catch (err) {
          clearInterval(interval);
          setErrorMessage("Não foi possível consultar o status da sessão.");
          setScreen("error");
          reject(err);
        }
      }, POLL_INTERVAL_MS);
    });
  }, []);

  const chooseResult = useCallback(
    async (index: number) => {
      if (!sessionId) return;
      setChosenIndex(index);
      await photoboothApi.chooseImage(sessionId, index);
      setScreen("frame-select");
    },
    [sessionId]
  );

  const devJumpToScreen = useCallback(
    (target: Screen) => {
      // Garante uma sessão mocada.
      setSessionId((prev) => prev ?? `dev-mock-${Math.random().toString(36).slice(2, 10)}`);

      // Garante experiência escolhida.
      setExperience((prev) => prev ?? EXPERIENCES[0]);

      // Telas a partir de "results" precisam de resultados + nomes de efeito.
      const needsResults: Screen[] = [
        "results",
        "frame-select",
        "final-preview",
        "output-options",
        "printing",
        "qr",
        "thank-you",
      ];
      if (needsResults.includes(target)) {
        setResults((prev) => (prev.length > 0 ? prev : MOCK_RESULT_IMAGES));
        setEffectNames((prev) => (prev.length > 0 ? prev : MOCK_EFFECT_NAMES));
      }

      // Telas a partir de "frame-select" precisam de uma imagem escolhida.
      const needsChosen: Screen[] = ["frame-select", "final-preview", "output-options", "printing", "qr", "thank-you"];
      if (needsChosen.includes(target)) {
        setChosenIndex((prev) => prev ?? 0);
      }

      // Telas a partir de "printing"/"qr" precisam de uma opção de saída.
      const needsOutput: Screen[] = ["printing", "qr", "thank-you"];
      if (needsOutput.includes(target)) {
        setOutputOption((prev) => prev ?? "both");
      }

      if (target === "error") {
        setErrorMessage((prev) => prev ?? "Erro simulado para fins de teste (dados mocados).");
      }

      setScreen(target);
    },
    []
  );

  const resetFlow = useCallback(() => {
    setScreen("welcome");
    setSessionId(null);
    setPeopleCount(1);
    setExperience(null);
    setResults([]);
    setEffectNames([]);
    setChosenIndex(null);
    setSelectedFrame(FRAMES[0]);
    setOutputOption(null);
    setErrorMessage(null);
  }, []);

  return (
    <SessionContext.Provider
      value={{
        screen,
        setScreen,
        sessionId,
        peopleCount,
        setPeopleCount,
        experience,
        setExperience,
        results,
        effectNames,
        chosenIndex,
        selectedFrame,
        setSelectedFrame,
        outputOption,
        setOutputOption,
        errorMessage,
        startSession,
        submitPhoto,
        pollUntilReady,
        chooseResult,
        resetFlow,
        devJumpToScreen,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export function useSessionContext(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSessionContext deve ser usado dentro de um SessionProvider");
  return ctx;
}
