import { config } from '../../config.js';
import { OllamaAdapter } from './ollama.adapter.js';
import type { LLMAdapter } from './types.js';

export type LLMProvider = 'ollama';

// DECISION: Gemini/Groq adapters are part of the documented fallback chain
// but out of scope for now — the MVP must work with zero API keys, and we
// have no key configured to exercise them against. Adding the interface
// above is what makes plugging them in later a new adapter file, not a
// refactor.
export const getLLMAdapter = (provider: LLMProvider = 'ollama'): LLMAdapter => {
  switch (provider) {
    case 'ollama':
      return new OllamaAdapter(config.OLLAMA_BASE_URL, config.OLLAMA_MODEL, config.OLLAMA_NUM_CTX);
    default:
      throw new Error(`Unknown LLM provider: ${provider satisfies never}`);
  }
};
