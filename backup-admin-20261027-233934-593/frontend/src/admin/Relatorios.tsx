import { useMemo, useState } from "react";
import Layout from "./layout";

interface RelatorioEvento {
  id: number;
  evento: string;
  data: string;
  fotos: number;
  impressoes: number;
  efeitos: number;
  status: "Concluído" | "Em andamento";
}

const dadosIniciais: RelatorioEvento[] = [
  {
    id: 1,
    evento: "Casamento Ana & Lucas",
    data: "10/09/2026",
    fotos: 248,
    impressoes: 198,
    efeitos: 86,
    status: "Concluído",
  },
  {
    id: 2,
    evento: "Aniversário 15 anos",
    data: "07/09/2026",
    fotos: 186,
    impressoes: 151,
    efeitos: 64,
    status: "Concluído",
  },
  {
    id: 3,
    evento: "Evento Corporativo",
    data: "03/09/2026",
    fotos: 312,
    impressoes: 276,
    efeitos: 109,
    status: "Concluído",
  },
  {
    id: 4,
    evento: "Festa de Formatura",
    data: "30/08/2026",
    fotos: 174,
    impressoes: 143,
    efeitos: 51,
    status: "Concluído",
  },
  {
    id: 5,
    evento: "Festival de Verão",
    data: "25/08/2026",
    fotos: 421,
    impressoes: 367,
    efeitos: 182,
    status: "Em andamento",
  },
];

export default function Relatorios() {
  const [periodo, setPeriodo] = useState("30");
  const [dados] = useState<RelatorioEvento[]>(dadosIniciais);
  const [exportando, setExportando] = useState(false);

  const totais = useMemo(() => {
    return dados.reduce(
      (acc, item) => ({
        eventos: acc.eventos + 1,
        fotos: acc.fotos + item.fotos,
        impressoes: acc.impressoes + item.impressoes,
        efeitos: acc.efeitos + item.efeitos,
      }),
      {
        eventos: 0,
        fotos: 0,
        impressoes: 0,
        efeitos: 0,
      }
    );
  }, [dados]);

  const taxaImpressao =
    totais.fotos > 0
      ? Math.round((totais.impressoes / totais.fotos) * 100)
      : 0;

  const taxaEfeito =
    totais.fotos > 0
      ? Math.round((totais.efeitos / totais.fotos) * 100)
      : 0;

  const exportarRelatorio = () => {
    setExportando(true);

    setTimeout(() => {
      const cabecalho =
        "Evento,Data,Fotos,Impressoes,Efeitos,Status\n";

      const linhas = dados
        .map(
          (item) =>
            `"${item.evento}",${item.data},${item.fotos},${item.impressoes},${item.efeitos},"${item.status}"`
        )
        .join("\n");

      const csv = cabecalho + linhas;

      const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "relatorio-vive-ai.csv";
      link.click();

      URL.revokeObjectURL(url);

      setExportando(false);
    }, 500);
  };

  return (
    <Layout title="05. RELATÓRIOS" currentPath="/relatorios">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {/* CABEÇALHO */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              Relatórios
            </h2>

            <p
              style={{
                margin: "6px 0 0",
                color: "#777",
                fontSize: 14,
              }}
            >
              Acompanhe o desempenho e utilização do totem.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              style={{
                height: 42,
                padding: "0 14px",
                borderRadius: 10,
                border: "1px solid #ddd",
                background: "#fff",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
              <option value="365">Último ano</option>
            </select>

            <button
              onClick={exportarRelatorio}
              disabled={exportando}
              style={{
                height: 42,
                padding: "0 18px",
                borderRadius: 10,
                border: "none",
                background: "#111",
                color: "#fff",
                fontWeight: 600,
                cursor: exportando ? "wait" : "pointer",
              }}
            >
              {exportando ? "Exportando..." : "↓ Exportar CSV"}
            </button>
          </div>
        </div>

        {/* CARDS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: 16,
          }}
        >
          <Card
            titulo="Eventos"
            valor={totais.eventos}
            descricao={`Últimos ${periodo} dias`}
            icone="◈"
          />

          <Card
            titulo="Fotos capturadas"
            valor={totais.fotos}
            descricao="Total de fotos"
            icone="▣"
          />

          <Card
            titulo="Impressões"
            valor={totais.impressoes}
            descricao={`${taxaImpressao}% das fotos`}
            icone="▤"
          />

          <Card
            titulo="Efeitos de IA"
            valor={totais.efeitos}
            descricao={`${taxaEfeito}% das fotos`}
            icone="✦"
          />
        </div>

        {/* DESEMPENHO */}
        <section
          style={{
            background: "#fff",
            border: "1px solid #e8e8e8",
            borderRadius: 16,
            padding: 22,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: 18,
                }}
              >
                Desempenho geral
              </h3>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#777",
                  fontSize: 13,
                }}
              >
                Indicadores do período selecionado
              </p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 18,
            }}
          >
            <Indicador
              titulo="Taxa de impressão"
              valor={`${taxaImpressao}%`}
              progresso={taxaImpressao}
            />

            <Indicador
              titulo="Uso de efeitos IA"
              valor={`${taxaEfeito}%`}
              progresso={taxaEfeito}
            />

            <Indicador
              titulo="Média de fotos por evento"
              valor={
                totais.eventos > 0
                  ? `${Math.round(totais.fotos / totais.eventos)}`
                  : "0"
              }
              progresso={Math.min(
                Math.round(totais.fotos / Math.max(totais.eventos, 1) / 5),
                100
              )}
            />
          </div>
        </section>

        {/* TABELA */}
        <section
          style={{
            background: "#fff",
            border: "1px solid #e8e8e8",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "20px 22px",
              borderBottom: "1px solid #eee",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: 18,
              }}
            >
              Relatório por evento
            </h3>

            <p
              style={{
                margin: "5px 0 0",
                color: "#777",
                fontSize: 13,
              }}
            >
              Resumo de utilização em cada evento.
            </p>
          </div>

          <div
            style={{
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 760,
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#fafafa",
                  }}
                >
                  <Th>Evento</Th>
                  <Th>Data</Th>
                  <Th>Fotos</Th>
                  <Th>Impressões</Th>
                  <Th>Efeitos IA</Th>
                  <Th>Status</Th>
                </tr>
              </thead>

              <tbody>
                {dados.map((item) => (
                  <tr key={item.id}>
                    <Td>
                      <strong>{item.evento}</strong>
                    </Td>

                    <Td>{item.data}</Td>

                    <Td>{item.fotos}</Td>

                    <Td>{item.impressoes}</Td>

                    <Td>{item.efeitos}</Td>

                    <Td>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "5px 10px",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 600,
                          background:
                            item.status === "Concluído"
                              ? "#eaf8ef"
                              : "#fff4dc",
                          color:
                            item.status === "Concluído"
                              ? "#218344"
                              : "#9a6a00",
                        }}
                      >
                        {item.status}
                      </span>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* RODAPÉ */}
        <div
          style={{
            padding: 16,
            borderRadius: 12,
            background: "#f7f7f7",
            color: "#666",
            fontSize: 13,
          }}
        >
          <strong>Observação:</strong> os dados exibidos atualmente são
          demonstrativos. Quando o backend estiver conectado, estes
          indicadores serão alimentados automaticamente pelos eventos,
          fotos, efeitos e impressões reais.
        </div>
      </div>
    </Layout>
  );
}

function Card({
  titulo,
  valor,
  descricao,
  icone,
}: {
  titulo: string;
  valor: number;
  descricao: string;
  icone: string;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e8e8e8",
        borderRadius: 16,
        padding: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <span
          style={{
            fontSize: 22,
          }}
        >
          {icone}
        </span>

        <span
          style={{
            fontSize: 12,
            color: "#999",
          }}
        >
          relatório
        </span>
      </div>

      <div
        style={{
          fontSize: 30,
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        {valor.toLocaleString("pt-BR")}
      </div>

      <div
        style={{
          marginTop: 8,
          fontWeight: 600,
          fontSize: 14,
        }}
      >
        {titulo}
      </div>

      <div
        style={{
          marginTop: 4,
          color: "#888",
          fontSize: 12,
        }}
      >
        {descricao}
      </div>
    </div>
  );
}

function Indicador({
  titulo,
  valor,
  progresso,
}: {
  titulo: string;
  valor: string;
  progresso: number;
}) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontSize: 13,
            color: "#555",
          }}
        >
          {titulo}
        </span>

        <strong>{valor}</strong>
      </div>

      <div
        style={{
          height: 8,
          background: "#eee",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${Math.min(Math.max(progresso, 0), 100)}%`,
            height: "100%",
            background: "#111",
            borderRadius: 999,
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      style={{
        textAlign: "left",
        padding: "13px 16px",
        fontSize: 12,
        color: "#777",
        fontWeight: 600,
        borderBottom: "1px solid #eee",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td
      style={{
        padding: "16px",
        fontSize: 13,
        borderBottom: "1px solid #eee",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </td>
  );
}