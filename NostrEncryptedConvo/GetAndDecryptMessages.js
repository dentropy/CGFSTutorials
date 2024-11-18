/*
Inputs
  * NSEC
  * NPUB
  * NOSTR_RELAYS
*/

import * as nip19 from "nostr-tools/nip19";
import fetchNostrConvoAndDecrypt from "./lib/fetchNostrConvoAndDecrypt";
import { nostrGet } from "./lib/nostrGet";

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
let private_key = nip19.decode(nsec).data;

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

let convo = await fetchNostrConvoAndDecrypt(
  relays,
  public_key,
  nsec,
);

console.log("Convo Below")
console.log(convo);
