# Dockerfile para Django Backend con PostGIS
FROM python:3.12-slim

WORKDIR /app

# 👇 instalar dependencias necesarias para psycopg2
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    binutils \
    libproj-dev \
    gdal-bin \
    libgdal-dev \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*
RUN apt-get update && apt-get install -y netcat-openbsd
COPY requirements.txt .

RUN pip install -r requirements.txt

COPY . .

RUN adduser --disabled-password --gecos '' appuser \
    && chown -R appuser:appuser /app

USER appuser

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "aphroditapp.wsgi:application"]
