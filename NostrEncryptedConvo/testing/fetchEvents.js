import { SimplePool } from "nostr-tools/pool";
import { nip19 } from 'nostr-tools'


let npub = nip19.decode("npub1ek36rza32zjc8pec8daz6veyywv55xtemzaxr0saymd04a4r66eqpxphdl").data
const relays = [
    // "ws://localhost:7007",
    "wss://relay.newatlantis.top",
    // "wss://relay.damus.io/"
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
// let nostr_filter = {
//     // "ids": ["85fb734453ea95e5147ff5d152e33102b7ac48aa827b59c33446d81374305d33"]
//     // since: unix_time - 1000000,
//     // authors: [npub],
//     kinds: [4],
//     "#p": npub
//   };

console.log("npub")
console.log(npub)
let nostr_filter = {
    authors: [ "8593eee7d28c49aa052817b1bcf1d2f10637f86ef6ad20d3765b823dc755d819" ],
    kinds: [ 4 ],
    "#p": "862f8ab237e083eb83b038c9fb1c18433f5aa2972224e0729fbd94bf18e7d0e6",
  }
let nostr_response = await nostrGet(relays, nostr_filter);

console.log(nostr_response)