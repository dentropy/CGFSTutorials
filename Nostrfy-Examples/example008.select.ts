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

let raw_db = new PGlite("./outbox");
const db = new Kysely({
    dialect: new PgliteDialect({
        database: raw_db,
    }),
});


// let result = await sql`
//     SELECT * FROM public.nostr_events;
// `.execute(db)


// let result = await sql`
//     SELECT * FROM public.nostr_tags;
// `.execute(db)


// const result = await db
//   .selectFrom('nostr_tags')
//   .selectAll()
//   .where('value', 'not in', relay_urls)
//   .limit(10)
//   .execute()


const result = await db
    .selectFrom("nostr_tags")
    // .selectAll()
    .select(["nostr_tags.value", "nostr_events.pubkey"])
    .distinct()
    .innerJoin('nostr_events', 'nostr_events.id', 'nostr_tags.event_id')
    .where("nostr_tags.value", "not in", relay_urls)
    .where("nostr_tags.value", "like", "%wss://%")
    .execute();

console.log(result)
