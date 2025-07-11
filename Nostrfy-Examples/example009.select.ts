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



// let result = await sql`
//     SELECT * FROM public.event_provenance_t;
// `.execute(db)

// const result = await db
//   .selectFrom('public.nostr_events')
//   .selectAll()
//   .execute()

const result = await db
  .selectFrom('public.nostr_events')
  .innerJoin('event_provenance_t', 'event_provenance_t.event_id', 'public.nostr_events.id')
  // `select` needs to come after the call to `innerJoin` so
  // that you can select from the joined table.
  .selectAll()
  .execute()




console.log(result)
