# Vive AI Photobooth — Webcam e efeitos

## Aplicar esta atualização

Este pacote contém somente os arquivos alterados. Extraia na pasta principal do projeto e substitua os arquivos correspondentes. Não exclua as pastas existentes. Mantenha o CameraCapture.tsx da webcam que já está funcionando, os arquivos .env e a pasta backend/storage.

Na pasta onde está docker-compose.yml, execute no PowerShell:

```powershell
docker compose up -d --build
docker compose ps
```

Acesse http://localhost:5173 e atualize com Ctrl+F5. Faça uma nova captura para testar os efeitos.

## Fluxo atualizado

Escolha da experiência → pessoas → webcam → processamento → escolha entre todas as variações → prévia sem moldura → opções de saída.

- A lista inicial carrega os efeitos ativos do backend, na ordem configurada no painel administrativo.
- Sem efeitos cadastrados, utiliza os seis padrões do backend: Cartoon, Cyberpunk, Fantasia, Pintura a Óleo, Espaço e Super-herói.
- Todas as imagens geradas aparecem com seus respectivos nomes.
- O efeito escolhido inicialmente fica pré-selecionado nos resultados, quando encontrado.
- A confirmação grava o índice da imagem realmente escolhida.
- Não há etapa de seleção de molduras no fluxo normal.
- O processamento aguarda até 15 minutos antes de informar tempo excedido.
- O Docker Compose mantém os serviços redis, backend, celery e frontend, retirando o repasse USB específico da antiga DSLR.

## Tipo de efeito

A configuração padrão no código é AI_PROVIDER=local: filtros de cor, contraste e textura aplicados pelo Pillow. Esse modo não gera roupas ou cenários por IA.

Transformações generativas precisam de um provedor suportado configurado no backend/.env e de credenciais válidas. Backend e Celery recebem esse arquivo pelo Docker Compose. Não substitua suas chaves. Custos e disponibilidade dependem do provedor.

## Diagnóstico

```powershell
docker compose logs --tail=100 backend celery
docker compose logs --tail=100 frontend
```

## Verificação realizada

Build de produção do frontend aprovado. Sintaxe Python verificada. Os seis filtros locais produziram imagens distintas e diferentes do original em teste isolado do motor Pillow. Não foram realizadas chamadas pagas a provedores de IA. A webcam física e o conjunto Docker não foram testados neste ambiente.

## Arquivos incluídos

- docker-compose.yml
- README.md
- frontend/src/context/SessionContext.tsx
- frontend/src/components/ExperienceSelect.tsx
- frontend/src/components/ResultsGrid.tsx
- frontend/src/components/FinalPreview.tsx
- backend/app/routes/session.py

O patch antigo totem-webcam-only.patch não é necessário para aplicar esta atualização em uma instalação cuja webcam já funciona.
