import { SimplePool } from "nostr-tools/pool";

const relays = ["ws://localhost:7007", "wss://relay.newatlantis.top"];
export const nostrGet = async (params) => {
  //   const relayObject = await window.nostr.getRelays();
  //   const relays = Object.keys(relayObject);

  const pool = new SimplePool();

  const events = await pool.querySync(relays, params);
  console.log("events");
  console.log(events);
  return events;
};

let nostr_filter = {
  "ids": ["85fb734453ea95e5147ff5d152e33102b7ac48aa827b59c33446d81374305d33"]
}

nostr_filter = {
  "authors": ["35fac4687dfbb0bae87ab74fd65c5efea894b14b3f29e19b6d11b4ad89016e1d"]
}

console.log(`Relays are \b${JSON.stringify(relays, null, 2)}`)
console.log(`Filter is \n${JSON.stringify(nostr_filter, null, 2)}`)

let nostr_response = await nostrGet(nostr_filter);

console.log(nostr_response);
