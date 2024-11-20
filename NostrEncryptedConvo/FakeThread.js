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

let ms_wait_time = 500
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
if (nsec1 == "" || nsec1 == undefined) {
  console.log(
    `You did not set the NSEC environment variable with your nostr key`,
  );
  process.exit();
} else {
  console.log(`\nYour nsec is ${nsec1}`);
}

let nsec2 = process.env.NSEC5;
if (nsec2 == "" || nsec2 == undefined) {
  console.log(
    `You did not set the NSEC environment variable with your nostr key`,
  );
  process.exit();
} else {
  console.log(`\nYour nsec is ${nsec2}`);
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

let accounts = []
accounts.push(genNostrAccount(nsec))
accounts.push(genNostrAccount(nsec1))
accounts.push(genNostrAccount(nsec2))
console.log(accounts)


const myPool = new SimplePool()

// Produce Root Message
var random_text = lorem.generateParagraphs(1);
var rootEvent = finalizeEvent({
    kind: 1,
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ["p", accounts[0].pubkey],
    ],
    content: "Root Event",
  }, accounts[0].secret_key);
await myPool.publish(relays, rootEvent);
await new Promise((r) => setTimeout(() => r(), ms_wait_time));


// First Level Responses
var random_text = lorem.generateParagraphs(1);
var signedEvent = finalizeEvent({
    kind: 1,
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ["p", accounts[0].pubkey],
      ["e", rootEvent.id, "wss://relay.newatlantis.top", "root"]
    ],
    content: random_text,
  }, accounts[1].secret_key);
await myPool.publish(relays, signedEvent);
await new Promise((r) => setTimeout(() => r(), ms_wait_time))

// Second First Level Response
var random_text = lorem.generateParagraphs(1);
var firstLevelResponse = finalizeEvent({
    kind: 1,
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ["p", accounts[0].pubkey],
      ["e", rootEvent.id, "wss://relay.newatlantis.top", "root"]
    ],
    content: random_text,
  }, accounts[1].secret_key);
await myPool.publish(relays, firstLevelResponse);
await new Promise((r) => setTimeout(() => r(), ms_wait_time))

// Third Level Response
var random_text = lorem.generateParagraphs(1);
var signedEvent = finalizeEvent({
    kind: 1,
    created_at: Math.floor(Date.now() / 1000),
    tags: [
        ["p", accounts[0].pubkey],
        ["p", accounts[1].pubkey],
        ["e", rootEvent.id, "wss://relay.newatlantis.top", "root"],
        ["e", firstLevelResponse.id, "wss://relay.newatlantis.top", "replied"]
    ],
    content: random_text,
  }, accounts[2].secret_key);
await myPool.publish(relays, signedEvent);
await new Promise((r) => setTimeout(() => r(), ms_wait_time));


console.log("\n\n")
console.log(rootEvent)
console.log("\n\n")
console.log(signedEvent)
console.log("\n\n")
console.log(firstLevelResponse)
console.log("\n\n")
console.log(signedEvent)

process.exit()
