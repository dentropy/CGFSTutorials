import { NPostgres } from "@nostrify/db";
import { Expression, Kysely, OperationNode, sql } from "kysely";
import { PGlite } from "@electric-sql/pglite";
import { PgliteDialect } from "@soapbox/kysely-pglite";
import * as nip19 from "nostr-tools/nip19";
let raw_db = new PGlite("./pgdata");
const db = new Kysely({
    dialect: new PgliteDialect({
        database: raw_db,
    }),
});

let create_nip05s_table_query = `
CREATE TABLE IF NOT EXISTS public.nip05s (
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  pubkey BPCHAR NOT NULL,
  relays JSONB,
  inserted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;
let create_nip05s_table_result = await raw_db.query(create_table_query)

let create_nip65s_table_query = `
CREATE TABLE IF NOT EXISTS public.nip65s (
  pubkey BPCHAR NOT NULL,
  relays JSONB,
  inserted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;
let create_nip65s_table_result = await raw_db.query(create_nip65s_table_query)


let npubs = [
    "npub1wf7w8mrzqs3uvd8wsp774462d3rtttzwetuhpmzjccgn63emy4ls5qsxhy",
    "npub1jk9h2jsa8hjmtm9qlcca942473gnyhuynz5rmgve0dlu6hpeazxqc3lqz7",
    "npub1utx00neqgqln72j22kej3ux7803c2k986henvvha4thuwfkper4s7r50e8",
    "npub1235tem4hfn34edqh8hxfja9amty73998f0eagnuu4zm423s9e8ksdg0ht5",
];
console.log(`\nnpubs\n${JSON.stringify(npubs, null, 2)}`);

let pubkeys = [];
for (const npub of npubs) {
    let { type, data } = nip19.decode(npub);
    pubkeys.push(data);
}
console.log(`\npubkeys\n${JSON.stringify(pubkeys, null, 2)}`);

let nip05s = [
    "_@walletofsatoshi.com", // "webmaster@walletofsatoshi.com",
    "sersleepy@primal.net",
    "matthewjablack@atomic.finance",
    "GrapheneOS@grapheneos-social.mostr.pub",
];

let relay_urls = [
    // "wss://primal.net",
    "wss://relay.damus.io/",
    "wss://nos.lol/",
    "wss://purplerelay.com/",
    "wss://relay.mostr.pub",
];

// Resolve NIP05's

import * as NIP05 from "nostr-tools/nip05";
console.log(Object.keys(NIP05));

// Validate the NIP05 Internet Identifiers are valid
for (const nip05 of nip05s) {
    if (!NIP05.isNip05(nip05)) {
        console.log(`Looks like ${nip05} is not a Internet Identifier`);
        process.exit();
    }
}

class JsonValue<T> implements Expression<T> {
    #value: T;

    constructor(value: T) {
        this.#value = value;
    }

    // This is a mandatory getter. You must add it and always return `undefined`.
    // The return type must always be `T | undefined`.
    get expressionType(): T | undefined {
        return undefined;
    }

    toOperationNode(): OperationNode {
        const json = JSON.stringify(this.#value);
        // Most of the time you can use the `sql` template tag to build the returned node.
        // The `sql` template tag takes care of passing the `json` string as a parameter, alongside the sql string, to the DB.
        return sql`CAST(${json} AS JSONB)`.toOperationNode();
    }
}

// Resolve a NIP05 and save it to database
for (const nip05 of nip05s) {
    const match = nip05.match(NIP05.NIP05_REGEX);
    const [, name = "_", domain] = match;
    let nip05_result = await NIP05.queryProfile(nip05);
    // try {
    //     let nip05_result = await NIP05.queryProfile(nip05);
    //     console.log(nip05);
    //     console.log(nip05_result);
    // } catch (error) {
    //     console.log(`Unable to get nip05=${nip05}`)
    //     console.log(error)
    // }
    console.log(nip05_result);
    try {
        await db
            .insertInto("nip05s")
            .values({
                name: name,
                domain: domain,
                pubkey: nip05_result.pubkey,
                relays: new JsonValue(nip05_result.relays),
            })
            .execute();
    } catch (error) {
        console.log(`Unable to save nip05=${nip05}`);
        console.log(error);
    }
}

// Get Each User's Relays
import { NRelay1 } from "@nostrify/nostrify";
for (const relay_url of relay_urls) {
    console.log(relay_url);
    const relay = new NRelay1(relay_url);
    let filter = {
        kinds: [10002],
        limit: 100,
        authors: pubkeys,
    };
    for await (const msg of relay.req([filter])) {
        if (msg[0] === "EVENT") {
            console.log("Found Event");
            console.log(msg[2]);
        }
        if (msg[0] === "EOSE") break; // Sends a `CLOSE` message to the relay.
    }
}

10002;
