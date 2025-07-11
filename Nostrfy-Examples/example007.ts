import { NRelay1 } from "@nostrify/nostrify";
import * as nip19 from "nostr-tools/nip19";

let npubs = [
    "npub1wf7w8mrzqs3uvd8wsp774462d3rtttzwetuhpmzjccgn63emy4ls5qsxhy",
    "npub1jk9h2jsa8hjmtm9qlcca942473gnyhuynz5rmgve0dlu6hpeazxqc3lqz7",
    "npub1utx00neqgqln72j22kej3ux7803c2k986henvvha4thuwfkper4s7r50e8",
    "npub1235tem4hfn34edqh8hxfja9amty73998f0eagnuu4zm423s9e8ksdg0ht5",
];
console.log(`\nnpubs\n${JSON.stringify(npubs, null, 2)}`);

let pubkeys = [];
for (const npub of npubs) {
    let { type, data } = nip19.decode(npub);
    pubkeys.push(data);
}
console.log(`\npubkeys\n${JSON.stringify(pubkeys, null, 2)}`);

let nip05s = [
    "_@walletofsatoshi.com", // "webmaster@walletofsatoshi.com",
    "sersleepy@primal.net",
    "matthewjablack@atomic.finance",
    "GrapheneOS@grapheneos-social.mostr.pub",
];

let relay_urls = [
    "wss://primal.net",
    "wss://relay.damus.io/",
    "wss://nos.lol/",
    "wss://purplerelay.com/",
    "wss://relay.mostr.pub",
];

// Get Each User's Relays
for (const relay_url of relay_urls) {
    console.log(relay_url);
    const relay = new NRelay1(relay_url);
    let filter = {
        kinds: [10002],
        limit: 100,
        authors: pubkeys,
    };
    for await (const msg of relay.req([filter])) {
        if (msg[0] === "EVENT") {
            console.log("Found Event");
            console.log(msg[2]);
        }
        if (msg[0] === "EOSE") break; // Sends a `CLOSE` message to the relay.
    }
}
