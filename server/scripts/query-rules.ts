import { RagService } from '../src/services/rag.service.js';

const query = process.argv.slice(2).join(' ').trim();

if (!query) {
  console.error('Uso: npm run query -- "sua pergunta"');
  process.exitCode = 1;
} else {
  const ragService = new RagService();

  ragService
    .answerQuery({ query })
    .then((result) => {
      console.info(result.answer);
      if (result.sources.length > 0) {
        console.info('\nFontes:');
        for (const source of result.sources) {
          console.info(`- [${source.source}] ${source.entityType}: ${source.entityName}`);
        }
      }
    })
    .catch((error: unknown) => {
      console.error('Falha na consulta:', error);
      process.exitCode = 1;
    });
}
