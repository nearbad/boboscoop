import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { pgClient?: postgres.Sql };

// postgres() connects lazily, on the first query.
// prepare: false keeps it compatible with pooled (pgbouncer) connection strings.
const client = (globalForDb.pgClient ??= postgres(process.env.DATABASE_URL ?? "", {
  prepare: false,
  max: 5,
}));

export const db = drizzle({ client, schema });
export { schema };
