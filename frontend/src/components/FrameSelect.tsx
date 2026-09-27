import React from "react";
import { Check, Sparkles, ArrowLeft } from "lucide-react";
import { useSessionContext } from "../context/SessionContext";

const frames = [
  {
    id: "padrao",
    name: "Padrão",
  },
  {
    id: "evento1",
    name: "Evento 1",
  },
  {
    id: "evento2",
    name: "Evento 2",
  },
];

const FrameSelect: React.FC = () => {
  const {
    selectedFrame,
    setSelectedFrame,
    setScreen,
    results,
  } = useSessionContext();

  const photoUrl = results?.[0];

  const handleContinue = () => {
    if (!selectedFrame) {
      setSelectedFrame(frames[0]);
    }

    setScreen("final-preview");
  };

  const handleBack = () => {
    setScreen("results");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0714",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <header
        style={{
          padding: "32px 48px 20px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            color: "#b8a4ff",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 2,
            marginBottom: 14,
          }}
        >
          <Sparkles size={18} />
          IA GENERATIVA
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: 36,
            fontWeight: 800,
          }}
        >
          ESCOLHA SUA MOLDURA
        </h1>

        <p
          style={{
            marginTop: 10,
            color: "#aaa3b8",
            fontSize: 16,
          }}
        >
          Escolha uma opção para finalizar sua foto.
        </p>
      </header>

      <main
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 60,
          padding: "30px 50px",
        }}
      >
        <div
          style={{
            width: 360,
            height: 480,
            borderRadius: 20,
            overflow: "hidden",
            background: "#15111f",
            border: "1px solid #30283d",
            boxShadow: "0 20px 60px rgba(0,0,0,.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {photoUrl ? (
            <img
              src={photoUrl}
              alt="Foto selecionada"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <span style={{ color: "#777" }}>
              Foto não encontrada
            </span>
          )}
        </div>

        <div
          style={{
            width: 420,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {frames.map((frame) => {
            const selected =
              selectedFrame?.id === frame.id;

            return (
              <button
                key={frame.id}
                type="button"
                onClick={() => setSelectedFrame(frame)}
                style={{
                  width: "100%",
                  padding: "22px 24px",
                  borderRadius: 16,
                  border: selected
                    ? "2px solid #a78bfa"
                    : "1px solid #342d40",
                  background: selected
                    ? "#211936"
                    : "#14101d",
                  color: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  textAlign: "left",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                    }}
                  >
                    {frame.name}
                  </div>

                  <div
                    style={{
                      marginTop: 5,
                      color: "#9991a7",
                      fontSize: 13,
                    }}
                  >
                    Aplicar esta opção à foto
                  </div>
                </div>

                {selected && (
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "#8b5cf6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Check size={19} />
                  </div>
                )}
              </button>
            );
          })}

          <button
            type="button"
            onClick={handleContinue}
            style={{
              marginTop: 12,
              width: "100%",
              padding: "18px",
              border: 0,
              borderRadius: 14,
              background: "#ffffff",
              color: "#0a0714",
              fontSize: 16,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            CONTINUAR
          </button>

          <button
            type="button"
            onClick={handleBack}
            style={{
              width: "100%",
              padding: "14px",
              border: "1px solid #352d42",
              borderRadius: 14,
              background: "transparent",
              color: "#aaa3b8",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
            }}
          >
            <ArrowLeft size={16} />
            VOLTAR
          </button>
        </div>
      </main>
    </div>
  );
};

export default FrameSelect;