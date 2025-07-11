// Add Schema to Track which Events come from Which Relays
import { Expression, Kysely, OperationNode, sql } from "npm:kysely";
import { PGlite } from "@electric-sql/pglite";
import { PgliteDialect } from "@soapbox/kysely-pglite";

import { NRelay1 } from "@nostrify/nostrify";
import { NSchema as n } from "@nostrify/nostrify";
import { verifyEvent } from "nostr-tools";
import { NDatabase, NPostgres } from "@nostrify/db";

let raw_db = new PGlite("./pgdata");
const db = new Kysely({
    dialect: new PgliteDialect({
        database: raw_db,
    }),
});

export const local_relay = new NDatabase(db);
await local_relay.migrate();
let create_event_provenance_table_query = `
CREATE TABLE IF NOT EXISTS public.event_provenance_t (
  event_id TEXT NOT NULL,
  relay_url TEXT NOT NULL
);`;
let create_nip05s_table_result = await raw_db.query(
    create_event_provenance_table_query,
);

// Create a list of relay objects on different relays
let relay_urls = [
    // "wss://primal.net",
    "wss://relay.damus.io/",
    "wss://nos.lol/",
    "wss://purplerelay.com/",
    "wss://relay.mostr.pub",
];
let relays = [];
for (const relay_url of relay_urls) {
    console.log(`Adding relay ${relay_url}`);
    relays.push(new NRelay1(relay_url));
}

// Choose a filter
let filter = { kinds: [1], limit: 5 };
console.log(`\nThe Filter:\n ${JSON.stringify(filter, null, 2)}\n\n`);
// Run the filter
for (const relay of relays) {
    for await (const msg of relay.req([filter])) {
        if (msg[0] === "EVENT") {
            const event = n.event().refine(verifyEvent).parse(msg[2]);
            console.log(event);
            console.log(relay.url);
            const result = await db
                .insertInto("event_provenance_t")
                .values({
                    event_id: msg[2].id,
                    relay_url: relay.url,
                })
                .executeTakeFirst();
            try {
                await local_relay.event(event);
            } catch (error) {
                console.log(`Already saved event${msg[2].id}`);
            }
        }
        if (msg[0] === "EOSE") break; // Sends a `CLOSE` message to the relay.
    }
}

// Report the Results
