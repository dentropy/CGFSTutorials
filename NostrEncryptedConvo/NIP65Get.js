/*
Inputs
  * NPUB
  * NOSTR_RELAYS
*/

import { nostrGet } from "./lib/nostrGet.js";
import * as nip19 from "nostr-tools/nip19";

let nsec = process.env.NSEC;
console.log(nsec);
if (nsec == "" || nsec == undefined) {
  console.log(
    `You did not set the NSEC environment variable with your nostr key`,
  );
  process.exit();
} else {
  console.log(`\nYour nsec is ${nsec}`);
}
private_key = nip19.decode(nsec).data;

let npub = process.env.NPUB;
console.log(npub);
if (npub == "" || npub == undefined) {
  console.log(
    `You did not set the NPUB environment variable with your nostr key`,
  );
  process.exit();
} else {
  console.log(`\nYour npub is ${npub}`);
}
const public_key = nip19.decode(npub).data;

let relays = process.env.NOSTR_RELAYS;
if (relays == "" || relays == undefined) {
  console.log(
    `You did not set the NOSTR_RELAYS environment variable, use commas to separate relays from one another, for example`,
  );
  console.log(
    `export NOSTR_RELAYS='wss://relay.newatlantis.top/,wss://nos.lol/' `,
  );
  process.exit();
} else {
  relays = relays.split(",");
  console.log(`\nYour relay list is`);
  console.log(relays);
}

let unix_time = Math.floor((new Date()).getTime() / 1000);
let nostr_filter = {
  // "ids": ["85fb734453ea95e5147ff5d152e33102b7ac48aa827b59c33446d81374305d33"]
  // since: unix_time - 1000000,
  kinds: [10002],
  // "#p": accounts[1].public_key
  authors: [public_key],
};
let events = await nostrGet(relays, nostr_filter);

console.log(`\n\nGetting kind events for author ${npub}\n`)
console.log(JSON.stringify( events, null, 2));

process.exit()
