import { NSchema as n } from "@nostrify/nostrify";
import { NRelay1 } from "@nostrify/nostrify";
import { verifyEvent } from "nostr-tools";

const relay = new NRelay1("wss://relay.mostr.pub");

let count = 0;
for await (const msg of relay.req([{ kinds: [0], limit: 3 }])) {
    if (msg[0] === "EVENT") {
        count += 1
        console.log(`\n\n\nEvent Count ${count}`);
        // console.log(msg[2])
        let event = undefined
        try {
            event = n.event().refine(verifyEvent).parse(msg[2]);
            console.log(event.content);
        } catch (error) {
            console.log("Error prasing raw event")
            console.log(error)
            continue;
        }
        let metadata = undefined
        try {
            metadata = n.json().pipe(n.metadata()).parse(event.content);
            console.log(JSON.stringify(metadata, null, 2));
        } catch (error) {
            console.log("Error parsing event JSON")
            console.log(error)
            continue;
        }
    }
    if (msg[0] === "EOSE") break; // Sends a `CLOSE` message to the relay.
}
