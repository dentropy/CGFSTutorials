import { NRelay1 } from "@nostrify/nostrify";

// let relay_url = "wss://relay.mostr.pub"
// let filter = { kinds: [1], limit: 5 }

// let relay_url = "wss://bostr.bitcointxoko.com"
// let filter = { authors: ["b0147668855b944988d0c5e4a9afa4d679613889aae47f9a8fae87092f572f1d"] }

let relay_url = "ws://ditto.local/relay"
// let relay_url = "ws://piprelay.local/"
// let filter = { ids : ["a3047df90093f21808d58d0b4d2412062d613ebb2f8971665b96739193e7568c"]}

let filter = {
    "authors": [
        "647487849444836198cecaeeeb651b6dd193628c2dcca1da0ef9a0b66011c878"
    ],
    "kinds": [
        0
    ]
}
console.log(filter)

const relay = new NRelay1(relay_url);

for await (const msg of relay.req([filter])) {
    if (msg[0] === "EVENT") console.log(msg[2]);
    if (msg[0] === "EOSE") break; // Sends a `CLOSE` message to the relay.
}
