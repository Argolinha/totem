"""
Serviço de impressão fotográfica.

Para o MVP, a impressão é SIMULADA (apenas log + delay), retornando um
status de sucesso. O ponto de extensão para a impressora real (Fujifilm
ASK 400) está marcado abaixo — normalmente essa impressora é acessada via
driver do fabricante (SDK/DLL) ou por uma fila de impressão do sistema
operacional (ex.: enviando o arquivo formatado como comando de impressão).
"""
import logging
import time
from pathlib import Path

from app.models import PrinterStatus

logger = logging.getLogger(__name__)

# Estado "global" simulado da impressora (em produção isso viria do SDK real)
_printer_state = {"status": PrinterStatus.AVAILABLE}


def get_printer_status() -> PrinterStatus:
    """Retorna o status atual (simulado) da impressora."""
    return _printer_state["status"]


def print_photo(image_path: str, session_id: str) -> PrinterStatus:
    """
    Envia a fotografia escolhida para impressão.

    TODO (integração real com Fujifilm ASK 400):
      - Utilizar o SDK/driver oficial da Fujifilm para enviar o arquivo,
        OU
      - Configurar a impressora como impressora padrão do sistema e usar
        uma biblioteca de impressão (ex.: `win32print` no Windows, ou
        CUPS `lp`/`lpr` no Linux) apontando para o arquivo `image_path`.
      - Tratar erros reais (sem papel, desconectada) consultando o SDK.
    """
    if not Path(image_path).exists():
        logger.error(f"[Impressora] Arquivo não encontrado para impressão: {image_path}")
        _printer_state["status"] = PrinterStatus.PRINT_ERROR
        return PrinterStatus.PRINT_ERROR

    logger.info(f"[Impressora] Iniciando impressão da sessão {session_id}: {image_path}")
    _printer_state["status"] = PrinterStatus.PRINTING

    # Simula o tempo de impressão física
    time.sleep(1)

    logger.info(f"[Impressora] Impressão concluída para sessão {session_id}")
    _printer_state["status"] = PrinterStatus.COMPLETED
    return PrinterStatus.COMPLETED
