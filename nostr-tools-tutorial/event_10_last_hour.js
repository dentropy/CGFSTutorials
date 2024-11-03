// NIP19 Public Key

import * as nip19 from "nostr-tools/nip19";
let npub = nip19.decode(
  "npub1ek36rza32zjc8pec8daz6veyywv55xtemzaxr0saymd04a4r66eqpxphdl",
);

// Get events from Relay

import { SimplePool } from "nostr-tools/pool";
const relays = ["wss://relay.newatlantis.top"];
export const nostrGet = async (params) => {
  const pool = new SimplePool();
  let events = await pool.querySync(relays, params);
  events.sort((a, b) => a.created_at - b.created_at);
//   console.log("events");
//   console.log(events);
  return events;
};

let nostr_filter = {
  "authors": [npub.data],
}
let nostr_response = await nostrGet(nostr_filter)
console.log("\n\n")
console.log(nostr_response)
console.log(nostr_response.length)


// Sort the events via timestamp
