import { env } from "@/env";
import * as schema from "./schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var database: ReturnType<typeof drizzle> | undefined;
}

let database: ReturnType<typeof drizzle>;
let pool: Pool;

if (env.NODE_ENV === "production") {
  pool = new Pool({
    connectionString: env.DATABASE_URL,
  });

  database = drizzle(pool, { schema });
} else {
  if (!global.database) {
    pool = new Pool({
      connectionString: env.DATABASE_URL,
    });

    global.database = drizzle(pool, { schema });
  }

  database = global.database;
}

export { database };
