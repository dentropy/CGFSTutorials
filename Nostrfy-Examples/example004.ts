import { NPostgres } from '@nostrify/db';
import { Kysely } from 'kysely';
import { PGlite } from '@electric-sql/pglite';
import { PgliteDialect } from '@soapbox/kysely-pglite';

const kysely = new Kysely({
  dialect: new PgliteDialect({
    database: new PGlite('./pgdata'),
  }),
});


const db = new NPostgres(kysely);
await db.migrate(); // create the database tables


import { NSecSigner } from '@nostrify/nostrify';
import { privateKeyFromSeedWords, validateWords } from "nostr-tools/nip06";
let mnemonic = 'soap vault ahead turkey runway erosion february snow modify copy nephew rude'
let secret_key = privateKeyFromSeedWords(mnemonic, "", 0);
const signer = new NSecSigner(secret_key);
const pubkey = await signer.getPublicKey();
const event = await signer.signEvent({ kind: 69420, content: 'Hello, world!', tags: [], created_at: 0 })

console.log("The Raw Event")
console.log(event)


await db.event(event);
const events = await db.query([{ kinds: [69420], limit: 5 }]);

console.log("The Querried Events")
console.log(events)