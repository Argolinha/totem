"""Leitor das provas objetivas do Exame de Ordem Unificado (OAB/FGV).

Fonte: https://github.com/legal-nlp/oab-exams (licença MIT), pasta
``official/raw``: transcrição das provas "tipo 1 - branca" com o gabarito
oficial marcado em cada questão (``D:CORRECT)``) e anulações (``NULL``).
"""
import re
from pathlib import Path

REPO_URL = "https://github.com/legal-nlp/oab-exams"

# Ordem fixa das disciplinas no caderno de prova da 1ª fase.
AREAS = [
    "ETHICS",
    "PHILOSOPHY",
    "CONSTITUTIONAL",
    "HUMAN-RIGHTS",
    "INTERNATIONAL",
    "TAXES",
    "ADMINISTRATIVE",
    "ENVIRONMENTAL",
    "CIVIL",
    "CHILDREN",
    "CONSUMER",
    "BUSINESS",
    "CIVIL-PROCEDURE",
    "CRIMINAL",
    "CRIMINAL-PROCEDURE",
    "LABOUR",
    "LABOUR-PROCEDURE",
]
DISCIPLINAS = {
    "ETHICS": "Ética Profissional",
    "PHILOSOPHY": "Filosofia do Direito",
    "CONSTITUTIONAL": "Direito Constitucional",
    "HUMAN-RIGHTS": "Direitos Humanos",
    "INTERNATIONAL": "Direito Internacional",
    "TAXES": "Direito Tributário",
    "ADMINISTRATIVE": "Direito Administrativo",
    "ENVIRONMENTAL": "Direito Ambiental",
    "CIVIL": "Direito Civil",
    "CHILDREN": "Estatuto da Criança e do Adolescente",
    "CONSUMER": "Direito do Consumidor",
    "BUSINESS": "Direito Empresarial",
    "CIVIL-PROCEDURE": "Direito Processual Civil",
    "CRIMINAL": "Direito Penal",
    "CRIMINAL-PROCEDURE": "Direito Processual Penal",
    "LABOUR": "Direito do Trabalho",
    "LABOUR-PROCEDURE": "Direito Processual do Trabalho",
}
_CORRECAO_AREA = {"PHILOSHOPY": "PHILOSOPHY"}

_CABECALHO = re.compile(r"^Questão\s+(\d+)\s*(NULL)?\s*$", re.M)
_OPCAO = re.compile(r"^([A-E])(:CORRECT)?\)\s?", re.M)
_ARQUIVO = re.compile(r"(\d{4})-(\d+)(a?)\.txt$")


def _juntar_linhas(bloco: str) -> str:
    """Desfaz a quebra de linha da transcrição, preservando parágrafos."""
    paragrafos = re.split(r"\n\s*\n", bloco.strip())
    saida = []
    for p in paragrafos:
        linhas = [l.strip() for l in p.split("\n") if l.strip()]
        texto = ""
        for l in linhas:
            if texto.endswith("-") and l[:1].islower() and not texto.endswith(" -"):
                # palavra hifenizada no fim da linha ("ex-" + "empregado") mantém o hífen
                texto += l
            else:
                texto = f"{texto} {l}" if texto else l
        if texto:
            saida.append(texto)
    return "\n".join(saida)


def ler_arquivo(caminho: Path) -> list:
    """Extrai as questões de um arquivo ``AAAA-NN.txt``."""
    m = _ARQUIVO.search(caminho.name)
    if not m:
        raise ValueError(f"nome de arquivo inesperado: {caminho.name}")
    ano, edicao, reaplicacao = int(m.group(1)), int(m.group(2)), bool(m.group(3))
    conteudo = caminho.read_text(encoding="utf-8")
    cabecalhos = list(_CABECALHO.finditer(conteudo))
    questoes = []
    for i, cab in enumerate(cabecalhos):
        fim = cabecalhos[i + 1].start() if i + 1 < len(cabecalhos) else len(conteudo)
        corpo = conteudo[cab.end():fim]
        areas = []
        m_area = re.search(r"^AREA[ \t]*(.*)$", corpo, re.M)
        if m_area:
            areas = [_CORRECAO_AREA.get(a, a) for a in m_area.group(1).split()]
            corpo = corpo[: m_area.start()] + corpo[m_area.end():]
        if "OPTIONS" not in corpo:
            raise ValueError(f"{caminho.name} Q{cab.group(1)}: sem OPTIONS")
        enunciado, opcoes_txt = corpo.split("OPTIONS", 1)
        partes = list(_OPCAO.finditer(opcoes_txt))
        alternativas, gabarito = {}, None
        for j, op in enumerate(partes):
            fim_op = partes[j + 1].start() if j + 1 < len(partes) else len(opcoes_txt)
            alternativas[op.group(1)] = _juntar_linhas(opcoes_txt[op.end():fim_op])
            if op.group(2):
                gabarito = op.group(1)
        questoes.append(
            {
                "arquivo": caminho.name,
                "ano": ano,
                "edicao": edicao,
                "reaplicacao": reaplicacao,
                "numero": int(cab.group(1)),
                "anulada": bool(cab.group(2)),
                "areas": [a for a in areas if a in DISCIPLINAS],
                "enunciado": _juntar_linhas(enunciado),
                "alternativas": alternativas,
                "gabarito": gabarito,
            }
        )
    return questoes


def ler_provas(pasta_raw: Path) -> list:
    """Lê todas as provas oficiais da pasta ``official/raw``."""
    provas = []
    for caminho in sorted(Path(pasta_raw).glob("*.txt")):
        provas.append(ler_arquivo(caminho))
    return provas
