import { Kysely, sql } from 'npm:kysely';
import { PGlite } from '@electric-sql/pglite';
import { PgliteDialect } from '@soapbox/kysely-pglite';

const db = new PGlite('./pgdata')

let result = await db.query("SELECT * FROM nip05s;")
console.log(result)