#!/usr/bin/env bash
set -euo pipefail

# DECISION: default to the "base" model — best pt-BR quality/speed tradeoff
# for the target hardware (see stack table in docs/ARCHITECTURE.md).
MODEL_NAME="${1:-base}"
MODELS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/models"
MODEL_FILE="ggml-${MODEL_NAME}.bin"
MODEL_URL="https://huggingface.co/ggerganov/whisper.cpp/resolve/main/${MODEL_FILE}"

mkdir -p "${MODELS_DIR}"

if [ -f "${MODELS_DIR}/${MODEL_FILE}" ]; then
  echo "Modelo ${MODEL_FILE} já existe em ${MODELS_DIR}."
  exit 0
fi

echo "Baixando modelo whisper.cpp '${MODEL_NAME}' de ${MODEL_URL}"
curl -L --fail -o "${MODELS_DIR}/${MODEL_FILE}" "${MODEL_URL}"

echo "Modelo salvo em ${MODELS_DIR}/${MODEL_FILE}"
