import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// One connection pool per process. In dev, Next re-evaluates modules on hot reload, so the
// pool is parked on globalThis to stop each reload opening a fresh set of connections.
const globalForDb = globalThis as unknown as { __dripkitsSql?: ReturnType<typeof postgres> };

function makeClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local.");
  // prepare:false keeps this compatible with Supabase's transaction pooler later.
  return postgres(url, { prepare: false, max: 10 });
}

const sql = globalForDb.__dripkitsSql ?? makeClient();
if (process.env.NODE_ENV !== "production") globalForDb.__dripkitsSql = sql;

export const db = drizzle(sql, { schema });
export * from "./schema";
