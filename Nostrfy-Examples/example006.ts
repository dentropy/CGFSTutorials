import { NPool, NRelay1 } from "@nostrify/nostrify";

let relay_urls = [
    // "wss://primal.net",
    "wss://relay.damus.io/",
    "wss://nos.lol/",
    "wss://purplerelay.com/",
    "wss://relay.mostr.pub",
];

const raw_pool = new NPool({
    open: (url) => new NRelay1(url),
    reqRouter: async (filters) =>
        new Map([]),
    eventRouter: async (
        event,
    ) => [],
});
const pool = raw_pool.group(relay_urls)


let filter = { kinds: [1], limit: 3 };
for await (const msg of pool.req([filter])) {
    if (msg[0] === "EVENT") console.log(msg[2]);
    if (msg[0] === "EOSE") break;
}
