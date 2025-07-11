import { Kysely, sql } from 'npm:kysely';
import { PGlite } from '@electric-sql/pglite';
import { PgliteDialect } from '@soapbox/kysely-pglite';

let raw_db = new PGlite("./pgdata");
const db = new Kysely({
    dialect: new PgliteDialect({
        database: raw_db,
    }),
});

let result = await sql`SELECT * FROM public.nip05s;`.execute(db)
console.log(result)