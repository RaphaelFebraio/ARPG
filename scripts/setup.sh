#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

echo "== 1/8: Subindo PostgreSQL + Redis via Docker Compose =="
docker compose -f docker/docker-compose.yml up -d

echo "== 2/8 e 3/8: Baixando modelos Ollama =="
bash scripts/ollama-pull.sh

echo "== 4/8: Baixando modelo whisper.cpp (base) =="
bash scripts/download-whisper-model.sh base

echo "== 5/8: Verificando binário whisper.cpp =="
if [ ! -f "./bin/whisper-cpp" ] && [ ! -f "./bin/whisper-cpp.exe" ]; then
  echo "AVISO: binário whisper.cpp não encontrado em ./bin/."
  echo "Baixe uma release pré-compilada ou compile com CMake (-DGGML_CUDA=ON)."
  echo "Veja docs/ARCHITECTURE.md para instruções."
fi

echo "== 6/8: Instalando dependências do monorepo =="
npm install

echo "== 7/8: Aplicando schema no banco =="
npm run db:push

echo "== 8/8: Ingerindo o SRD 5.1 (se o PDF estiver em ./data/pdf) =="
if ls ./data/pdf/*.pdf > /dev/null 2>&1; then
  npm run ingest
else
  echo "Nenhum PDF encontrado em ./data/pdf. Coloque o SRD 5.1 lá e rode 'npm run ingest' depois."
fi

echo "Setup concluído."
