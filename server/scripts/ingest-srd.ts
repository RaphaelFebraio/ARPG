import { readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { config } from '../src/config.js';
import { runIngestPipeline } from '../src/rag/ingest.js';

// DECISION: a standalone CLI script has no Fastify request/logger context,
// so console output here is the right tool — unlike the server routes,
// where the coding conventions ban console.log in favor of request.log.
const resolveFilePath = (): string => {
  const fileArgIndex = process.argv.indexOf('--file');
  const fileArg = fileArgIndex !== -1 ? process.argv[fileArgIndex + 1] : undefined;
  if (fileArg) return resolve(fileArg);

  const pdfDir = resolve(config.PDF_STORAGE_PATH);
  const firstPdf = readdirSync(pdfDir).find((file) => file.toLowerCase().endsWith('.pdf'));
  if (!firstPdf) {
    throw new Error(`Nenhum PDF encontrado em ${pdfDir}. Use --file <caminho> ou coloque um PDF lá.`);
  }
  return join(pdfDir, firstPdf);
};

const main = async (): Promise<void> => {
  const filePath = resolveFilePath();
  console.info(`Ingerindo ${filePath}...`);

  const start = Date.now();
  const summary = await runIngestPipeline(filePath);
  const seconds = ((Date.now() - start) / 1000).toFixed(1);

  console.info(`Concluído em ${seconds}s: ${summary.chunkCount} chunks inseridos.`);
  console.info('Por tipo:', summary.entityCounts);
};

main().catch((error: unknown) => {
  console.error('Falha na ingestão:', error);
  process.exitCode = 1;
});
