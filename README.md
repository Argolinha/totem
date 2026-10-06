# Vive AI Photobooth — MVP

Totem fotográfico interativo com efeitos de Inteligência Artificial, QR Code para download digital e impressão automática. Este repositório contém o **MVP funcional completo**: backend (FastAPI + Celery) e frontend (React + TypeScript), com simulação de IA e de impressora, prontos para demonstrar o fluxo de ponta a ponta.

## Fluxo implementado
```
TOQUE PARA COMEÇAR → 1/2 PESSOAS → CÂMERA → CONTAGEM → CAPTURA
    → PROCESSAMENTO IA → 6 RESULTADOS → ESCOLHA → QR CODE
    → IMPRESSÃO AUTOMÁTICA → AGRADECIMENTO
```

Funciona **online e offline**: sem internet, a foto é salva localmente e entra em uma fila (Celery) que reprocessa automaticamente assim que a conexão volta (aplica-se quando `AI_PROVIDER` é um provedor externo; o modo `mock` padrão roda 100% local).

---

## Estrutura do projeto
```
vive-ai-photobooth/
├── backend/
│   ├── app/
│   │   ├── main.py              # App FastAPI + rotas + arquivos estáticos
│   │   ├── config.py            # Configurações (via .env)
│   │   ├── database.py          # SQLAlchemy engine/session
│   │   ├── models.py            # Modelos Session e Photo
│   │   ├── schemas.py           # Schemas Pydantic
│   │   ├── celery_app.py        # Instância Celery
│   │   ├── tasks.py             # Tarefas: processar IA, imprimir, fila offline
│   │   ├── routes/
│   │   │   ├── session.py       # Endpoints do ciclo de vida da sessão
│   │   │   └── download.py      # Endpoint público de download (token)
│   │   └── services/
│   │       ├── ai_service.py    # Geração das 6 variações (mock + stub Replicate)
│   │       ├── printer_service.py
│   │       └── qr_service.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/          # Welcome, PeopleSelect, CameraCapture, Processing,
│   │   │                          ResultsGrid, QRDisplay, ThankYou, ErrorScreen
│   │   ├── context/SessionContext.tsx  # Estado global do fluxo (React Context)
│   │   ├── api/client.ts        # Cliente Axios
│   │   └── App.tsx
│   ├── package.json
│   └── .env.example
└── docker-compose.yml
```

---

## Rodando com Docker (recomendado)

```bash
cd vive-ai-photobooth
docker compose up --build
```

Isso sobe: `redis`, `backend` (FastAPI, porta 8000), `celery-worker`, `celery-beat` (reprocessa a fila offline) e `frontend` (porta 5173).

Acesse: **http://localhost:5173**

---

## Câmera DSLR (Nikon D5100)

DSLRs **não aparecem como webcam** para o navegador, então o navegador nunca
vai "reconhecer" a D5100. Quem controla a câmera é o **backend**, via USB
(libgphoto2): ele mostra o live view (`GET /api/camera/stream.mjpg`), dispara
o obturador e baixa a foto (`POST /api/session/{id}/capture-dslr`). O frontend
só exibe o stream e chama esses endpoints.

Na câmera:
1. Menu de configuração → **USB** → **PTP** (não "Mass Storage").
2. Cartão SD inserido, bateria carregada (ou fonte EP-5A).
3. Qualidade de imagem **JPEG** (Fine/Normal) ou RAW+JPEG.
4. Foco: AF-S com boa iluminação ou, mais confiável no totem, foco manual (chave M na lente).
   Se o AF não acha foco, a câmera não dispara.
5. Desligue o desligamento automático (Menu de configuração → Temporizadores de desligamento automático → Longo/Personalizado).

No computador do totem (precisa ser **Linux**, ou Windows com WSL2):
- Conecte a câmera por USB e confira no host: `lsusb | grep -i nikon`.
- Em Linux com desktop, o sistema costuma "montar" a câmera e travá-la. Desative:
  `systemctl --user stop gvfs-gphoto2-volume-monitor && systemctl --user mask gvfs-gphoto2-volume-monitor`
  (ou `pkill -f gvfs-gphoto2`).
- O `docker-compose.yml` já repassa `/dev/bus/usb` ao container do backend. Depois de `docker compose up --build`, teste:
  `docker exec -it vive-ai-photobooth-backend gphoto2 --auto-detect` → deve listar `Nikon DSC D5100 (PTP mode)`.
  (Pare o backend antes de rodar `gphoto2 --capture-image` manualmente, pois só um processo pode usar a câmera por vez.)
- Status pela API: `curl http://localhost:8000/api/camera/status` → `{"connected": true, "model": "D5100", ...}`.
  Se vier `connected: false`, o campo `error` diz o motivo (também aparece na tela de captura).

**Windows:** a libgphoto2 não roda no Windows nem o Docker Desktop enxerga USB
diretamente. Instale o [usbipd-win](https://github.com/dorssel/usbipd-win), rode
o Docker dentro do WSL2 e anexe a câmera ao WSL (PowerShell como admin):
`usbipd list` → `usbipd bind --busid <BUSID>` → `usbipd attach --wsl --busid <BUSID>`.
Repita o `attach` sempre que religar a câmera.

---

## Rodando localmente sem Docker

### 1. Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env

# Terminal 1 - API
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Redis (necessário para o Celery)
redis-server

# Terminal 3 - Worker Celery (processa IA e impressão)
celery -A app.celery_app worker --loglevel=info

# Terminal 4 (opcional) - Beat, para reprocessar a fila offline periodicamente
celery -A app.celery_app beat --loglevel=info
```

### 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Acesse **http://localhost:5173** (idealmente em um navegador/tablet com câmera).

---

## Modo de IA (mock vs. real)

Por padrão, `AI_PROVIDER=mock` no `.env` do backend: as 6 variações são geradas **localmente com Pillow** (filtros de cor/contraste simulando 6 estilos), sem custo de API e sem depender de internet — ideal para testar o fluxo completo imediatamente.

Para plugar um provedor real (ex.: Replicate):
1. Defina `AI_PROVIDER=replicate` e `REPLICATE_API_TOKEN` no `.env`.
2. Implemente a chamada real em `app/services/ai_service.py`, na função `generate_variations_replicate` (os pontos de extensão já estão comentados no código).

## Impressão

A impressão está **simulada** em `app/services/printer_service.py` (loga a ação e retorna sucesso). Os pontos de integração com a impressora física **Fujifilm ASK 400** estão documentados em comentários `TODO` no mesmo arquivo (via SDK do fabricante ou fila de impressão do sistema operacional).

## Endpoints principais da API

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/session` | Cria uma nova sessão |
| POST | `/api/session/{id}/upload` | Envia a foto original (multipart) |
| GET | `/api/session/{id}/status` | Status da sessão (polling) |
| GET | `/api/session/{id}/results` | Retorna as 6 imagens geradas |
| POST | `/api/session/{id}/choose` | Registra a imagem escolhida |
| GET | `/api/session/{id}/qr` | URL de download para o QR Code |
| GET | `/api/download/{token}` | Download público (token expira em 24h) |
| GET | `/api/printer/status` | Status da impressora |

Documentação interativa (Swagger): **http://localhost:8000/docs**

## Próximos passos sugeridos (pós-MVP)
- Painel administrativo (sessões, filas, consumo de créditos de IA).
- Integração real com provedor de IA (Replicate/Stability/OpenAI) para troca de rosto e cenários temáticos.
- Integração real com a impressora Fujifilm ASK 400 via SDK.
- Suporte a múltiplos totens simultâneos (o campo `totem_id` já existe no modelo).
- WebSockets para status em tempo real (hoje o frontend usa polling).
