import { NRelay1, NPool } from "@nostrify/nostrify";
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
// Get Each User's Relays
const raw_pool = new NPool({
    open: (url) => new NRelay1(url),
    reqRouter: async (filters) => new Map([]),
    eventRouter: async (
        event,
    ) => [],
});
const pool = raw_pool.group(relay_urls);

let filter = {
    kinds: [10002],
    limit: 100,
    authors: pubkeys,
};
const result = await pool.query([{ kinds: [0], limit: 1}], {relays: relay_urls});
console.log("\n\nRESULT\n\n")
console.log(result)