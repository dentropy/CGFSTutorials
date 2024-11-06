import { SimplePool } from "nostr-tools/pool";
import { nip19 } from 'nostr-tools'


let npub = nip19.decode("npub1ek36rza32zjc8pec8daz6veyywv55xtemzaxr0saymd04a4r66eqpxphdl").data
const relays = [
    "ws://localhost:7007",
    "wss://relay.newatlantis.top",
    "wss://relay.damus.io/"
]


export const nostrGet = async (relays, filter) => {
    const pool = new SimplePool();
    const events = await pool.querySync(relays, filter);
    pool.publi
    console.log("events");
    console.log(events);
    return events;
};
let unix_time = Math.floor((new Date()).getTime() / 1000);
let nostr_filter = {
    // "ids": ["85fb734453ea95e5147ff5d152e33102b7ac48aa827b59c33446d81374305d33"]
    // since: unix_time - 1000000,
    authors: [npub],
    kinds: [4],
    // "#p": accounts[1].public_key
  };
let nostr_response = await nostrGet(relays, nostr_filter);

console.log(nostr_response)