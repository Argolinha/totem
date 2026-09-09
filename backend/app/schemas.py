"""
Schemas Pydantic usados para validar entradas e formatar saídas da API.
"""
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class SessionCreateRequest(BaseModel):
    people_count: int = Field(1, ge=1, le=2, description="1 ou 2 pessoas na foto")
    totem_id: Optional[str] = None


class SessionResponse(BaseModel):
    id: str
    totem_id: str
    people_count: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class SessionStatusResponse(BaseModel):
    id: str
    status: str
    error_message: Optional[str] = None
    printer_status: Optional[str] = None


class ChooseImageRequest(BaseModel):
    chosen_index: int = Field(..., ge=0, le=5, description="Índice da imagem escolhida (0 a 5)")


class ResultsResponse(BaseModel):
    session_id: str
    status: str
    results: List[str] = []          # URLs das 6 imagens geradas
    effect_names: List[str] = []


class QRCodeResponse(BaseModel):
    download_url: str
    token: str
    expires_at: datetime


class PrinterStatusResponse(BaseModel):
    printer_status: str
    printed: bool
