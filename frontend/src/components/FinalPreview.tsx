import React from "react";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
import { useSessionContext } from "../context/SessionContext";

const FinalPreview: React.FC = () => {
  const { results, selectedFrame, setScreen } = useSessionContext();

  const photoUrl =
    results && results.length > 0 ? results[0] : null;

  const handleContinue = () => {
    setScreen("output-options");
  };

  const handleBack = () => {
    setScreen("frame-select");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#0a0714",
        color: "#ffffff",
        fontFamily: "Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* CABEÇALHO */}
      <div
        style={{
          width: "100%",
          textAlign: "center",
          paddingTop: 30,
          paddingBottom: 20,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: "#b8a4ff",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 2,
          }}
        >
          <Sparkles size={18} />
          IA GENERATIVA
        </div>

        <h1
          style={{
            margin: "12px 0 0 0",
            fontSize: 36,
            fontWeight: 800,
          }}
        >
          SUA FOTO ESTÁ PRONTA
        </h1>

        <p
          style={{
            margin: "10px 0 0 0",
            color: "#aaa3b8",
            fontSize: 16,
          }}
        >
          Confira a prévia antes de finalizar.
        </p>
      </div>

      {/* CONTEÚDO */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 60,
          padding: "20px 50px 50px 50px",
        }}
      >
        {/* FOTO */}
        <div
          style={{
            position: "relative",
            width: 430,
            height: 570,
            borderRadius: 22,
            overflow: "hidden",
            backgroundColor: "#15111f",
            border: "1px solid #30283d",
            boxShadow: "0 25px 70px rgba(0,0,0,0.55)",
          }}
        >
          {photoUrl ? (
            <img
              src={photoUrl}
              alt="Prévia da foto"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#777777",
                fontSize: 16,
              }}
            >
              Foto não encontrada
            </div>
          )}

          {/* BORDA VISUAL */}
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              borderRadius: 22,
              pointerEvents: "none",
              boxSizing: "border-box",
              border:
                selectedFrame?.id === "evento1"
                  ? "16px solid #ffffff"
                  : selectedFrame?.id === "evento2"
                  ? "16px solid #8b5cf6"
                  : "8px solid rgba(255,255,255,0.85)",
            }}
          />
        </div>

        {/* PAINEL DIREITO */}
        <div
          style={{
            width: 380,
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          {/* MOLDURA */}
          <div
            style={{
              padding: 24,
              borderRadius: 18,
              backgroundColor: "#14101d",
              border: "1px solid #30283d",
            }}
          >
            <div
              style={{
                color: "#9386aa",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1.5,
                marginBottom: 8,
              }}
            >
              MOLDURA SELECIONADA
            </div>

            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
              }}
            >
              {selectedFrame?.name || "Padrão"}
            </div>
          </div>

          {/* CONTINUAR */}
          <button
            type="button"
            onClick={handleContinue}
            style={{
              width: "100%",
              padding: 19,
              border: "none",
              borderRadius: 14,
              backgroundColor: "#ffffff",
              color: "#0a0714",
              fontSize: 16,
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Check size={19} />
            CONTINUAR
          </button>

          {/* VOLTAR */}
          <button
            type="button"
            onClick={handleBack}
            style={{
              width: "100%",
              padding: 15,
              border: "1px solid #352d42",
              borderRadius: 14,
              backgroundColor: "transparent",
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
            ALTERAR MOLDURA
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinalPreview;