# Admin com dados reais, mantendo o layout

Correção preparada sobre os arquivos enviados nesta conversa.

## Aplicar

Com o Docker aberto, baixe Admin_Real_Mesma_Interface.zip para Downloads. No PowerShell, dentro de C:\Users\alana\Downloads\vive-ai-photobooth, execute:

```powershell
Expand-Archive -Path "$env:USERPROFILE\Downloads\Admin_Real_Mesma_Interface.zip" -DestinationPath .\correcao-admin -Force
powershell -ExecutionPolicy Bypass -File .\correcao-admin\Aplicar-Admin.ps1
```

O script verifica os serviços, copia os arquivos anteriores para backup-admin-DATA-HORA, aplica a integração e executa o build de backend, celery e frontend. Não substitui .env, fotos ou banco de dados. Não executa docker compose down nem remove volumes.

Depois acesse http://localhost:5173/admin/login e pressione Ctrl+F5. O email e a senha existentes são mantidos.

## Resultado

- Mesma estrutura visual das telas originais do admin: menus, cards, tabelas, calendário e funil.
- Login e proteção das rotas usando a autenticação existente.
- Clientes, eventos, orçamentos, efeitos e molduras consultados e salvos no banco.
- Dashboard calculado a partir das sessões reais; sem percentuais e temperaturas inventados.
- Galeria com fotos reais e URLs compatíveis com os caminhos salvos pelo processamento atual.
- Relatórios calculados dos registros reais e exportados para CSV.
- Configurações do painel persistidas no banco. A captura e os componentes do totem não são alterados por este pacote; opções dependentes de integração com hardware não passam a controlar hardware por serem salvas.
- Catálogo vinculado ao admin, preservando os identificadores dos efeitos existentes; desativar, renomear ou excluir um efeito passa a ser respeitado.

Sem registros no banco, as listas ficam vazias e os totais mostram zero. Não são inseridos clientes, eventos, fotos ou orçamentos demonstrativos. O catálogo atual de efeitos é registrado uma vez para poder ser gerenciado.

## Limites reais

O projeto enviado não possui integração operacional com a impressora física. O painel informa essa condição em vez de simular impressão bem-sucedida. As configurações de impressão são salvas, mas não instalam drivers nem imprimem. Temperatura não monitorada é exibida como tal. Reiniciar serviços pelo navegador não está implementado: a ação da tela Sistema atualiza as informações disponíveis.

A configuração fal.ai, o código de geração de imagens, os componentes da página principal e o contexto da captura permanecem intactos. A atualização adiciona uma tabela de metadados ao banco existente, sem apagar tabelas ou registros.

## Verificação

- Build TypeScript/Vite concluído.
- Quatro testes de integração passaram: autenticação e operações do admin; persistência dos campos e configurações; catálogo com IDs preservados e exclusão/desativação respeitadas após reiniciar a aplicação; galeria com caminhos reais do worker e exclusão de arquivo.
- Componentes do totem e seu fluxo no App.tsx comparados com os arquivos recebidos e preservados.
- Não foi possível concluir a inspeção visual automatizada: o Chromium de teste não iniciou neste ambiente.
- O instalador foi revisado, mas não executado em Windows neste ambiente. A aplicação no seu Docker será feita ao executar o comando acima.
