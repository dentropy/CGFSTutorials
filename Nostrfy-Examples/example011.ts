import { NSecSigner, NRelay1 } from '@nostrify/nostrify';
import { privateKeyFromSeedWords, validateWords } from "nostr-tools/nip06";

let mnemonic = 'soap vault ahead turkey runway erosion february snow modify copy nephew rude'
let secret_key = privateKeyFromSeedWords(mnemonic, "", 0);
const signer = new NSecSigner(secret_key);

const pubkey = await signer.getPublicKey();
const event = await signer.signEvent({ kind: 69420, content: 'Hello, world!', tags: [], created_at: 0 })

console.log(event)

let relay_url = "ws://ditto.local/relay"



const relay = new NRelay1(relay_url)
relay.event(event)


console.log("Waiting 2 seconds")
await new Promise(resolve => setTimeout(resolve, 2000));

// let filter = { ids : [event.id]}

let filter = { kinds: [69420] }
console.log("\nFilter:")
console.log(filter)
for await (const msg of relay.req([filter])) {
    if (msg[0] === "EVENT") console.log(msg[2]);
    if (msg[0] === "EOSE") break; // Sends a `CLOSE` message to the relay.
}
