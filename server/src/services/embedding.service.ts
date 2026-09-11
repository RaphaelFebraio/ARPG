import { AppError } from '../errors.js';
import { config } from '../config.js';

type OllamaEmbedResponse = {
  embeddings: number[][];
};

export class EmbeddingService {
  constructor(
    private readonly baseUrl: string = config.OLLAMA_BASE_URL,
    private readonly model: string = config.OLLAMA_EMBED_MODEL,
  ) {}

  async embed(text: string): Promise<number[]> {
    const [embedding] = await this.embedBatch([text]);
    if (!embedding) {
      throw new AppError('EMBEDDING_FAILED', 'Ollama retornou nenhum embedding.', 502);
    }
    return embedding;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/api/embed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: this.model, input: texts }),
      });
    } catch {
      throw new AppError(
        'OLLAMA_UNAVAILABLE',
        `Não foi possível conectar ao Ollama em ${this.baseUrl}. Ele está rodando?`,
        502,
      );
    }

    if (!response.ok) {
      throw new AppError(
        'EMBEDDING_FAILED',
        `Requisição de embedding ao Ollama falhou (status ${response.status}).`,
        502,
      );
    }

    const data = (await response.json()) as OllamaEmbedResponse;
    return data.embeddings;
  }
}
