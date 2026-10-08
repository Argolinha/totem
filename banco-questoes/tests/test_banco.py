import csv
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from banco_questoes.assuntos import atribuir_assunto  # noqa: E402
from banco_questoes.classificador import segmentar, segmentar_com_tamanhos  # noqa: E402
from banco_questoes.exportar import gravar_csv  # noqa: E402
from banco_questoes.fontes import oab_fgv, planilha  # noqa: E402
from banco_questoes.schema import COLUNAS, limpar_texto, normalizar_questao, validar_questao  # noqa: E402

PROVA = """Questão 1

AREA ETHICS

Júlio e Lauro constituíram o mesmo advogado
para ajuizar ação de ex-
empregado.

Nessa situação, deve o advogado

OPTIONS

A:CORRECT) optar por um dos mandatos,
e renunciar ao outro.

B) manter os dois.

C) assumir ambos.

D) substabelecer.


Questão 2 NULL

AREA

Questão anulada?

OPTIONS

A) x

B) y

C) z

D) w

"""


class TestLimpeza(unittest.TestCase):
    def test_remove_html_e_entidades(self):
        self.assertEqual(limpar_texto("<p>O juiz&nbsp;<b>decidiu</b></p><br>bem"), "O juiz decidiu\nbem")

    def test_corrige_mojibake(self):
        self.assertEqual(limpar_texto("AÃ§Ã£o"), "Ação")
        self.assertEqual(limpar_texto("“fábrica�?."), "“fábrica”.")

    def test_tira_letra_da_alternativa(self):
        q = normalizar_questao({"Alternativa_A": "A) O juiz decidiu", "Alternativa_B": "(b) Outra"})
        self.assertEqual(q["Alternativa_A"], "O juiz decidiu")
        self.assertEqual(q["Alternativa_B"], "Outra")

    def test_certo_errado(self):
        q = normalizar_questao({"Banca": "Cebraspe", "Orgao": "PF", "Ano": "2021", "Disciplina": "Português",
                                "Enunciado": "Julgue o item.", "Gabarito": "Errado"})
        self.assertEqual((q["Alternativa_A"], q["Alternativa_B"], q["Gabarito"]), ("Certo", "Errado", "B"))
        self.assertEqual(validar_questao(q), [])

    def test_validacao(self):
        q = normalizar_questao({"Banca": "FGV", "Orgao": "TCE-RO", "Ano": "Ano 2023", "Disciplina": "Português",
                                "Enunciado": "x", "Alternativa_A": "a", "Alternativa_B": "b", "Gabarito": " c "})
        self.assertEqual(q["Ano"], "2023")
        self.assertIn("Gabarito aponta para alternativa vazia", validar_questao(q))
        self.assertEqual(list(q), COLUNAS)


class TestOAB(unittest.TestCase):
    def test_parser(self):
        with tempfile.TemporaryDirectory() as d:
            arq = Path(d) / "2010-01.txt"
            arq.write_text(PROVA, encoding="utf-8")
            q1, q2 = oab_fgv.ler_arquivo(arq)
        self.assertEqual(q1["gabarito"], "A")
        self.assertEqual(q1["areas"], ["ETHICS"])
        self.assertIn("ação de ex-empregado.\nNessa situação", q1["enunciado"])
        self.assertEqual(q1["alternativas"]["A"], "optar por um dos mandatos, e renunciar ao outro.")
        self.assertTrue(q2["anulada"])
        self.assertEqual(q2["areas"], [])


class TestClassificador(unittest.TestCase):
    def test_segmentacao_monotona(self):
        ordem = ["X", "Y", "Z"]
        scores = [{"X": 0, "Y": -5, "Z": -5}, {"X": -5, "Y": -5, "Z": 0}, {"X": -5, "Y": 0, "Z": -5}, {"X": -5, "Y": -5, "Z": 0}]
        r = segmentar(scores, ordem)
        self.assertEqual(r, sorted(r, key=ordem.index))
        self.assertEqual(segmentar(scores, ordem, fixos={1: "Y"})[1], "Y")
        r2 = segmentar_com_tamanhos(scores, ordem, [1, 2, 1])
        self.assertEqual(r2, ["X", "Y", "Y", "Z"])

    def test_assunto(self):
        self.assertEqual(atribuir_assunto("Direito Penal", "Sobre o crime de furto qualificado e o roubo"), "Crimes contra o patrimônio")
        self.assertEqual(atribuir_assunto("Disciplina X", "qualquer"), "Diversos")


class TestPlanilha(unittest.TestCase):
    def test_ida_e_volta_csv(self):
        q = normalizar_questao({"Banca": "FCC", "Orgao": "TRT", "Ano": "2022", "Disciplina": "Português",
                                "Assunto": "Crase", "Enunciado": "Linha 1;\nlinha 2", "Alternativa_A": "a",
                                "Alternativa_B": "b", "Gabarito": "B"})
        with tempfile.TemporaryDirectory() as d:
            arq = Path(d) / "x.csv"
            gravar_csv([q], arq)
            with open(arq, encoding="utf-8") as f:
                self.assertEqual(next(csv.reader(f, delimiter=";")), COLUNAS)
            lido = normalizar_questao(planilha.ler(arq)[0])
        self.assertEqual(lido, q)

    def test_sinonimos_de_coluna(self):
        with tempfile.TemporaryDirectory() as d:
            arq = Path(d) / "y.csv"
            arq.write_text("Órgão;Matéria;Pergunta;A;B;Resposta\nPF;Português;Q?;s;n;a\n", encoding="utf-8")
            q = planilha.ler(arq)[0]
        self.assertEqual((q["Orgao"], q["Disciplina"], q["Enunciado"], q["Alternativa_B"], q["Gabarito"]),
                         ("PF", "Português", "Q?", "n", "a"))


if __name__ == "__main__":
    unittest.main()
