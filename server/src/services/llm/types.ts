export type LLMRequest = {
  systemPrompt: string;
  userMessage: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json';
};

export type LLMResponse = {
  content: string;
  tokensUsed: { input: number; output: number };
  model: string;
  latencyMs: number;
};

export type LLMAdapter = {
  generate: (request: LLMRequest) => Promise<LLMResponse>;
};
