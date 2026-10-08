"""Classificação de disciplina para provas sem rótulo.

Combina um Naive Bayes multinomial (treinado nas questões já rotuladas) com a
estrutura do caderno de prova: as disciplinas aparecem em blocos contíguos,
sempre na mesma ordem. Uma programação dinâmica encontra a sequência monótona
de disciplinas de maior verossimilhança, respeitando os rótulos já existentes.
"""
import math
import re
import unicodedata
from collections import Counter, defaultdict

_STOP = set(
    "a o e de da do das dos em no na nos nas um uma uns umas por para com sem que se "
    "ao aos as os ou mas como mais menos nao sua seu suas seus ele ela eles elas isso "
    "esse essa este esta pelo pela pelos pelas foi ser sao ja tem ter sobre entre "
    "assinale opcao afirmativa correta incorreta considerando caso hipotese acordo "
    "situacao hipotetica luz alternativa".split()
)


def tokens(texto: str) -> list:
    t = unicodedata.normalize("NFKD", texto.lower())
    t = "".join(c for c in t if not unicodedata.combining(c))
    palavras = [p for p in re.findall(r"[a-z]{3,}", t) if p not in _STOP]
    # bigramas ajudam a separar, p. ex., "processo penal" de "processo civil"
    return palavras + [f"{a}_{b}" for a, b in zip(palavras, palavras[1:])]


class NaiveBayes:
    def __init__(self, alfa: float = 0.5):
        self.alfa = alfa

    def treinar(self, textos: list, rotulos: list):
        self.contagens = defaultdict(Counter)
        self.docs = Counter(rotulos)
        for txt, r in zip(textos, rotulos):
            self.contagens[r].update(tokens(txt))
        self.vocab = set().union(*self.contagens.values())
        self.totais = {r: sum(c.values()) for r, c in self.contagens.items()}
        return self

    def log_prob(self, texto: str) -> dict:
        """log P(rótulo | texto), normalizado."""
        toks = tokens(texto)
        n_docs = sum(self.docs.values())
        V = len(self.vocab)
        brutos = {}
        for r, cont in self.contagens.items():
            s = math.log(self.docs[r] / n_docs)
            denom = self.totais[r] + self.alfa * V
            for t in toks:
                if t in self.vocab:
                    s += math.log((cont[t] + self.alfa) / denom)
            brutos[r] = s
        m = max(brutos.values())
        z = m + math.log(sum(math.exp(v - m) for v in brutos.values()))
        return {r: v - z for r, v in brutos.items()}


def segmentar(scores: list, ordem: list, fixos: dict = None) -> list:
    """Atribui a cada posição um rótulo de ``ordem`` de forma não decrescente.

    ``scores[i]`` é um dict rótulo -> log-prob; ``fixos`` mapeia posição ->
    rótulo obrigatório.
    """
    fixos = fixos or {}
    n, K = len(scores), len(ordem)
    NEG = float("-inf")
    melhor = [[NEG] * K for _ in range(n)]
    origem = [[0] * K for _ in range(n)]
    for i in range(n):
        acumulado, arg = NEG, 0  # máximo de melhor[i-1][0..k]
        for k in range(K):
            if i > 0 and melhor[i - 1][k] > acumulado:
                acumulado, arg = melhor[i - 1][k], k
            if i in fixos and fixos[i] != ordem[k]:
                continue
            anterior = 0.0 if i == 0 else acumulado
            if anterior == NEG:
                continue
            melhor[i][k] = anterior + scores[i].get(ordem[k], -50.0)
            origem[i][k] = arg
    k = max(range(K), key=lambda j: melhor[n - 1][j])
    saida = [None] * n
    for i in range(n - 1, -1, -1):
        saida[i] = ordem[k]
        k = origem[i][k]
    return saida


def segmentar_com_tamanhos(scores: list, ordem: list, tamanhos: list, peso: float = 1.0, fixos: dict = None) -> list:
    """Como ``segmentar``, mas cada disciplina ocupa um bloco contíguo (de
    tamanho >= 1) e o tamanho do bloco é penalizado pela distância ao tamanho
    esperado no edital: ``-peso * (tamanho - esperado)²``.
    """
    fixos = fixos or {}
    n, K = len(scores), len(ordem)
    NEG = float("-inf")
    # prefixo[k][i] = soma dos scores do rótulo k nas posições < i
    prefixo = []
    for k, r in enumerate(ordem):
        acc, linha = 0.0, [0.0]
        for i in range(n):
            ok = i not in fixos or fixos[i] == r
            acc += scores[i].get(r, -50.0) if ok else -1e6
            linha.append(acc)
        prefixo.append(linha)
    # melhor[k][i] = melhor valor cobrindo posições < i com as disciplinas 0..k
    melhor = [[NEG] * (n + 1) for _ in range(K)]
    corte = [[0] * (n + 1) for _ in range(K)]
    for k in range(K):
        for i in range(k + 1, n - (K - 1 - k) + 1):
            for j in range(k, i):  # bloco k = posições j..i-1
                base = 0.0 if k == 0 else melhor[k - 1][j]
                if k == 0 and j != 0:
                    continue
                if base == NEG:
                    continue
                v = base + prefixo[k][i] - prefixo[k][j] - peso * (i - j - tamanhos[k]) ** 2
                if v > melhor[k][i]:
                    melhor[k][i], corte[k][i] = v, j
    saida, i = [None] * n, n
    for k in range(K - 1, -1, -1):
        j = corte[k][i]
        for p in range(j, i):
            saida[p] = ordem[k]
        i = j
    return saida
