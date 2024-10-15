import { SimplePool } from "nostr-tools/pool";

const relays = ["ws://localhost:7007"];
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
  "ids": ["85fb734453ea95e5147ff5d152e33102b7ac48aa827b59c33446d81374305d33"],
};

let nostr_response = await nostrGet(nostr_filter);

console.log(nostr_response);
