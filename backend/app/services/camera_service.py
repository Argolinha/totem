"""
Serviço de câmera DSLR (tethering via gphoto2)
================================================

Controla a câmera DSLR conectada por USB (testado com Nikon D5100) usando o
gphoto2 (CLI, via subprocess) para disparar o obturador e baixar a foto
direto da câmera. Existe porque DSLRs não aparecem como webcam (dispositivo
de vídeo UVC) para o navegador - o gphoto2 fala com a câmera pelo protocolo
PTP/USB, então a captura precisa acontecer no backend, não no browser.

Pré-requisitos (ver passo a passo completo na resposta que acompanha este
arquivo):
  - pacote "gphoto2" instalado no sistema/container (apt-get install gphoto2)
  - câmera em modo PTP (no D5100: Menu de configuração > USB > "PTP", não
    "Mass Storage")
  - dispositivo USB da câmera passado para dentro do container Docker
  - nenhum outro processo (ex.: gvfs-gphoto2-volume-monitor em hosts Linux
    desktop) segurando a câmera - ele monta a câmera automaticamente e
    bloqueia o gphoto2 de acessá-la
"""
from __future__ import annotations

import logging
import shutil
import subprocess
import tempfile
import time
from pathlib import Path

logger = logging.getLogger(__name__)

GPHOTO2_BIN = "gphoto2"
CAPTURE_TIMEOUT_SECONDS = 20
PREVIEW_TIMEOUT_SECONDS = 10
DETECT_TIMEOUT_SECONDS = 10


class CameraError(RuntimeError):
    """Erro ao falar com a câmera DSLR via gphoto2 (não instalado, desconectada, travada, etc)."""


def _run_gphoto2(args: list[str], timeout: float) -> subprocess.CompletedProcess:
    try:
        return subprocess.run(
            [GPHOTO2_BIN, *args],
            capture_output=True,
            text=True,
            timeout=timeout,
        )
    except FileNotFoundError as exc:
        raise CameraError(
            "gphoto2 não está instalado no sistema. Instale com 'apt-get install gphoto2' "
            "(já incluído no Dockerfile do backend - rebuilde a imagem)."
        ) from exc
    except subprocess.TimeoutExpired as exc:
        raise CameraError(
            f"A câmera não respondeu em {timeout}s. Verifique se está ligada, conectada via "
            "USB e se nenhum outro programa está usando-a."
        ) from exc


def is_camera_connected() -> bool:
    """Verifica se o gphoto2 enxerga alguma câmera conectada via USB."""
    result = _run_gphoto2(["--auto-detect"], timeout=DETECT_TIMEOUT_SECONDS)
    # Saída do --auto-detect: 1 linha de cabeçalho + 1 separador + 1 linha por câmera
    lines = [line for line in result.stdout.splitlines() if line.strip()]
    return len(lines) > 2


def capture_preview() -> bytes:
    """
    Captura um frame de pré-visualização (live view) da câmera, usado para
    o "espelho" em tempo real na tela de captura do totem. Resolução baixa,
    pensado para ser chamado repetidamente (polling) pelo frontend.
    """
    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp) / "preview.jpg"
        result = _run_gphoto2(
            ["--capture-preview", "--filename", str(tmp_path), "--force-overwrite"],
            timeout=PREVIEW_TIMEOUT_SECONDS,
        )
        if result.returncode != 0 or not tmp_path.exists():
            raise CameraError(
                f"Falha ao capturar preview da câmera: {result.stderr.strip() or result.stdout.strip()}"
            )
        return tmp_path.read_bytes()


def capture_photo(output_dir: Path) -> Path:
    """
    Dispara o obturador da DSLR e baixa a foto capturada (resolução total)
    para `output_dir`. Retorna o caminho do arquivo salvo. Levanta
    CameraError em qualquer falha (câmera desconectada, travada por outro
    processo, timeout, etc) - quem chama decide o que fazer (ex.: mostrar
    erro no totem).
    """
    output_dir.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        result = _run_gphoto2(
            [
                "--capture-image-and-download",
                "--filename", str(tmp_path / "capture.%C"),
                "--force-overwrite",
            ],
            timeout=CAPTURE_TIMEOUT_SECONDS,
        )

        if result.returncode != 0:
            raise CameraError(
                f"gphoto2 falhou ao capturar (código {result.returncode}): "
                f"{result.stderr.strip() or result.stdout.strip()}"
            )

        captured_files = sorted(tmp_path.glob("capture.*"))
        if not captured_files:
            raise CameraError("gphoto2 não retornou nenhum arquivo de imagem após a captura.")

        src = captured_files[0]
        dest = output_dir / f"dslr_{int(time.time() * 1000)}{src.suffix.lower()}"
        shutil.copy(str(src), str(dest))
        logger.info("Foto capturada da DSLR: %s", dest)
        return dest