import { NRelay1 } from "@nostrify/nostrify";

const relay = new NRelay1("wss://relay.mostr.pub");

for await (const msg of relay.req([{ kinds: [1], limit: 100 }])) {
    if (msg[0] === "EVENT") console.log(msg[2]);
    if (msg[0] === "EOSE") break; // Sends a `CLOSE` message to the relay.
}
