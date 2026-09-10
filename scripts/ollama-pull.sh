#!/usr/bin/env bash
set -euo pipefail

if ! command -v ollama &> /dev/null; then
  echo "Ollama não encontrado. Instale em https://ollama.com antes de continuar." >&2
  exit 1
fi

MODEL="${OLLAMA_MODEL:-llama3.1:8b}"
EMBED_MODEL="${OLLAMA_EMBED_MODEL:-nomic-embed-text}"

echo "Baixando modelo LLM: ${MODEL}"
ollama pull "${MODEL}"

echo "Baixando modelo de embedding: ${EMBED_MODEL}"
ollama pull "${EMBED_MODEL}"

echo "Modelos Ollama prontos."
