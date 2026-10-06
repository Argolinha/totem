"""
Serviço de câmera DSLR (tethering via libgphoto2)
==================================================

Controla a câmera DSLR conectada por USB (testado com Nikon D5100) usando a
libgphoto2 (via python-gphoto2) para mostrar o live view, disparar o
obturador e baixar a foto direto da câmera. Existe porque DSLRs não aparecem
como webcam (dispositivo de vídeo UVC) para o navegador - a libgphoto2 fala
com a câmera pelo protocolo PTP/USB, então a captura precisa acontecer no
backend, não no browser.

A câmera fica ABERTA no processo do backend (uma única conexão PTP) e todo
acesso passa por um lock. Abrir/fechar a câmera a cada frame (como fazia a
versão via CLI `gphoto2`) era lento, fazia o espelho da D5100 subir/descer a
cada preview e gerava "Could not claim the USB device" quando preview, status
e captura chegavam ao mesmo tempo.

Pré-requisitos:
  - python-gphoto2 instalado (requirements.txt) - só existe para Linux/macOS;
    no Windows rode o backend no Docker/WSL2 (ver README)
  - câmera em modo PTP (no D5100: Menu de configuração > USB > "PTP", não
    "Mass Storage") e com cartão SD inserido
  - dispositivo USB da câmera passado para dentro do container Docker
    (/dev/bus/usb - ver docker-compose.yml)
  - nenhum outro processo (ex.: gvfs-gphoto2-volume-monitor em hosts Linux
    desktop, ou o próprio comando `gphoto2` rodando) segurando a câmera
  - apenas UM processo do backend acessando a câmera (uvicorn sem --workers)
"""
from __future__ import annotations

import logging
import threading
import time
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator

logger = logging.getLogger(__name__)

try:
    import gphoto2 as gp
except ImportError:  # ex.: backend rodando direto no Windows
    gp = None

# Quanto tempo cada operação espera a câmera ficar livre (outra operação em
# andamento) antes de desistir.
PREVIEW_LOCK_TIMEOUT_SECONDS = 5
CAPTURE_LOCK_TIMEOUT_SECONDS = 30
STATUS_LOCK_TIMEOUT_SECONDS = 0.5

# Live view da D5100 demora um pouco para "subir" depois de ativado; nesse
# intervalo a câmera responde "busy" - tentamos de novo algumas vezes.
PREVIEW_RETRIES = 10
PREVIEW_RETRY_DELAY_SECONDS = 0.2

# Depois do disparo, espera eventos de arquivo novo (ex.: JPEG de um par
# RAW+JPEG) por até esse tempo.
CAPTURE_EVENT_WAIT_MS = 1500

STREAM_FPS = 12

_lock = threading.Lock()
_camera = None
_camera_model: str | None = None


class CameraError(RuntimeError):
    """Erro ao falar com a câmera DSLR (não instalada, desconectada, travada, etc)."""


class CameraBusyError(CameraError):
    """A câmera está ocupada com outra operação (preview/captura) neste momento."""


def _friendly_error(exc: Exception) -> str:
    code = getattr(exc, "code", None)
    if code == gp.GP_ERROR_MODEL_NOT_FOUND:
        return (
            "Nenhuma câmera encontrada. Verifique se a DSLR está ligada, conectada via USB, "
            "em modo PTP e (no Docker) se /dev/bus/usb foi repassado ao container."
        )
    if code == gp.GP_ERROR_IO_USB_CLAIM:
        return (
            "A câmera está sendo usada por outro programa (ex.: gvfs-gphoto2-volume-monitor, "
            "gerenciador de fotos do sistema, ou outro comando gphoto2). Feche-o e tente de novo."
        )
    if code == gp.GP_ERROR_CAMERA_BUSY:
        return "A câmera está ocupada. Tente novamente em alguns segundos."
    return f"Erro da câmera ({code}): {exc}"


def _require_gphoto2() -> None:
    if gp is None:
        raise CameraError(
            "python-gphoto2/libgphoto2 não está disponível neste sistema. Rode o backend "
            "pelo Docker (Linux) ou instale com 'pip install gphoto2' em Linux/macOS."
        )


def _open_camera():
    global _camera, _camera_model
    if _camera is None:
        camera = gp.Camera()
        camera.init()
        _camera = camera
        try:
            _camera_model = camera.get_summary().text.split("Model:", 1)[1].splitlines()[0].strip()
        except (gp.GPhoto2Error, IndexError):
            _camera_model = None
        logger.info("Câmera DSLR conectada: %s", _camera_model or "modelo desconhecido")
    return _camera


def _close_camera() -> None:
    global _camera, _camera_model
    if _camera is not None:
        try:
            _camera.exit()
        except gp.GPhoto2Error:
            pass
    _camera = None
    _camera_model = None


@contextmanager
def _camera_session(lock_timeout: float) -> Iterator:
    """
    Garante acesso exclusivo à câmera e a mantém aberta entre chamadas.
    Qualquer erro da libgphoto2 fecha a conexão para que a próxima chamada
    reabra do zero (ex.: câmera desligada e religada).
    """
    _require_gphoto2()
    if not _lock.acquire(timeout=lock_timeout):
        raise CameraBusyError("A câmera está ocupada com outra operação.")
    try:
        try:
            yield _open_camera()
        except gp.GPhoto2Error as exc:
            _close_camera()
            raise CameraError(_friendly_error(exc)) from exc
    finally:
        _lock.release()


def get_status() -> dict:
    """
    Retorna {"connected": bool, "model": str | None, "error": str | None}.
    Se a câmera estiver ocupada (ex.: transmitindo o live view), ela está
    conectada - não esperamos o lock.
    """
    try:
        _require_gphoto2()
    except CameraError as exc:
        return {"connected": False, "model": None, "error": str(exc)}

    if not _lock.acquire(timeout=STATUS_LOCK_TIMEOUT_SECONDS):
        return {"connected": _camera is not None, "model": _camera_model, "error": None}
    try:
        try:
            if _camera is not None and len(gp.Camera.autodetect()) == 0:
                logger.info("Câmera DSLR desconectada.")
                _close_camera()
            _open_camera()
        except gp.GPhoto2Error as exc:
            _close_camera()
            return {"connected": False, "model": None, "error": _friendly_error(exc)}
        return {"connected": True, "model": _camera_model, "error": None}
    finally:
        _lock.release()


def is_camera_connected() -> bool:
    """Verifica se a câmera está conectada e acessível pela libgphoto2."""
    return get_status()["connected"]


def capture_preview() -> bytes:
    """
    Captura um frame de pré-visualização (live view) da câmera em JPEG,
    usado para o "espelho" em tempo real na tela de captura do totem.
    """
    with _camera_session(PREVIEW_LOCK_TIMEOUT_SECONDS) as camera:
        for attempt in range(PREVIEW_RETRIES):
            try:
                camera_file = camera.capture_preview()
                return bytes(camera_file.get_data_and_size())
            except gp.GPhoto2Error as exc:
                # Live view ainda iniciando - a D5100 responde "busy" nos primeiros frames.
                if exc.code != gp.GP_ERROR_CAMERA_BUSY or attempt == PREVIEW_RETRIES - 1:
                    raise
                time.sleep(PREVIEW_RETRY_DELAY_SECONDS)
    raise CameraError("Falha ao capturar preview da câmera.")  # inalcançável


def preview_stream() -> Iterator[bytes]:
    """
    Gera um stream MJPEG (multipart/x-mixed-replace) com o live view da
    câmera, para ser usado direto num <img src="..."> no frontend. Libera a
    câmera entre um frame e outro, então uma captura em resolução total pode
    acontecer no meio do stream.
    """
    interval = 1.0 / STREAM_FPS
    while True:
        started = time.monotonic()
        try:
            frame = capture_preview()
        except CameraBusyError:
            continue
        except CameraError as exc:
            logger.warning("Live view interrompido: %s", exc)
            return
        yield (
            b"--frame\r\nContent-Type: image/jpeg\r\nContent-Length: "
            + str(len(frame)).encode()
            + b"\r\n\r\n"
            + frame
            + b"\r\n"
        )
        elapsed = time.monotonic() - started
        if elapsed < interval:
            time.sleep(interval - elapsed)


def capture_photo(output_dir: Path) -> Path:
    """
    Dispara o obturador da DSLR e baixa a foto capturada (resolução total)
    para `output_dir`. Retorna o caminho do arquivo salvo. Levanta
    CameraError em qualquer falha (câmera desconectada, travada por outro
    processo, sem foco, etc) - quem chama decide o que fazer (ex.: mostrar
    erro no totem).
    """
    output_dir.mkdir(parents=True, exist_ok=True)

    with _camera_session(CAPTURE_LOCK_TIMEOUT_SECONDS) as camera:
        try:
            first = camera.capture(gp.GP_CAPTURE_IMAGE)
        except gp.GPhoto2Error as exc:
            raise CameraError(
                f"{_friendly_error(exc)} Se a câmera não disparou, verifique o foco (use "
                "AF-S com boa iluminação ou foco manual), se há cartão SD e se a bateria "
                "não está fraca."
            ) from exc

        # Em RAW+JPEG a câmera gera 2 arquivos; os extras chegam como eventos.
        captured = [(first.folder, first.name)]
        deadline = time.monotonic() + CAPTURE_EVENT_WAIT_MS / 1000
        while time.monotonic() < deadline:
            event_type, event_data = camera.wait_for_event(100)
            if event_type == gp.GP_EVENT_FILE_ADDED:
                captured.append((event_data.folder, event_data.name))
            elif event_type == gp.GP_EVENT_TIMEOUT and len(captured) > 1:
                break

        jpegs = [c for c in captured if c[1].lower().endswith((".jpg", ".jpeg"))]
        if not jpegs:
            raise CameraError(
                f"A câmera salvou apenas {captured[0][1]} (RAW). Configure a qualidade de "
                "imagem da D5100 para JPEG (Fine/Normal) ou RAW+JPEG."
            )

        folder, name = jpegs[0]
        camera_file = camera.file_get(folder, name, gp.GP_FILE_TYPE_NORMAL)
        dest = output_dir / f"dslr_{int(time.time() * 1000)}.jpg"
        camera_file.save(str(dest))

    logger.info("Foto capturada da DSLR: %s", dest)
    return dest
