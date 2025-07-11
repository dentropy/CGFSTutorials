import { NRelay1 } from "@nostrify/nostrify";

// let relay_url = "wss://relay.mostr.pub"
// let filter = { kinds: [1], limit: 5 }

// let relay_url = "wss://bostr.bitcointxoko.com"
// let filter = { authors: ["b0147668855b944988d0c5e4a9afa4d679613889aae47f9a8fae87092f572f1d"] }

let relay_url = "wss://purplepag.es/"
let filter = { ids : ["946964cff01678d9a7ce2380e47403bde175b2f7b70f1b99529d59f16f21027f"]}


const relay = new NRelay1(relay_url);

for await (const msg of relay.req([filter])) {
    if (msg[0] === "EVENT") console.log(msg[2]);
    if (msg[0] === "EOSE") break; // Sends a `CLOSE` message to the relay.
}
