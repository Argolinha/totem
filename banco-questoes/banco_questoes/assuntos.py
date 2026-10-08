"""Atribuição de Assunto por palavras-chave, dentro de cada disciplina.

Cada assunto tem uma lista de padrões (regex, sem acento e em minúsculas).
Vence o assunto com mais ocorrências no enunciado + alternativas; sem nenhuma
ocorrência, o assunto fica "Diversos".
"""
import re
import unicodedata

TAXONOMIA = {
    "Ética Profissional": {
        "Inscrição na OAB": [r"inscri[cs]", r"bachar", r"estagi", r"carteira", r"incompatib", r"impediment"],
        "Direitos e prerrogativas do advogado": [r"prerrogativ", r"sala de estado maior", r"inviolab", r"direitos do advogado", r"sigilo profissional"],
        "Honorários advocatícios": [r"honorari"],
        "Sociedade de advogados": [r"sociedade de advogados", r"sociedade unipessoal", r"socio"],
        "Infrações e sanções disciplinares": [r"infra[cç]", r"sancao|sancoes|penalidade", r"censura", r"suspens", r"exclusao", r"processo disciplinar", r"tribunal de etica"],
        "Mandato e relação com o cliente": [r"mandat", r"procura[cç]", r"renunci", r"substabelec", r"cliente", r"conflito de interesse"],
        "Publicidade profissional": [r"publicidade", r"anunci", r"propaganda"],
        "Órgãos e eleições da OAB": [r"conselho federal", r"conselho seccional", r"subsec", r"caixa de assistencia", r"elei[cç]"],
        "Advogado empregado e advocacia pública": [r"advogado empregado", r"advocacia publica", r"procurador"],
    },
    "Filosofia do Direito": {
        "Justiça e teorias da justiça": [r"justica", r"rawls", r"aristotel", r"equidade"],
        "Positivismo jurídico": [r"kelsen", r"hart", r"positiv", r"norma fundamental", r"bobbio"],
        "Jusnaturalismo": [r"direito natural", r"tomas de aquino", r"locke", r"hobbes", r"rousseau"],
        "Hermenêutica e interpretação": [r"hermeneut", r"interpreta", r"dworkin", r"principio"],
    },
    "Direito Constitucional": {
        "Controle de constitucionalidade": [r"inconstitucional", r"controle de constitucionalidade", r"\badi\b", r"\badc\b", r"\badpf\b", r"sumula vinculante", r"reserva de plenario"],
        "Direitos e garantias fundamentais": [r"direitos fundamentais", r"garantia", r"habeas", r"mandado de seguranca", r"mandado de injuncao", r"acao popular", r"liberdade", r"igualdade"],
        "Nacionalidade e direitos políticos": [r"nacionalidade", r"naturaliza", r"brasileiro nato", r"elegib", r"inelegib", r"direitos politicos", r"alistamento"],
        "Organização do Estado": [r"uniao", r"estados-membros|estado-membro", r"municipi", r"distrito federal", r"competencia", r"intervencao federal", r"federa"],
        "Poder Legislativo e processo legislativo": [r"congresso", r"camara dos deputados", r"senado", r"emenda", r"medida provisoria", r"projeto de lei", r"\bcpi\b", r"parlamentar", r"processo legislativo"],
        "Poder Executivo": [r"presidente da republica", r"governador", r"prefeito", r"crime de responsabilidade", r"ministro de estado"],
        "Poder Judiciário e funções essenciais": [r"supremo tribunal", r"\bstf\b", r"\bstj\b", r"magistrat", r"ministerio publico", r"defensoria", r"cnj", r"tribunal"],
        "Ordem social e econômica": [r"ordem social", r"saude", r"educacao", r"seguridade", r"ordem economica", r"propriedade"],
    },
    "Direitos Humanos": {
        "Sistema Interamericano": [r"interamerican", r"pacto de sao jose", r"convencao americana", r"comissao interamericana", r"corte interamericana"],
        "Sistema global (ONU)": [r"\bonu\b", r"nacoes unidas", r"declaracao universal", r"pacto internacional", r"comite"],
        "Incorporação de tratados de direitos humanos": [r"tratado", r"supralegal", r"emenda constitucional", r"incorpora"],
        "Proteção de grupos vulneráveis": [r"mulher", r"crianca", r"deficiencia", r"racial", r"indigen", r"refugiad", r"tortura"],
    },
    "Direito Internacional": {
        "Direito Internacional Privado (LINDB)": [r"lindb", r"lei de introducao", r"domicilio", r"homologa", r"carta rogatoria", r"estrangeir"],
        "Tratados internacionais": [r"tratado", r"convencao de viena", r"ratifica"],
        "Nacionalidade e condição jurídica do estrangeiro": [r"extradi", r"expuls", r"deporta", r"asilo", r"refugi", r"migra"],
        "Organizações internacionais e solução de controvérsias": [r"\bonu\b", r"\bomc\b", r"mercosul", r"corte internacional", r"organiza[cç]"],
    },
    "Direito Tributário": {
        "Competência tributária e limitações ao poder de tributar": [r"competencia tributaria", r"imunidade", r"anterioridade", r"legalidade", r"irretroativ", r"confisco", r"noventena"],
        "Espécies tributárias": [r"\btaxas?\b", r"contribuicao de melhoria", r"emprestimo compulsorio", r"contribuic", r"imposto"],
        "Obrigação e crédito tributário": [r"fato gerador", r"lancamento", r"credito tributario", r"obrigacao tributaria", r"sujeito passivo", r"responsabilidade"],
        "Suspensão, extinção e exclusão do crédito": [r"suspens", r"extin", r"prescri", r"decadencia", r"isencao", r"anistia", r"compensa", r"parcelamento"],
        "Impostos em espécie": [r"\bicms\b", r"\biss\b", r"\biptu\b", r"\bitbi\b", r"\bipva\b", r"\bipi\b", r"\brenda\b", r"\bitcmd\b", r"\bitr\b"],
        "Processo e execução fiscal": [r"execucao fiscal", r"divida ativa", r"embargos", r"mandado de seguranca", r"repeticao"],
    },
    "Direito Administrativo": {
        "Atos administrativos": [r"ato administrativo", r"atos administrativos", r"revoga", r"anula", r"convalid", r"discricion", r"vinculad"],
        "Licitações e contratos administrativos": [r"licita", r"contrato administrativo", r"pregao", r"concorrencia", r"dispensa", r"inexigib"],
        "Agentes públicos": [r"servidor", r"\bcargos?\b", r"concurso publico", r"estabilidade", r"agente publico", r"aposentad"],
        "Responsabilidade civil do Estado": [r"responsabilidade civil", r"responsabilidade objetiva", r"indeniza", r"\bdanos?\b"],
        "Organização da Administração Pública": [r"autarquia", r"fundacao publica", r"empresa publica", r"sociedade de economia mista", r"administracao indireta", r"consorcio", r"agencia reguladora"],
        "Serviços públicos e concessões": [r"servico publico", r"concess", r"permiss", r"parceria publico"],
        "Improbidade administrativa": [r"improbidade"],
        "Intervenção na propriedade e bens públicos": [r"desapropria", r"tombamento", r"servidao", r"requisi", r"bens publicos", r"bem publico"],
        "Poderes administrativos e processo administrativo": [r"poder de policia", r"poder hierarquico", r"poder disciplinar", r"processo administrativo"],
    },
    "Direito Ambiental": {
        "Licenciamento e estudo de impacto ambiental": [r"licenciamento", r"licenca", r"impacto ambiental", r"\beia\b", r"\brima\b"],
        "Responsabilidade ambiental": [r"responsabilidade", r"dano ambiental", r"crime ambiental", r"infra"],
        "Unidades de conservação e áreas protegidas": [r"unidade de conservacao", r"unidades de conservacao", r"preservacao permanente", r"reserva legal", r"codigo florestal"],
        "Competência e Política Nacional do Meio Ambiente": [r"competencia", r"sisnama", r"politica nacional"],
    },
    "Direito Civil": {
        "Parte Geral (pessoas, bens e negócio jurídico)": [r"capacidade", r"incapaz", r"personalidade", r"pessoa juridica", r"negocio juridico", r"prescri", r"decadencia", r"nulidade", r"anulab"],
        "Obrigações": [r"obrigac", r"pagamento", r"credor", r"devedor", r"\bmora\b", r"solidari"],
        "Contratos": [r"contrato", r"compra e venda", r"locac", r"doacao", r"fianca", r"mandato", r"comodato", r"mutuo"],
        "Responsabilidade civil": [r"responsabilidade civil", r"indeniza", r"dano moral", r"\bdanos\b"],
        "Direito das Coisas": [r"posse", r"propriedade", r"usucapi", r"condomini", r"hipoteca", r"penhor", r"servidao", r"usufruto"],
        "Direito de Família": [r"casamento", r"uniao estavel", r"divorci", r"alimentos", r"\bguarda\b", r"regime de bens", r"filia", r"poder familiar"],
        "Direito das Sucessões": [r"heranca", r"herdeir", r"testament", r"suces", r"inventario", r"legado"],
    },
    "Estatuto da Criança e do Adolescente": {
        "Ato infracional e medidas socioeducativas": [r"ato infracional", r"socioeducativ", r"internacao", r"semiliberdade"],
        "Família substituta e adoção": [r"adocao", r"\bguarda\b", r"tutela", r"familia substituta"],
        "Direitos fundamentais e medidas de proteção": [r"conselho tutelar", r"medida de protecao", r"medidas de protecao", r"direito"],
    },
    "Direito do Consumidor": {
        "Responsabilidade pelo fato e vício do produto/serviço": [r"vicio", r"defeito", r"fato do produto", r"fato do servico", r"responsabilidade"],
        "Práticas comerciais e publicidade": [r"publicidade", r"oferta", r"pratica abusiva", r"cobranca", r"cadastro"],
        "Proteção contratual": [r"clausula", r"contrato", r"arrependimento"],
        "Defesa do consumidor em juízo": [r"acao coletiva", r"inversao do onus", r"juizo", r"desconsideracao"],
    },
    "Direito Empresarial": {
        "Direito societário": [r"sociedade", r"socio", r"acionist", r"limitada", r"anonima", r"assembleia", r"quotas"],
        "Falência e recuperação de empresas": [r"falencia", r"recuperacao judicial", r"recuperacao extrajudicial", r"falid", r"administrador judicial"],
        "Títulos de crédito": [r"titulo", r"cheque", r"duplicata", r"nota promissoria", r"letra de cambio", r"endosso", r"\baval\b"],
        "Empresário e estabelecimento": [r"empresari", r"estabelecimento", r"registro", r"nome empresarial", r"\beireli\b"],
        "Propriedade industrial": [r"\bmarcas?\b", r"patente", r"propriedade industrial", r"desenho industrial"],
        "Contratos empresariais": [r"contrato", r"franquia", r"leasing", r"representacao comercial"],
    },
    "Direito Processual Civil": {
        "Recursos": [r"recurso", r"apelac", r"agravo", r"embargos de declaracao", r"recurso especial", r"recurso extraordinario"],
        "Execução e cumprimento de sentença": [r"execuc", r"cumprimento de sentenca", r"penhora", r"embargos a execucao", r"impugnacao"],
        "Tutela provisória": [r"tutela", r"liminar", r"cautelar", r"antecipa"],
        "Procedimentos especiais": [r"monitori", r"possessori", r"inventario", r"usucapiao", r"juizados especiais", r"mandado de seguranca"],
        "Partes, intervenção de terceiros e litisconsórcio": [r"litisconsor", r"intervencao de terceiros", r"denunciacao", r"chamamento", r"assistencia", r"amicus", r"desconsideracao"],
        "Competência e jurisdição": [r"competenc", r"jurisdic", r"foro"],
        "Procedimento comum, provas e sentença": [r"peticao inicial", r"contestac", r"revelia", r"\bprovas?\b", r"sentenca", r"coisa julgada", r"audiencia"],
    },
    "Direito Penal": {
        "Princípios e aplicação da lei penal": [r"principio", r"lei penal no tempo", r"retroativ", r"territorialidade", r"insignificancia"],
        "Teoria do crime": [r"dolo", r"culpa", r"tentativa", r"consumac", r"\berro\b", r"legitima defesa", r"estado de necessidade", r"excludente", r"concurso de pessoas", r"crime impossivel"],
        "Penas e sua aplicação": [r"\bpenas?\b", r"dosimetria", r"regime", r"substitui", r"sursis", r"livramento", r"reincid"],
        "Extinção da punibilidade": [r"prescri", r"extincao da punibilidade", r"decadencia", r"perdao"],
        "Crimes contra a pessoa": [r"homicidio", r"lesao corporal", r"aborto", r"infanticidio", r"ameaca", r"injuria", r"calunia", r"difamacao"],
        "Crimes contra o patrimônio": [r"furto", r"roubo", r"extorsao", r"estelionato", r"apropriacao", r"receptacao", r"\bdanos?\b"],
        "Crimes contra a Administração Pública": [r"peculato", r"concussao", r"corrupcao", r"prevaricacao", r"funcionario publico"],
        "Legislação penal especial": [r"drogas", r"trafico", r"hediondo", r"maria da penha", r"estatuto do desarmamento", r"\barma\b", r"transito"],
    },
    "Direito Processual Penal": {
        "Inquérito policial": [r"inquerito", r"delegado", r"autoridade policial"],
        "Ação penal": [r"acao penal", r"denuncia", r"queixa", r"representacao", r"ministerio publico"],
        "Prisão e medidas cautelares": [r"prisao", r"flagrante", r"preventiva", r"temporaria", r"fianca", r"liberdade provisoria", r"cautelar"],
        "Provas": [r"\bprovas?\b", r"testemunh", r"interrogatorio", r"busca e apreensao", r"interceptacao", r"pericia"],
        "Recursos e ações autônomas": [r"recurso", r"apelac", r"habeas corpus", r"revisao criminal", r"embargos"],
        "Competência": [r"competenc", r"\bjuri\b", r"foro"],
        "Procedimentos e nulidades": [r"procedimento", r"nulidade", r"citac", r"juizado especial", r"sentenca"],
    },
    "Direito do Trabalho": {
        "Contrato e relação de emprego": [r"contrato de trabalho", r"vinculo", r"empregad", r"terceiriz", r"aprendiz", r"domestic"],
        "Jornada de trabalho e descansos": [r"jornada", r"horas extras", r"hora extra", r"intervalo", r"repouso", r"ferias", r"noturn", r"sobreaviso"],
        "Remuneração e salário": [r"salari", r"remunera", r"gorjeta", r"adicional", r"insalubr", r"periculos", r"equiparacao"],
        "Extinção do contrato e estabilidade": [r"dispensa", r"justa causa", r"aviso previo", r"rescis", r"estabilidade", r"\bfgts\b", r"gestante"],
        "Direito coletivo do trabalho": [r"sindica", r"greve", r"convencao coletiva", r"acordo coletivo", r"negociacao coletiva"],
    },
    "Direito Processual do Trabalho": {
        "Recursos trabalhistas": [r"recurso", r"agravo", r"embargos", r"recurso de revista", r"recurso ordinario", r"deposito recursal"],
        "Execução trabalhista": [r"execuc", r"penhora", r"embargos a execucao"],
        "Audiência, provas e procedimentos": [r"audiencia", r"\bprovas?\b", r"testemunh", r"sumarissimo", r"revelia", r"contestac", r"reclamacao"],
        "Competência da Justiça do Trabalho": [r"competenc"],
        "Ações especiais": [r"mandado de seguranca", r"acao rescisoria", r"dissidio coletivo", r"inquerito"],
    },
}


def _normalizar(texto: str) -> str:
    t = unicodedata.normalize("NFKD", texto.lower())
    return "".join(c for c in t if not unicodedata.combining(c))


_COMPILADO = {
    disc: {assunto: [re.compile(p) for p in pads] for assunto, pads in assuntos.items()}
    for disc, assuntos in TAXONOMIA.items()
}


def atribuir_assunto(disciplina: str, texto: str, padrao: str = "Diversos") -> str:
    regras = _COMPILADO.get(disciplina)
    if not regras:
        return padrao
    t = _normalizar(texto)
    melhor, pontos = padrao, 0
    for assunto, padroes in regras.items():
        p = sum(len(rx.findall(t)) for rx in padroes)
        if p > pontos:
            melhor, pontos = assunto, p
    return melhor
