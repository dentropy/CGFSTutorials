import { Kysely, sql } from 'npm:kysely';
import { PGlite } from '@electric-sql/pglite';
import { PgliteDialect } from '@soapbox/kysely-pglite';

let relay_urls = [
    "wss://primal.net",
    "wss://relay.damus.io/",
    "wss://nos.lol/",
    "wss://purplerelay.com/",
    "wss://relay.mostr.pub",
];

let raw_db = new PGlite("./pgdata");
const db = new Kysely({
    dialect: new PgliteDialect({
        database: raw_db,
    }),
});



const result = await db
    .insertInto("event_provenance_t")
    .values({
        event_id: 'TEST_ID',
        relay_url: 'TEST_URL'
    })
  .executeTakeFirst()

console.log(result)
