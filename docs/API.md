# API — Grimoire

Todas as respostas seguem o envelope:

```json
{ "success": true, "data": { } }
{ "success": false, "error": { "code": "...", "message": "..." } }
```

## Implementado

```
GET    /health                               → Status do servidor e do banco
```

## Planejado (por fase)

### Autenticação (Fase 7)
```
POST   /auth/register          { email, password }
POST   /auth/login             { email, password } → { accessToken, refreshToken }
POST   /auth/refresh           { refreshToken }    → { accessToken }
```

### Personagens (Fase 4)
```
GET    /characters                           → Lista personagens do user
POST   /characters                           → Cria personagem
GET    /characters/:id                       → Detalhe de um personagem
PUT    /characters/:id                       → Atualiza personagem
DELETE /characters/:id                       → Deleta personagem
```

### Regras — RAG (Fase 2/5)
```
POST   /rules/query            { query: string, filters?: { entityType?: string } }
                               → { answer: string, sources: ChunkMetadata[] }
```

### Diário de campanha (Fase 6)
```
GET    /campaigns
POST   /campaigns
GET    /campaigns/:id/sessions
POST   /campaigns/:id/sessions/audio         (multipart/form-data)
GET    /campaigns/:id/sessions/:sessionId
POST   /campaigns/:id/recap
```

### Ingestão — admin (Fase 2)
```
POST   /admin/ingest            multipart/form-data (PDF) ou { filePath: string }
GET    /admin/ingest/status/:id
```
