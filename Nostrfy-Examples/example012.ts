import { faker } from 'npm:@faker-js/faker';
import { Relay, finalizeEvent, nip19, generateSecretKey, getPublicKey, verifyEvent } from "nostr-tools";
import { Buffer } from "node:buffer"

import { NRelay1 } from "@nostrify/nostrify";
import { bytesToHex } from 'nostr-tools/utils';

let relay_urls = [
    "ws://ditto.local/relay",
    "ws://khatru.local/",
    "ws://piprelay.local/",
    "ws://sqlitenode.local/",
    "ws://rsrelay.local/",
    "ws://strfry.local/"
]
let nsec = process.argv[2]

if (nsec == undefined || nsec.length == 0){
    console.log("PLEASE INPUT NSEC AS ARGUMENT")
    process.exit()
}

let privKey = nip19.decode(nsec).data
let secretKey = bytesToHex(privKey)
let publicKey = getPublicKey(privKey)
let npub = nip19.npubEncode(publicKey)


let account0 = {
  "nsec": nsec,
  "npub": npub,
  "publicKey": publicKey,
  "secretKey": secretKey,
  "privKey": privKey
}
console.log(account0)
const username = faker.internet.username();
let picture = faker.image.avatar()
let discription = faker.food.description()
const bannerUrl = faker.image.url();

let website = faker.internet.url()
let profile = {
    "name": username,
    "display_name": username,
    "nip05": `${username}.TLD`,
    "about": `THIS IS A TEST ACCOUNTn\ ${discription}`,
    "picture": picture,
    "banner": bannerUrl,
    "website": website
}

let profile_event = finalizeEvent({
    kind: 0,
    created_at: Math.floor(Date.now() / 1000),
    tags: [],
    content: JSON.stringify(profile),
}, privKey)
let isGood = verifyEvent(profile_event)

console.log(`isGood = ${isGood}`)
console.log(profile_event)

let tags = []
for (const relay_url of relay_urls){
    tags.push(["r", relay_url])
}
let nip65_event = finalizeEvent({
    kind: 10002,
    created_at: Math.floor(Date.now() / 1000),
    tags: tags,
    content: JSON.stringify(profile),
}, privKey)
let isGood2 = verifyEvent(nip65_event)

console.log(`isGood2 = ${isGood2}\n`)

console.log(profile_event)
console.log(nip65_event)

// Create a list of relay objects on different relays
let relays = [];
for (const relay_url of relay_urls) {
    console.log(`Adding relay ${relay_url}`);
    relays.push(new NRelay1(relay_url));
}

// Choose a filter
// Run the filter
for (const relay of relays) {
    await relay.event(profile_event)
    await relay.event(nip65_event)
    console.log(`Published to ${relay.url}`)
}

// Report the Results
