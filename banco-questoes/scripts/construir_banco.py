"""Constrói o banco de questões e grava CSV, XLSX e JSON em ``saida/``.

Uso:
    python scripts/construir_banco.py                  # só a fonte OAB/FGV
    python scripts/construir_banco.py --importar lote1.xlsx lote2.csv
"""
import argparse
import subprocess
import sys
from collections import Counter
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAIZ))

from banco_questoes.assuntos import atribuir_assunto  # noqa: E402
from banco_questoes.classificador import NaiveBayes, segmentar_com_tamanhos  # noqa: E402
from banco_questoes.exportar import gravar_csv, gravar_json, gravar_xlsx  # noqa: E402
from banco_questoes.fontes import oab_fgv, planilha  # noqa: E402
from banco_questoes.schema import chave_duplicidade, normalizar_questao, validar_questao  # noqa: E402

# Distribuição de questões por disciplina no edital (1ª fase, 80 questões)
TAMANHOS_EDITAL_80 = [10, 2, 7, 3, 2, 4, 6, 2, 7, 2, 2, 5, 6, 6, 5, 6, 5]


def obter_fonte_oab(cache: Path) -> Path:
    destino = cache / "oab-exams"
    if not destino.exists():
        cache.mkdir(parents=True, exist_ok=True)
        subprocess.run(["git", "clone", "--depth", "1", oab_fgv.REPO_URL, str(destino)], check=True)
    return destino / "official" / "raw"


def _texto(q: dict) -> str:
    return q["enunciado"] + " " + " ".join(q["alternativas"].values())


def questoes_oab(pasta_raw: Path) -> list:
    provas = oab_fgv.ler_provas(pasta_raw)
    rotuladas = [q for p in provas for q in p if q["areas"]]
    nb = NaiveBayes().treinar([_texto(q) for q in rotuladas], [q["areas"][0] for q in rotuladas])
    saida = []
    for prova in provas:
        sem_rotulo = sum(1 for q in prova if not q["areas"])
        if sem_rotulo:
            # Prova (total ou parcialmente) sem rótulo: infere pelo texto + ordem do caderno
            fixos = {i: q["areas"][0] for i, q in enumerate(prova) if q["areas"]}
            scores = [nb.log_prob(_texto(q)) for q in prova]
            inferidas = segmentar_com_tamanhos(scores, oab_fgv.AREAS, TAMANHOS_EDITAL_80, peso=1.0, fixos=fixos)
            for q, a in zip(prova, inferidas):
                q["area_final"] = a
        else:
            for q in prova:
                q["area_final"] = q["areas"][0]
        for q in prova:
            if q["anulada"] or not q["gabarito"]:
                continue
            disciplina = oab_fgv.DISCIPLINAS[q["area_final"]]
            saida.append(
                {
                    "Banca": "FGV",
                    "Orgao": "OAB",
                    "Ano": str(q["ano"]),
                    "Disciplina": disciplina,
                    "Assunto": atribuir_assunto(disciplina, _texto(q)),
                    "Enunciado": q["enunciado"],
                    "Alternativa_A": q["alternativas"].get("A", ""),
                    "Alternativa_B": q["alternativas"].get("B", ""),
                    "Alternativa_C": q["alternativas"].get("C", ""),
                    "Alternativa_D": q["alternativas"].get("D", ""),
                    "Alternativa_E": q["alternativas"].get("E", ""),
                    "Gabarito": q["gabarito"],
                    "Comentario_Professor": "",
                }
            )
    return saida


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--importar", nargs="*", default=[], help="arquivos CSV/XLSX/JSON extras (13 colunas)")
    ap.add_argument("--sem-oab", action="store_true", help="não incluir a fonte OAB/FGV")
    ap.add_argument("--oab-raw", type=Path, help="pasta official/raw já baixada (evita o git clone)")
    ap.add_argument("--saida", type=Path, default=RAIZ / "saida")
    ap.add_argument("--nome", default="banco_questoes")
    ap.add_argument("--bom", action="store_true", help="grava o CSV com BOM (abre direto no Excel)")
    args = ap.parse_args()

    brutas = []
    if not args.sem_oab:
        raw = args.oab_raw or obter_fonte_oab(RAIZ / ".cache")
        brutas += questoes_oab(raw)
    for arq in args.importar:
        brutas += planilha.ler(Path(arq))

    validas, rejeitadas, vistas = [], Counter(), set()
    for q in brutas:
        q = normalizar_questao(q)
        erros = validar_questao(q)
        if erros:
            rejeitadas[erros[0]] += 1
            continue
        chave = chave_duplicidade(q)
        if chave in vistas:
            rejeitadas["duplicada"] += 1
            continue
        vistas.add(chave)
        validas.append(q)

    validas.sort(key=lambda q: (q["Banca"], q["Orgao"], q["Ano"], q["Disciplina"], q["Assunto"]))
    args.saida.mkdir(parents=True, exist_ok=True)
    base = args.saida / args.nome
    gravar_csv(validas, base.with_suffix(".csv"), bom=args.bom)
    gravar_xlsx(validas, base.with_suffix(".xlsx"))
    gravar_json(validas, base.with_suffix(".json"))

    print(f"Questões lidas: {len(brutas)} | válidas: {len(validas)} | rejeitadas: {sum(rejeitadas.values())}")
    for motivo, n in rejeitadas.most_common():
        print(f"  - {motivo}: {n}")
    print("Por disciplina:")
    for d, n in Counter(q["Disciplina"] for q in validas).most_common():
        print(f"  {n:6d}  {d}")
    print(f"Arquivos: {base}.csv / .xlsx / .json")


if __name__ == "__main__":
    main()
