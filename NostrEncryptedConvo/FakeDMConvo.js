/*
Inputs
  * NSEC
  * NSEC1
  * NOSTR_RELAYS
*/
import { LoremIpsum } from "lorem-ipsum";
import genNostrAccount from './lib/genNostrAccount'
import { finalizeEvent, getPublicKey, nip04 } from "nostr-tools";
import { bytesToHex } from '@noble/hashes/utils'
import { SimplePool } from "nostr-tools/pool";

let nsec = process.env.NSEC3;
if (nsec == "" || nsec == undefined) {
  console.log(
    `You did not set the NSEC environment variable with your nostr key`,
  );
  process.exit();
} else {
  console.log(`\nYour nsec is ${nsec}`);
}

let nsec1 = process.env.NSEC4;
if (nsec == "" || nsec == undefined) {
  console.log(
    `You did not set the NSEC environment variable with your nostr key`,
  );
  process.exit();
} else {
  console.log(`\nYour nsec is ${nsec1}`);
}

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
  console.log(relays)
}

let accounts = []
accounts.push(genNostrAccount(nsec))
accounts.push(genNostrAccount(nsec1))
console.log(accounts)

const lorem = new LoremIpsum({
  sentencesPerParagraph: {
    max: 8,
    min: 4,
  },
  wordsPerSentence: {
    max: 16,
    min: 4,
  },
});

const myPool = new SimplePool()
for (var i = 0; i < 2; i++) {
  var random_text = lorem.generateParagraphs(3);
  var encrypted_text = await nip04.encrypt(
    accounts[0].secret_key,
    accounts[1].pubkey,
    random_text,
  );
  var signedEvent = finalizeEvent({
    kind: 4,
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ["p", accounts[1].pubkey],
    ],
    content: encrypted_text,
  }, accounts[0].secret_key);
  await myPool.publish(relays, signedEvent);
  console.log("accounts[1].pubkey")
  console.log(accounts[1].pubkey)
  console.log("Signed Event");
  console.log(signedEvent);
  await new Promise((r) => setTimeout(() => r(), 1000));

  // Other User
  var random_text = lorem.generateParagraphs(3);
  var encrypted_text = await nip04.encrypt(
    bytesToHex(accounts[1].secret_key),
    accounts[0].pubkey,
    random_text,
  );
  var signedEvent = finalizeEvent({
    kind: 4,
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ["p", accounts[0].pubkey],
    ],
    content: encrypted_text,
  }, accounts[1].secret_key);
  await myPool.publish(relays, signedEvent);
  console.log("Signed Event");
  console.log(signedEvent);
  await new Promise((r) => setTimeout(() => r(), 500));
}

process.exit()
