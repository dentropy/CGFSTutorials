import { NRelay1 } from "@nostrify/nostrify";
import { NSchema as n } from '@nostrify/nostrify';
import { verifyEvent } from 'nostr-tools';

const relay = new NRelay1("wss://relay.mememaps.net");

let filter = { kinds: [1], limit: 5 }

for await (const msg of relay.req([filter])) {
    if (msg[0] === "EVENT") {
        const event = n.event().refine(verifyEvent).parse(msg[2]);
        console.log(event)
        console.log(relay.url)
    };
    if (msg[0] === "EOSE") break; // Sends a `CLOSE` message to the relay.
}
