import { getPublicKey, nip19 } from 'nostr-tools'
import { validateWords, privateKeyFromSeedWords } from 'nostr-tools/nip06'
import { LoremIpsum } from "lorem-ipsum";

// Create a bunch of nostr accounts
const mnemonic = "curve foster stay broccoli equal icon bamboo champion casino impact will damp";
const relays = [
    "ws://localhost:7007",
    "wss://relay.newatlantis.top"
]
  

let mnemonic_validation = validateWords(mnemonic)
if (!mnemonic_validation) {
    console.log("Invalid Mnemonic")
    process.exit(0);
}
let accounts = []
for (var i = 0; i < 10; i++) {
    let secret_key = privateKeyFromSeedWords(mnemonic, "", i)
    let public_key = getPublicKey(secret_key)
    let uint8_secret_key = new Buffer.from(secret_key, "hex")
    let nsec = nip19.nsecEncode(uint8_secret_key)
    let npub = nip19.npubEncode(public_key)
    accounts.push({
        secret_key: secret_key,
        public_key: public_key,
        nsec: nsec,
        npub: npub
    })
}

// Random Text Generator Class Setup
const lorem = new LoremIpsum({
    sentencesPerParagraph: {
      max: 8,
      min: 4
    },
    wordsPerSentence: {
      max: 16,
      min: 4
    }
  });


// Send a encrypted message from account 0 to account 1
import { encrypt, decrypt } from 'nostr-tools/nip04'
import { SimplePool } from "nostr-tools/pool"
import { bytesToHex, hexToBytes } from '@noble/hashes/utils'
import { finalizeEvent, verifyEvent } from 'nostr-tools'
const myPool = new SimplePool();
for( var i = 0; i < 5; i++){
    var random_text = lorem.generateParagraphs(3)
    var encrypted_text = await encrypt(bytesToHex(accounts[0].secret_key), accounts[1].public_key, random_text)
    var signedEvent = finalizeEvent({
        kind: 4,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
            ["p", accounts[1].public_key]
        ],
        content: encrypted_text,
      }, accounts[0].secret_key)
    await myPool.publish(relays, signedEvent)
    console.log("Signed Event")
    console.log(signedEvent)
    await new Promise(r => setTimeout(() => r(), 500));

    // Other User
    var random_text = lorem.generateParagraphs(3)
    var encrypted_text = await encrypt(bytesToHex(accounts[1].secret_key), accounts[0].public_key, random_text)
    var signedEvent = finalizeEvent({
        kind: 4,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
            ["p", accounts[0].public_key]
        ],
        content: encrypted_text,
      }, accounts[1].secret_key)
    await myPool.publish(relays, signedEvent)
    console.log("Signed Event")
    console.log(signedEvent)
    await new Promise(r => setTimeout(() => r(), 500));
}

// Wait a second
console.log("Waiting a second to nostr events to relay")
await new Promise(r => setTimeout(() => r(), 1000));


// Get Event off relay
export const nostrGet = async (relays, filter) => {
    const pool = new SimplePool();
    const events = await pool.querySync(relays, filter);
    pool.publi
    console.log("events");
    console.log(events);
    return events;
};
// let unix_time = Math.floor((new Date()).getTime() / 1000);
// let nostr_filter = {
//     // "ids": ["85fb734453ea95e5147ff5d152e33102b7ac48aa827b59c33446d81374305d33"]
//     // since: unix_time - 1000000,
//     kinds: [1059],
//     "#p": accounts[1].public_key
//  };
//let nostr_response = await nostrGet(relays, nostr_filter);

// Decrypt the event that was sent
// const unwrappedEvent2 = unwrapEvent(nostr_response[0], sk2)
// console.log("unwrappedEvent2")
// console.log(unwrappedEvent2)
