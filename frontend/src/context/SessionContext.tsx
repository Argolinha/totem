/**
 * Context responsável por gerenciar o estado global do fluxo do totem:
 * qual "tela" está ativa, dados da sessão atual no backend, resultados
 * gerados pela IA e a imagem escolhida.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

import {
  photoboothApi,
  MOCK_RESULT_IMAGES,
  MOCK_EFFECT_NAMES,
} from "../api/client";


/* ================================================================
   TELAS
================================================================ */

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


/* ================================================================
   EXPERIÊNCIAS
================================================================ */

export interface Experience {
  id: string;
  name: string;
  gradient: string;
}


export const EXPERIENCES: Experience[] = [

  {
    id: "cyberpunk",
    name: "Cyberpunk",
    gradient: "from-fuchsia-600 via-purple-700 to-cyan-500",
  },

  {
    id: "cartoon3d",
    name: "Cartoon 3D",
    gradient: "from-orange-400 via-amber-500 to-rose-500",
  },

  {
    id: "anos80",
    name: "Anos 80",
    gradient: "from-pink-500 via-fuchsia-500 to-indigo-500",
  },

  {
    id: "anime",
    name: "Anime",
    gradient: "from-violet-500 via-purple-500 to-pink-400",
  },

  {
    id: "pb",
    name: "Black & White",
    gradient: "from-zinc-300 via-zinc-500 to-zinc-800",
  },

  {
    id: "aquarela",
    name: "Aquarela",
    gradient: "from-sky-300 via-purple-300 to-pink-300",
  },

  {
    id: "fantasia3d",
    name: "Fantasia 3D",
    gradient: "from-indigo-500 via-purple-700 to-fuchsia-500",
  },

  {
    id: "luxo3d",
    name: "Luxo 3D",
    gradient: "from-yellow-600 via-amber-500 to-zinc-900",
  },

  {
    id: "galaxia",
    name: "Galáxia",
    gradient: "from-indigo-700 via-purple-700 to-blue-500",
  },

  {
    id: "superhero3d",
    name: "Super-herói 3D",
    gradient: "from-red-600 via-purple-700 to-blue-700",
  },

  {
    id: "popart",
    name: "Pop Art",
    gradient: "from-yellow-400 via-pink-500 to-cyan-500",
  },

  {
    id: "retro-gaming",
    name: "Retro Gaming",
    gradient: "from-green-500 via-cyan-500 to-purple-600",
  },

];


/* ================================================================
   ESTILOS / MOLDURAS
================================================================ */

/*
 * A partir de agora "moldura" representa o estilo visual escolhido.
 *
 * Não usamos mais:
 *
 *   Padrão
 *   Evento 1
 *   Evento 2
 *
 * Nem bordas CSS para representar os estilos.
 *
 * Cada item corresponde a uma imagem gerada pela IA.
 */

export interface Frame {
  id: string;
  name: string;
}


export const FRAMES: Frame[] = [

  {
    id: "cartoon3d",
    name: "Cartoon 3D",
  },

  {
    id: "anime",
    name: "Anime",
  },

  {
    id: "anos80",
    name: "Anos 80",
  },

  {
    id: "black-white",
    name: "Black & White",
  },

  {
    id: "aquarela",
    name: "Aquarela",
  },

  {
    id: "cyberpunk",
    name: "Cyberpunk",
  },

  {
    id: "fantasia3d",
    name: "Fantasia 3D",
  },

  {
    id: "luxo3d",
    name: "Luxo 3D",
  },

  {
    id: "galaxia",
    name: "Galáxia",
  },

  {
    id: "superhero3d",
    name: "Super-herói 3D",
  },

  {
    id: "popart",
    name: "Pop Art",
  },

  {
    id: "retro-gaming",
    name: "Retro Gaming",
  },

];


/* ================================================================
   OPÇÕES DE SAÍDA
================================================================ */

export type OutputOption =
  | "print"
  | "qr"
  | "both";


/* ================================================================
   CONTEXT VALUE
================================================================ */

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


  /*
   * Seleciona uma das imagens geradas.
   */
  selectFrame: (index: number) => Promise<void>;


  outputOption: OutputOption | null;

  setOutputOption: (opt: OutputOption) => void;


  errorMessage: string | null;


  startSession: (
    peopleCount: 1 | 2
  ) => Promise<string>;


  submitPhoto: (
    sessionId: string,
    blob: Blob
  ) => Promise<void>;


  pollUntilReady: (
    sessionId: string
  ) => Promise<void>;


  chooseResult: (
    index: number
  ) => Promise<void>;


  resetFlow: () => void;


  devJumpToScreen: (
    target: Screen
  ) => void;

}


/* ================================================================
   CONTEXT
================================================================ */

const SessionContext =
  createContext<SessionContextValue | undefined>(
    undefined
  );


/* ================================================================
   CONFIGURAÇÃO DO POLLING
================================================================ */

const POLL_INTERVAL_MS = 2000;

/*
 * Agora temos mais estilos de IA.
 * Aumentamos a tolerância para evitar timeout enquanto
 * várias imagens são geradas.
 */
const POLL_TIMEOUT_MS = 120000;


/* ================================================================
   PROVIDER
================================================================ */

export const SessionProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {

  const [screen, setScreen] =
    useState<Screen>("welcome");


  const [sessionId, setSessionId] =
    useState<string | null>(null);


  const [peopleCount, setPeopleCount] =
    useState<1 | 2>(1);


  const [experience, setExperience] =
    useState<Experience | null>(null);


  const [results, setResults] =
    useState<string[]>([]);


  const [effectNames, setEffectNames] =
    useState<string[]>([]);


  const [chosenIndex, setChosenIndex] =
    useState<number | null>(null);


  const [selectedFrame, setSelectedFrame] =
    useState<Frame>(FRAMES[0]);


  const [outputOption, setOutputOption] =
    useState<OutputOption | null>(null);


  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);


  /* ==============================================================
     CRIAR SESSÃO
  ============================================================== */

  const startSession = useCallback(
    async (count: 1 | 2) => {

      const session =
        await photoboothApi.createSession(count);

      setSessionId(session.id);

      setPeopleCount(count);

      return session.id as string;
    },
    []
  );


  /* ==============================================================
     ENVIAR FOTO
  ============================================================== */

  const submitPhoto = useCallback(
    async (
      sid: string,
      blob: Blob
    ) => {

      setScreen("processing");

      await photoboothApi.uploadPhoto(
        sid,
        blob
      );
    },
    []
  );


  /* ==============================================================
     POLLING
  ============================================================== */

  const pollUntilReady = useCallback(
    async (sid: string) => {

      const startedAt =
        Date.now();


      return new Promise<void>(
        (resolve, reject) => {

          const interval =
            setInterval(async () => {

              try {

                const status =
                  await photoboothApi.getStatus(
                    sid
                  );


                /* ------------------------------------------------
                   PROCESSAMENTO CONCLUÍDO
                ------------------------------------------------ */

                if (
                  status.status ===
                  "ready"
                ) {

                  clearInterval(
                    interval
                  );


                  const res =
                    await photoboothApi.getResults(
                      sid
                    );


                  setResults(
                    res.results
                  );


                  setEffectNames(
                    res.effect_names
                  );


                  /*
                   * Seleciona automaticamente o primeiro
                   * resultado inicialmente.
                   */

                  if (
                    res.results.length >
                    0
                  ) {

                    setChosenIndex(0);

                    const firstName =
                      res.effect_names?.[0] ||
                      "Cartoon 3D";


                    setSelectedFrame({
                      id: firstName
                        .toLowerCase()
                        .replace(/\s+/g, "-"),
                      name: firstName,
                    });
                  }


                  setScreen(
                    "results"
                  );


                  resolve();

                  return;
                }


                /* ------------------------------------------------
                   ERRO
                ------------------------------------------------ */

                if (
                  status.status ===
                  "error"
                ) {

                  clearInterval(
                    interval
                  );


                  setErrorMessage(
                    status.error_message ||
                      "Ocorreu um erro no processamento."
                  );


                  setScreen(
                    "error"
                  );


                  reject(
                    new Error(
                      status.error_message ||
                        "Erro no processamento"
                    )
                  );

                  return;
                }


                /* ------------------------------------------------
                   TIMEOUT
                ------------------------------------------------ */

                if (
                  Date.now() -
                    startedAt >
                  POLL_TIMEOUT_MS
                ) {

                  clearInterval(
                    interval
                  );


                  setErrorMessage(
                    status.status ===
                      "queued_offline"
                      ? "Sem conexão com a internet no momento. Sua foto foi salva e será processada assim que a conexão voltar."
                      : "O processamento está demorando mais que o esperado."
                  );


                  setScreen(
                    "error"
                  );


                  reject(
                    new Error(
                      "timeout"
                    )
                  );
                }

              } catch (err) {

                clearInterval(
                  interval
                );


                setErrorMessage(
                  "Não foi possível consultar o status da sessão."
                );


                setScreen(
                  "error"
                );


                reject(err);
              }

            }, POLL_INTERVAL_MS);

          }
        );
    },
    []
  );


  /* ==============================================================
     ESCOLHER RESULTADO INICIAL
  ============================================================== */

  const chooseResult =
    useCallback(
      async (index: number) => {

        if (!sessionId) {
          return;
        }


        if (
          index < 0 ||
          index >= results.length
        ) {
          return;
        }


        setChosenIndex(index);


        const effectName =
          effectNames[index] ||
          `Estilo ${index + 1}`;


        setSelectedFrame({
          id: effectName
            .toLowerCase()
            .replace(/\s+/g, "-"),
          name: effectName,
        });


        await photoboothApi.chooseImage(
          sessionId,
          index
        );


        setScreen(
          "frame-select"
        );
      },
      [
        sessionId,
        results.length,
        effectNames,
      ]
    );


  /* ==============================================================
     SELECIONAR ESTILO / MOLDURA
  ============================================================== */

  const selectFrame =
    useCallback(
      async (index: number) => {

        if (!sessionId) {
          return;
        }


        if (
          index < 0 ||
          index >= results.length
        ) {
          return;
        }


        const effectName =
          effectNames[index] ||
          `Estilo ${index + 1}`;


        setChosenIndex(
          index
        );


        setSelectedFrame({
          id: effectName
            .toLowerCase()
            .replace(/\s+/g, "-"),
          name: effectName,
        });


        /*
         * Informa ao backend qual imagem foi escolhida.
         */

        try {

          await photoboothApi.chooseImage(
            sessionId,
            index
          );

        } catch (error) {

          console.error(
            "Erro ao selecionar estilo:",
            error
          );

        }

      },
      [
        sessionId,
        results.length,
        effectNames,
      ]
    );


  /* ==============================================================
     MODO DEV
  ============================================================== */

  const devJumpToScreen =
    useCallback(
      (target: Screen) => {

        setSessionId(
          (prev) =>
            prev ??
            `dev-mock-${Math.random()
              .toString(36)
              .slice(2, 10)}`
        );


        setExperience(
          (prev) =>
            prev ??
            EXPERIENCES[0]
        );


        const needsResults: Screen[] =
          [
            "results",
            "frame-select",
            "final-preview",
            "output-options",
            "printing",
            "qr",
            "thank-you",
          ];


        if (
          needsResults.includes(
            target
          )
        ) {

          setResults(
            (prev) =>
              prev.length > 0
                ? prev
                : MOCK_RESULT_IMAGES
          );


          setEffectNames(
            (prev) =>
              prev.length > 0
                ? prev
                : MOCK_EFFECT_NAMES
          );
        }


        const needsChosen: Screen[] =
          [
            "frame-select",
            "final-preview",
            "output-options",
            "printing",
            "qr",
            "thank-you",
          ];


        if (
          needsChosen.includes(
            target
          )
        ) {

          setChosenIndex(
            (prev) =>
              prev ?? 0
          );


          setSelectedFrame(
            FRAMES[0]
          );
        }


        const needsOutput: Screen[] =
          [
            "printing",
            "qr",
            "thank-you",
          ];


        if (
          needsOutput.includes(
            target
          )
        ) {

          setOutputOption(
            (prev) =>
              prev ?? "both"
          );
        }


        if (
          target ===
          "error"
        ) {

          setErrorMessage(
            (prev) =>
              prev ??
              "Erro simulado para fins de teste (dados mocados)."
          );
        }


        setScreen(
          target
        );

      },
      []
    );


  /* ==============================================================
     RESET
  ============================================================== */

  const resetFlow =
    useCallback(
      () => {

        setScreen(
          "welcome"
        );


        setSessionId(
          null
        );


        setPeopleCount(
          1
        );


        setExperience(
          null
        );


        setResults(
          []
        );


        setEffectNames(
          []
        );


        setChosenIndex(
          null
        );


        setSelectedFrame(
          FRAMES[0]
        );


        setOutputOption(
          null
        );


        setErrorMessage(
          null
        );

      },
      []
    );


  /* ==============================================================
     PROVIDER
  ============================================================== */

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


        selectFrame,


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


/* ================================================================
   HOOK
================================================================ */

export function useSessionContext(): SessionContextValue {

  const ctx =
    useContext(
      SessionContext
    );


  if (!ctx) {

    throw new Error(
      "useSessionContext deve ser usado dentro de um SessionProvider"
    );

  }


  return ctx;
}