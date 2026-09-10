import type { FastifyError, FastifyInstance } from 'fastify';
import { AppError } from '../errors.js';

export const registerErrorHandler = (app: FastifyInstance): void => {
  app.setErrorHandler((error: FastifyError, request, reply) => {
    if (error instanceof AppError) {
      request.log.warn({ err: error }, error.message);
      reply.status(error.statusCode).send({
        success: false,
        error: { code: error.code, message: error.message },
      });
      return;
    }

    if (error.validation) {
      request.log.warn({ err: error }, 'Request validation failed');
      reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.message },
      });
      return;
    }

    request.log.error({ err: error }, 'Unhandled error');
    reply.status(500).send({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor.' },
    });
  });

  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      success: false,
      error: { code: 'ROUTE_NOT_FOUND', message: `Rota não encontrada: ${request.method} ${request.url}` },
    });
  });
};
