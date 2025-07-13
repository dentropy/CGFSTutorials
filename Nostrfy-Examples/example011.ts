import { NSecSigner, NRelay1 } from '@nostrify/nostrify';
import { privateKeyFromSeedWords, validateWords } from "nostr-tools/nip06";

let mnemonic = 'soap vault ahead turkey runway erosion february snow modify copy nephew rude'
let secret_key = privateKeyFromSeedWords(mnemonic, "", 0);
const signer = new NSecSigner(secret_key);

const pubkey = await signer.getPublicKey();
let kind = 1
let unix_time = Math.floor((new Date()).getTime() / 1000);
const event = await signer.signEvent({ kind: kind, content: 'Hello, world!', tags: [], created_at: unix_time })

console.log(event)

// let relay_url = "ws://localhost:4036/relay" // Ditto
// let relay_url = "ws://localhost:3334/" // Khatru
// let relay_url = "ws://localhost:6969/" // piprelay
// let relay_url = "ws://localhost:7007" // rs-nostr
// let relay_url = "ws://localhost:4869" // sqlitenode
// let relay_url = "ws://localhost:7777" // strfry
// let relay_url = "ws://localhost:9090" // Paul's Relay

// let relay_url = "ws://ditto.local/relay"
// let relay_url = "ws://khatru.local/"
// let relay_url = "ws://piprelay.local/"
// let relay_url = "ws://sqlitenode.local/"
// let relay_url = "ws://rsrelay.local/"
// let relay_url = "ws://strfry.local/"

const relay = new NRelay1(relay_url)
relay.event(event)


console.log("Waiting 2 seconds")
await new Promise(resolve => setTimeout(resolve, 2000));

// let filter = { ids : [event.id]}

// let filter = { kinds: [kind] }
let filter = { ids: [event.id] }
console.log("\nFilter:")
console.log(filter)
for await (const msg of relay.req([filter])) {
    if (msg[0] === "EVENT") console.log(msg[2]);
    if (msg[0] === "EOSE") break; // Sends a `CLOSE` message to the relay.
}
