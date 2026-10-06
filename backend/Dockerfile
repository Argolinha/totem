FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    cmake \
    libjpeg-dev \
    zlib1g-dev \
    gphoto2 \
    libgphoto2-dev \
    usbutils \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

# O banco será criado automaticamente pelo FastAPI/SQLAlchemy.
# Não copie vive_photobooth.db para dentro da imagem.

COPY storage ./storage

RUN mkdir -p /app/storage/original
RUN mkdir -p /app/storage/generated
RUN mkdir -p /app/storage/frames
RUN mkdir -p /app/storage/scenes

# Pasta dos modelos de IA local (buffalo_l é baixado automaticamente pelo
# InsightFace na 1ª execução; inswapper_128.onnx precisa ser colocado aqui
# manualmente - ver passo a passo. Normalmente montada como volume no
# docker-compose em vez de ir para dentro da imagem.
RUN mkdir -p /app/models

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]