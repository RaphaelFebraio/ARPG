import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { AppError } from '../errors.js';
import { users } from '../db/schema.js';

// DECISION: real auth is Fase 7. Character ownership still needs a real
// user_id FK today, so everything in this environment belongs to a single
// auto-created "dev user" until session-based auth replaces this — the
// character CRUD itself won't need to change when that lands, only this
// lookup does.
const DEV_USER_EMAIL = 'dev@grimoire.local';

let cachedDevUserId: string | null = null;

export const getDevUserId = async (): Promise<string> => {
  if (cachedDevUserId) return cachedDevUserId;

  const [existing] = await db.select().from(users).where(eq(users.email, DEV_USER_EMAIL)).limit(1);
  if (existing) {
    cachedDevUserId = existing.id;
    return existing.id;
  }

  const [created] = await db
    .insert(users)
    .values({ email: DEV_USER_EMAIL, passwordHash: 'no-auth-yet' })
    .returning();

  if (!created) {
    throw new AppError('DEV_USER_CREATE_FAILED', 'Não foi possível criar o usuário de desenvolvimento.', 500);
  }

  cachedDevUserId = created.id;
  return created.id;
};
