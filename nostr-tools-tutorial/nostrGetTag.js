import { SimplePool } from "nostr-tools/pool";
import * as nip19 from 'nostr-tools/nip19'
let npub = nip19.decode("npub1ek36rza32zjc8pec8daz6veyywv55xtemzaxr0saymd04a4r66eqpxphdl")


const relays = ["wss://relay.nostr.band"];
export const nostrGet = async (params) => {
  //   const relayObject = await window.nostr.getRelays();
  //   const relays = Object.keys(relayObject);

  const pool = new SimplePool();

  const events = await pool.get(relays, params);
  console.log("events");
  console.log(events);
  return events;
};

let nostr_filter = {
  "authors": [npub.data],
};

let nostr_response = await nostrGet(nostr_filter);

console.log(nostr_response);
