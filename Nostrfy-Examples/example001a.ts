import { NRelay1 } from "@nostrify/nostrify";
import { NSchema as n } from '@nostrify/nostrify';
import { verifyEvent } from 'nostr-tools';

const relay = new NRelay1("wss://relay.mostr.pub");

for await (const msg of relay.req([{ kinds: [1], limit: 5 }])) {
    if (msg[0] === "EVENT") {
        const event = n.event().refine(verifyEvent).parse(msg[2]);
        console.log(event)
    };
    if (msg[0] === "EOSE") break; // Sends a `CLOSE` message to the relay.
}
