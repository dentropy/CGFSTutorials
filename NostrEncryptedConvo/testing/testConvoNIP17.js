import { getPublicKey, nip19 } from 'nostr-tools'
import { validateWords, privateKeyFromSeedWords } from 'nostr-tools/nip06'

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

// Send a encrypted message from account 0 to account 1
import { wrapEvent, wrapManyEvents, unwrapEvent } from 'nostr-tools/nip17'
const sk1 = accounts[0].secret_key
const sk2 = accounts[1].secret_key
const recipients = [
    { publicKey: getPublicKey(sk1), relayUrl: 'wss://localhost:7007' },
    { publicKey: getPublicKey(sk2) }, // No relay URL for this recipient
]
const message = 'Hello, this is a direct message!'
const conversationTitle = 'Private Group Conversation' // Optional
const replyTo = { eventId: 'previousEventId123' } // Optional, for replies
const wrappedEvent = wrapEvent(accounts[0].secret_key, recipients[1], message, conversationTitle, replyTo)
const unwrappedEvent = unwrapEvent(wrappedEvent, sk2)
console.log(wrappedEvent)

// Send the event
import { SimplePool } from "nostr-tools/pool";
const myPool = new SimplePool();
await myPool.publish(relays, wrappedEvent) 



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
let unix_time = Math.floor((new Date()).getTime() / 1000);
let nostr_filter = {
    // "ids": ["85fb734453ea95e5147ff5d152e33102b7ac48aa827b59c33446d81374305d33"]
    // since: unix_time - 1000000,
    kinds: [1059],
    "#p": accounts[1].public_key
  };
let nostr_response = await nostrGet(relays, nostr_filter);

// Decrypt the event that was sent
const unwrappedEvent2 = unwrapEvent(nostr_response[0], sk2)
console.log("unwrappedEvent2")
console.log(unwrappedEvent2)
