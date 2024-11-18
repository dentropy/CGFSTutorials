/*
Inputs
  * NSEC
  * NPUB
  * NOSTR_RELAYS
*/
import 'dotenv/config'
import fetchNostrConvoAndDecrypt from "./lib/fetchNostrConvoAndDecrypt";

console.log(process.env)

let nsec = process.env.NSEC3;
console.log(nsec);
if (nsec == "" || nsec == undefined) {
  console.log(
    `You did not set the NSEC environment variable with your nostr key`,
  );
  process.exit();
} else {
  console.log(`\nYour nsec is ${nsec}`);
}

let npub = process.env.NPUB4;
console.log(npub);
if (npub == "" || npub == undefined) {
  console.log(
    `You did not set the NPUB environment variable with your nostr key`,
  );
  process.exit();
} else {
  console.log(`\nYour npub is ${npub}`);
}

console.log("process.env.NOSTR_RELAYS")
console.log(process.env.NOSTR_RELAYS)
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
  nsec,
  npub,
);

console.log("Convo Below")
console.log(convo);
