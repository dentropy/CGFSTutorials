import * as NIP05 from "nostr-tools/nip05";
let nip05s = [
    "_@walletofsatoshi.com", // "webmaster@walletofsatoshi.com",
    "sersleepy@primal.net",
    "matthewjablack@atomic.finance",
    "GrapheneOS@grapheneos-social.mostr.pub",
];

import { Expression, Kysely, OperationNode, sql } from "kysely";
import { PGlite } from "@electric-sql/pglite";
import { PgliteDialect } from "@soapbox/kysely-pglite";
let raw_db = new PGlite("./pgdata");
const db = new Kysely({
    dialect: new PgliteDialect({
        database: raw_db,
    }),
});

let create_nip05s_table_query = `
CREATE TABLE IF NOT EXISTS public.nip05s (
  nip05 TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  pubkey BPCHAR NOT NULL,
  relays JSONB,
  inserted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;
let create_nip05s_table_result = await raw_db.query(create_nip05s_table_query);

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
    let nip05_result;
    try {
        nip05_result = await NIP05.queryProfile(nip05);
    } catch (error) {
        console.log(`Unable to get nip05=${nip05}`);
        console.log(error);
    }
    console.log(nip05_result);
    try {
        await db
            .insertInto("nip05s")
            .values({
                nip05: nip05,
                name: name,
                domain: domain,
                pubkey: nip05_result.pubkey,
                relays: new JsonValue(nip05_result.relays),
            })
            .execute();
    } catch (error) {
        if (error.toString().includes( "error: duplicate key value violates unique constraint")) {
            console.log(`nip05=${nip05} is already saved`);
        } else {
            console.log(`Unable to save nip05=${nip05}`);
            console.log(error);
            console.log(error.toString())
        }
    }
}
