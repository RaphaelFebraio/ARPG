import { AppError } from '../../errors.js';
import type { LLMAdapter, LLMRequest, LLMResponse } from './types.js';

type OllamaChatResponse = {
  message: { content: string };
  prompt_eval_count?: number;
  eval_count?: number;
};

export class OllamaAdapter implements LLMAdapter {
  constructor(
    private readonly baseUrl: string,
    private readonly model: string,
    private readonly numCtx: number,
  ) {}

  async generate(request: LLMRequest): Promise<LLMResponse> {
    const start = Date.now();

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          stream: false,
          format: request.responseFormat === 'json' ? 'json' : undefined,
          messages: [
            { role: 'system', content: request.systemPrompt },
            { role: 'user', content: request.userMessage },
          ],
          options: {
            temperature: request.temperature ?? 0.3,
            num_ctx: this.numCtx,
            ...(request.maxTokens ? { num_predict: request.maxTokens } : {}),
          },
        }),
      });
    } catch {
      throw new AppError(
        'OLLAMA_UNAVAILABLE',
        `Não foi possível conectar ao Ollama em ${this.baseUrl}. Ele está rodando?`,
        502,
      );
    }

    if (!response.ok) {
      throw new AppError('LLM_REQUEST_FAILED', `Requisição ao Ollama falhou (status ${response.status}).`, 502);
    }

    const data = (await response.json()) as OllamaChatResponse;
    const latencyMs = Date.now() - start;

    return {
      content: data.message.content,
      tokensUsed: {
        input: data.prompt_eval_count ?? 0,
        output: data.eval_count ?? 0,
      },
      model: this.model,
      latencyMs,
    };
  }
}
