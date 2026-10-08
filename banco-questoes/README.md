# Banco de Questões de Concursos

Pipeline que coleta, limpa, classifica e exporta questões de concursos no
formato plano de **13 colunas** exigido pelo sistema:

`Banca; Orgao; Ano; Disciplina; Assunto; Enunciado; Alternativa_A; Alternativa_B; Alternativa_C; Alternativa_D; Alternativa_E; Gabarito; Comentario_Professor`

## Entregáveis (`saida/`)

| Arquivo | Formato |
|---|---|
| `banco_questoes.xlsx` | Excel, aba `Questoes`, cabeçalho congelado e com filtro |
| `banco_questoes.csv` | separado por `;`, UTF-8 (use `--bom` se for abrir direto no Excel) |
| `banco_questoes.json` | lista de objetos com as mesmas 13 chaves |

### Conteúdo atual: 2.210 questões reais

| Fonte | Banca | Órgão | Anos | Questões |
|---|---|---|---|---|
| Exame de Ordem Unificado, 1ª fase, edições I a XXV (provas tipo 1) | FGV | OAB | 2010–2018 | 2.210 |

Origem: transcrição pública [legal-nlp/oab-exams](https://github.com/legal-nlp/oab-exams)
(licença MIT), com o gabarito oficial definitivo. As 10 questões anuladas foram
descartadas. 17 disciplinas jurídicas, ~90 assuntos.

**Como Disciplina e Assunto foram definidos**
- Disciplina: nas edições I a XIV (e parte da XVIII e da XXI) vem da anotação da
  fonte. Nas edições XV a XXV, a fonte não traz rótulo; a disciplina foi
  inferida por um classificador Naive Bayes somado à ordem fixa das disciplinas
  no caderno de prova e à distribuição do edital. Testado nas provas que têm
  rótulo, acerta **~95%**; os erros ficam nas fronteiras entre blocos
  (ex.: última questão de Constitucional marcada como Direitos Humanos).
- Assunto: regras de palavras-chave por disciplina (`banco_questoes/assuntos.py`).
  Cerca de 8% caem em "Diversos" por não baterem com nenhuma regra.
- `Comentario_Professor` fica em branco: a fonte não traz resolução.

## Regras de qualidade aplicadas a cada linha

- Sem HTML (`<p>`, `<br>`, entidades `&nbsp;`) e sem caracteres de controle.
- Correção de mojibake (`AÃ§Ã£o` → `Ação`, `�?` → `”`). Uma linha que
  ainda tenha erro de encoding é rejeitada.
- A letra é removida do início da alternativa (`A) O juiz...` → `O juiz...`).
- `Gabarito` com uma única letra maiúscula A–E, que aponte para uma
  alternativa preenchida.
- Certo/Errado (Cebraspe): `Alternativa_A = Certo`, `Alternativa_B = Errado`,
  C/D/E vazias, gabarito `A` ou `B`. Na importação, gabaritos `Certo`/`Errado`/`C`/`E`
  são convertidos sozinhos.
- `Ano` só com dígitos e deduplicação por enunciado + alternativas.
- Quebras de parágrafo do enunciado ficam como `\n` dentro do campo (o CSV
  coloca esses campos entre aspas, conforme a RFC 4180).

## Como gerar / ampliar o banco

```bash
pip install openpyxl
python scripts/construir_banco.py                 # baixa a fonte OAB e gera saida/
python scripts/construir_banco.py --importar lotes/*.xlsx lotes/*.csv --bom
python -m unittest discover tests
```

`--importar` aceita CSV (`;` ou `,`), XLSX ou JSON com as 13 colunas. Nomes
parecidos também são reconhecidos (`Órgão`, `Matéria`, `Pergunta`, `A`..`E`,
`Resposta`, `Resolução`). Todo lote importado passa pela mesma limpeza,
validação e deduplicação, e o script lista quantas linhas foram rejeitadas e
por quê.

## Para chegar às ~100.000 questões

Este ambiente de execução só alcança GitHub e repositórios de pacotes; sites
como QConcursos, TEC, PCI e os portais das bancas estão bloqueados. Por isso a
única fonte aberta, licenciada e com gabarito oficial que foi possível
incorporar é a OAB/FGV. **Nenhuma questão foi inventada**: atribuir enunciados
fictícios a uma banca, órgão e ano reais criaria registros falsos no banco.

Caminhos para escalar, todos já suportados pelo `--importar`:
1. **Provas e gabaritos oficiais** (PDF) publicados por FGV, Cebraspe, FCC,
   Vunesp, Cesgranrio etc.: transcrever ou extrair o texto para uma planilha no
   formato acima. Cada prova rende de 50 a 120 questões, então ~1.000 provas
   chegam a 100 mil.
2. **Bases licenciadas**: exportações de plataformas com contrato que permita
   o uso (a maioria proíbe raspagem nos termos de uso).
3. **Questões autorais** (escritas pela equipe): use `Banca = "Autoral"` para
   não confundir com questões de prova.
