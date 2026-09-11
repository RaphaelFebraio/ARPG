import type { ChunkMetadata, RulesAnswer, RulesQueryInput } from '@grimoire/shared';
import { config } from '../config.js';
import { QUERY_TRANSLATION_SYSTEM_PROMPT } from '../prompts/query-translation.js';
import { NO_CONTEXT_ANSWER, buildRulesAssistantSystemPrompt } from '../prompts/rules-assistant.js';
import type { RetrievedChunk } from '../rag/retriever.js';
import { Retriever } from '../rag/retriever.js';
import { EmbeddingService } from './embedding.service.js';
import { getLLMAdapter } from './llm/factory.js';
import type { LLMAdapter } from './llm/types.js';

const formatChunkForContext = (chunk: RetrievedChunk): string => {
  const citation = [chunk.metadata.source, chunk.metadata.chapter, chunk.metadata.section]
    .filter((part): part is string => Boolean(part))
    .join(', ');
  return `[${citation}]\n${chunk.content}`;
};

export class RagService {
  constructor(
    private readonly embeddingService: EmbeddingService = new EmbeddingService(),
    private readonly retriever: Retriever = new Retriever(),
    private readonly llmAdapter: LLMAdapter = getLLMAdapter(),
  ) {}

  private async translateQueryToEnglish(query: string): Promise<string> {
    const response = await this.llmAdapter.generate({
      systemPrompt: QUERY_TRANSLATION_SYSTEM_PROMPT,
      userMessage: query,
      temperature: 0,
      maxTokens: 100,
    });
    return response.content.trim();
  }

  async answerQuery(input: RulesQueryInput): Promise<RulesAnswer> {
    const searchQuery = await this.translateQueryToEnglish(input.query);
    const queryEmbedding = await this.embeddingService.embed(searchQuery);

    const chunks = await this.retriever.retrieve(queryEmbedding, {
      entityType: input.filters?.entityType,
      limit: 10,
      threshold: config.RAG_SIMILARITY_THRESHOLD,
    });

    const topChunks = chunks.slice(0, config.RAG_MAX_CHUNKS);

    // DECISION: the "never invent rules" constraint is enforced here, not
    // just via prompting — if nothing clears the similarity threshold, we
    // return the canned answer without calling the LLM at all, so there is
    // no way for the model to hallucinate around an empty context.
    if (topChunks.length === 0) {
      return { answer: NO_CONTEXT_ANSWER, sources: [] };
    }

    const context = topChunks.map(formatChunkForContext).join('\n\n');
    const systemPrompt = buildRulesAssistantSystemPrompt(context);

    const response = await this.llmAdapter.generate({
      systemPrompt,
      userMessage: input.query,
      temperature: 0.3,
    });

    const sources: ChunkMetadata[] = topChunks.map((chunk) => chunk.metadata);
    return { answer: response.content, sources };
  }
}
