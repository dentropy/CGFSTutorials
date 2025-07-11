/*
.query does not work

Realized that rx-nostr would be better for implimenting outbox model

*/

import { NDatabase, NPostgres } from "@nostrify/db";
import { NostrFilter, NPool, NRelay1 } from "@nostrify/nostrify";
import { Expression, Kysely, OperationNode, sql } from "kysely";
import { PGlite } from "@electric-sql/pglite";
import { PgliteDialect } from "@soapbox/kysely-pglite";
import * as nip19 from "nostr-tools/nip19";

let raw_db = new PGlite("./outbox");
const db = new Kysely({
    dialect: new PgliteDialect({
        database: raw_db,
    }),
});

export const outbox = new NDatabase(db);
await outbox.migrate();

let relay_urls = [
    "wss://relay.damus.io/",
    "wss://nos.lol/",
    "wss://purplerelay.com/",
    "wss://relay.mostr.pub",
    "wss://primal.net",
];

// Get Each User's Relays
const raw_pool = new NPool({
    open: (url) => new NRelay1(url),
    reqRouter: async (filters) => new Map([]),
    eventRouter: async (
        event,
    ) => [],
});
const pool = raw_pool.group(relay_urls);

export const pool2 = new NPool({
    open(url) {
        return new NRelay1(url);
    },

    // Get the relays to use for making requests.
    async reqRouter(filters) {
        const authors = new Set<string>();
        const routes = new Map<string, NostrFilter[]>();

        // Gather the authors from the filters.
        for (const filter of filters) {
            for (const author of filter.authors ?? []) {
                authors.add(author);
            }
        }

        // Query for outbox events.
        const events = await outbox.query([
            { kinds: [10002], authors: [...authors], limit: authors.size },
        ]);

        console.log("Checking for events")
        console.log(events)

        // Gather relays from NIP-65 events.
        for (const event of events) {
            for (const [name, value] of event.tags) {
                if (name === "r") {
                    try {
                        const url = new URL(value).toString(); // Normalize the URL.
                        console.log(`Adding a route ${url}`)
                        routes.set(url, filters);
                        console.log(routes)
                    } catch (_e) {
                        console.log(_e)
                        console.log("ERROR_ADDING_ROUTE")
                        // skip
                    }
                }
            }
        }

        // Finally, return the relays.
        console.log("routes");
        console.log(routes);
        console.log("filters");
        console.log(filters);
        // routes.set(new URL("wss://bostr.bitcointxoko.com").toString(), filters)
        routes.set(new URL("wss://relay.mememaps.net").toString(), filters)

        if (routes.size) {
            console.log(routes)
            return routes
        } else {
            // Optional: fall back to hardcoded relays.
            return relay_urls;
        }
    },

    // Get the relays to use for publishing events.
    async eventRouter(event) {
        return ["wss://relay1.mostr.pub", "wss://relay2.mostr.pub"];
    },
});

async function get_nip65_events() {
    let filter = { kinds: [10002], limit: 5 };
    for await (const msg of pool2.req([filter])) {
        if (msg[0] === "EVENT") {
            console.log(msg[2]);
            let event = msg[2];
            console.log(event);
            // Store the outbox event.
            if (event) {
                try {
                    await outbox.event(event);
                } catch (error) {
                    console.log(`Already saved event${msg[2].id}`);
                }
            }
        }
        if (msg[0] === "EOSE") break;
    }
}
await pool2.group(relay_urls);
// console.log(results);
// let events = await pool2.query();

// console.log(events)
// console.log(events);
async function main() {

    console.log("PAUL_WAS_HERE_3")
    console.log(pool2.relays)
    // pool2.relay("wss://relay.mememaps.net")
    pool2.group(relay_urls)
    console.log("pool2.relays.url")
    for (const tmp_relay of pool2.relays){
        console.log(tmp_relay[0])
    }
    console.log("\n\n")
    get_nip65_events();

    console.log("Waiting three seconds to get some events");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // console.log("Closing inital pool");
    // pool.close();
    const result = await db
        .selectFrom("nostr_tags")
        .select(["nostr_tags.value", "nostr_events.pubkey"])
        .distinct()
        .innerJoin("nostr_events", "nostr_events.id", "nostr_tags.event_id")
        .where("nostr_tags.value", "not in", relay_urls)
        .where("nostr_tags.value", "like", "%wss://%")
        .limit(5)
        .execute();
    console.log(result);
    let filter = {
        authors: [result[0].pubkey],
        limit: 3
    };
    console.log("Our Filter");
    console.log(filter);

    // console.log("Result_of_query");
    // console.log(await pool2.query([filter]))
    // let validate = await pool2.query([filter]);
    // console.log(validate);
    // console.log("\n\n\n")

    for await (const msg of pool2.req([filter])) {
        if (msg[0] === "EVENT") {
            console.log("Found_Event");
            console.log(msg[2]);
        }
        if (msg[0] === "EOSE") break; // Sends a `CLOSE` message to the relay.
    }
}

main();
