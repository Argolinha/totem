"""Esquema plano de 13 colunas, limpeza de texto e validação das questões."""
import html
import re
import unicodedata

COLUNAS = [
    "Banca",
    "Orgao",
    "Ano",
    "Disciplina",
    "Assunto",
    "Enunciado",
    "Alternativa_A",
    "Alternativa_B",
    "Alternativa_C",
    "Alternativa_D",
    "Alternativa_E",
    "Gabarito",
    "Comentario_Professor",
]
LETRAS = "ABCDE"
CAMPOS_TEXTO = ["Enunciado"] + [f"Alternativa_{l}" for l in LETRAS] + ["Comentario_Professor"]

_TAG_HTML = re.compile(r"<[^>]+>")
_BR_HTML = re.compile(r"<\s*(br|/p|/div|/li)\s*/?\s*>", re.I)
# "A) ", "a) ", "(A) ", "A - ", "A. " no início da alternativa
_PREFIXO_LETRA = re.compile(r"^\s*\(?[A-Ea-e]\s*[\)\]\.\-–:]\s+")
# Sequências típicas de UTF-8 lido como Latin-1/CP1252 (mojibake)
_CP1252_CONT = "\x80-\xbfŒœŠšŸŽžƒˆ˜–—‘-„†-•…‰‹›€™"
_MOJIBAKE = re.compile(rf"[ÃÂ][{_CP1252_CONT}]|â€|�")
_CONTROLE = re.compile(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F​-‏﻿]")


def corrigir_mojibake(texto: str) -> str:
    """Tenta desfazer UTF-8 decodificado como CP1252 ("Ã§" -> "ç")."""
    if not _MOJIBAKE.search(texto):
        return texto
    # Aspas curvas fechando perdidas na conversão: '”' (E2 80 9D) vira '�?'
    texto = texto.replace("�?", "”")
    try:
        reparado = texto.encode("cp1252").decode("utf-8")
        if not _MOJIBAKE.search(reparado):
            return reparado
    except (UnicodeEncodeError, UnicodeDecodeError):
        pass
    return texto


def limpar_texto(texto) -> str:
    """Remove HTML, entidades, caracteres de controle e espaços redundantes.

    Quebras de parágrafo são preservadas como '\\n' simples.
    """
    if texto is None:
        return ""
    texto = str(texto)
    texto = _BR_HTML.sub("\n", texto)
    texto = _TAG_HTML.sub("", texto)
    texto = html.unescape(texto)
    texto = corrigir_mojibake(texto)
    texto = unicodedata.normalize("NFC", texto)
    texto = texto.replace("\r\n", "\n").replace("\r", "\n").replace("\t", " ")
    texto = texto.replace(" ", " ")
    texto = _CONTROLE.sub("", texto)
    linhas = [re.sub(r" {2,}", " ", l).strip() for l in texto.split("\n")]
    texto = "\n".join(l for l in linhas if l)
    return texto.strip()


def limpar_alternativa(texto) -> str:
    return _PREFIXO_LETRA.sub("", limpar_texto(texto), count=1).strip()


def normalizar_questao(q: dict) -> dict:
    """Devolve a questão com exatamente as 13 colunas, todas como texto limpo."""
    saida = {c: "" for c in COLUNAS}
    for c in COLUNAS:
        valor = q.get(c, "")
        if c.startswith("Alternativa_"):
            saida[c] = limpar_alternativa(valor)
        elif c in CAMPOS_TEXTO:
            saida[c] = limpar_texto(valor)
        else:
            saida[c] = re.sub(r"\s+", " ", str(valor if valor is not None else "")).strip()
    saida["Ano"] = re.sub(r"\D", "", saida["Ano"])
    gab = re.sub(r"[^A-Za-zÀ-ÿ]", "", saida["Gabarito"]).upper()
    # Certo/Errado (Cebraspe): A = Certo, B = Errado, C/D/E em branco
    if gab in ("CERTO", "ERRADO") and not any(saida[f"Alternativa_{l}"] for l in "CDE"):
        saida["Alternativa_A"], saida["Alternativa_B"] = "Certo", "Errado"
        gab = "A" if gab == "CERTO" else "B"
    elif saida["Alternativa_A"].lower() == "certo" and saida["Alternativa_B"].lower() == "errado":
        saida["Alternativa_A"], saida["Alternativa_B"] = "Certo", "Errado"
        gab = {"C": "A", "E": "B"}.get(gab, gab) if gab not in ("A", "B") else gab
    saida["Gabarito"] = gab
    return saida


def validar_questao(q: dict) -> list:
    """Lista os problemas encontrados (vazia = questão válida)."""
    erros = []
    if list(q.keys()) != COLUNAS:
        erros.append("colunas fora do padrão")
    for c in ("Banca", "Orgao", "Ano", "Disciplina", "Enunciado", "Gabarito"):
        if not q.get(c):
            erros.append(f"{c} vazio")
    if q.get("Ano") and not re.fullmatch(r"(19|20)\d\d", q["Ano"]):
        erros.append("Ano inválido")
    gab = q.get("Gabarito", "")
    if not re.fullmatch(r"[A-E]", gab):
        erros.append("Gabarito deve ser uma letra A-E")
    preenchidas = [l for l in LETRAS if q.get(f"Alternativa_{l}")]
    if len(preenchidas) < 2:
        erros.append("menos de 2 alternativas")
    elif preenchidas != list(LETRAS[: len(preenchidas)]):
        erros.append("alternativas não contíguas")
    if gab and gab not in preenchidas:
        erros.append("Gabarito aponta para alternativa vazia")
    certo_errado = q.get("Alternativa_A") == "Certo" and q.get("Alternativa_B") == "Errado"
    if certo_errado and len(preenchidas) != 2:
        erros.append("Certo/Errado com C, D ou E preenchidas")
    for c in CAMPOS_TEXTO:
        v = q.get(c, "")
        if _TAG_HTML.search(v) and re.search(r"</?[a-zA-Z][^>]*>", v):
            erros.append(f"HTML em {c}")
        if _MOJIBAKE.search(v):
            erros.append(f"erro de encoding em {c}")
        if c.startswith("Alternativa_") and _PREFIXO_LETRA.match(v):
            erros.append(f"letra misturada ao texto em {c}")
    return erros


def chave_duplicidade(q: dict) -> str:
    """Chave para detectar a mesma questão vinda de fontes diferentes."""
    base = q["Enunciado"] + "|" + q["Alternativa_A"] + "|" + q["Alternativa_B"]
    base = unicodedata.normalize("NFKD", base.lower())
    return re.sub(r"[^a-z0-9]", "", base)
