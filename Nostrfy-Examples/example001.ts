import { NRelay1 } from "@nostrify/nostrify";

// let relay_url = "wss://relay.mostr.pub"
// let filter = { kinds: [1], limit: 5 }

// let relay_url = "wss://bostr.bitcointxoko.com"
// let filter = { authors: ["b0147668855b944988d0c5e4a9afa4d679613889aae47f9a8fae87092f572f1d"] }

// let relay_url = "ws://ditto.local/relay"
// let relay_url = "ws://piprelay.local/"
// let filter = { ids : ["a3047df90093f21808d58d0b4d2412062d613ebb2f8971665b96739193e7568c"]}


let relay_url = "ws://mydesktop:3334"
relay_url = "wss://t.mememap.net"
// relay_url = "wss://relay.mememaps.net"
// relay_url = "ws://mydesktop:3334"

let filter = {
  // kinds: [ 30360 ],
  // "#L": [ "nip05.domain" ],
  // "#l": [ "test.local", "nip05.domain" ],
  //  "#d": [ "ariel.herzog" ]
  ids: [ "7e1c7787dc66dba0a6ceacfee73add7034050b114011b0d59dff42caa5b77116" ]
}

// filter = {
//     "ids": [
//         "ce890ced222d61b7831efd5ec967d87c6d2798415cce266d8ea76890c7682797"
//     ]
// }

filter = {
    kinds: [39561]
}

// filter = {
//     "#d": ["ef4f09ca-c003-4103-9d55-b503ff8db2db"]

// }

// filter = {}

// let filter = {
//     "authors": [
//         "647487849444836198cecaeeeb651b6dd193628c2dcca1da0ef9a0b66011c878"
//     ],
//     "kinds": [
//         0
//     ]
// }
console.log(relay_url)
console.log(filter)

let count = 0
const relay = new NRelay1(relay_url);
for await (const msg of relay.req([filter])) {
    if (msg[0] === "EVENT") { 
        console.log(msg[2])
        count += 1
        console.log(`count=${count}`)
    }
    if (msg[0] === "EOSE") break; // Sends a `CLOSE` message to the relay.
}
