import { RetriveThread } from './lib/RetriveThread.js';

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

let thread = await RetriveThread(relays, "2ee07e818195d4131c5d65fe9d7b461e1321b86cb320e2d0952ea71efb75c78f")
console.log(thread)