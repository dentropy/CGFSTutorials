import { NDatabase, NPostgres } from "@nostrify/db";
// import { DenoSqlite3Dialect } from '@soapbox/kysely-deno-sqlite';
import { Kysely } from 'npm:kysely';
import { PGlite } from '@electric-sql/pglite';
import { PgliteDialect } from '@soapbox/kysely-pglite';

let raw_db = new PGlite("./outbox");
const db = new Kysely({
    dialect: new PgliteDialect({
        database: raw_db,
    }),
});
export const outbox = new NDatabase(db);
await outbox.migrate();


// export const outbox = new NDatabase(
//   new Kysely({
//     dialect: new DenoSqlite3Dialect({
//       database: new Database('./outbox.sqlite3'),
//     }),
//   }),
// );

await outbox.migrate();