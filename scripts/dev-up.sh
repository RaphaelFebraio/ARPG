#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

echo "== Verificando Docker =="
if ! docker info > /dev/null 2>&1; then
  echo "Docker não está rodando."

  if command -v powershell.exe > /dev/null 2>&1; then
    DOCKER_EXE="C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe"
    echo "Iniciando Docker Desktop..."
    powershell.exe -NoProfile -Command "Start-Process '${DOCKER_EXE}'" > /dev/null 2>&1 || true
  else
    echo "Inicie o Docker manualmente e rode este script de novo." >&2
    exit 1
  fi

  echo -n "Aguardando o Docker engine ficar pronto"
  for _ in $(seq 1 30); do
    docker info > /dev/null 2>&1 && break
    echo -n "."
    sleep 5
  done
  echo

  if ! docker info > /dev/null 2>&1; then
    echo "Docker não ficou pronto a tempo. Tente novamente." >&2
    exit 1
  fi
fi
echo "Docker OK."

echo "== Subindo PostgreSQL + Redis =="
docker compose -f docker/docker-compose.yml up -d

echo -n "Aguardando PostgreSQL ficar saudável"
for _ in $(seq 1 15); do
  status="$(docker inspect --format='{{.State.Health.Status}}' grimoire-postgres 2>/dev/null || echo "")"
  [ "${status}" = "healthy" ] && break
  echo -n "."
  sleep 2
done
echo

if [ ! -f ".env" ]; then
  echo "Nenhum .env encontrado, copiando de .env.example"
  cp .env.example .env
fi

echo "== Subindo o servidor (Ctrl+C para parar; Postgres/Redis continuam rodando) =="
npm run dev
