import { getPublicKey, nip19 } from 'nostr-tools'
import { validateWords, privateKeyFromSeedWords } from 'nostr-tools/nip06'
import { bytesToHex, hexToBytes } from '@noble/hashes/utils'
import { finalizeEvent, verifyEvent } from 'nostr-tools'

// My Account
let npub = nip19.decode("npub1ek36rza32zjc8pec8daz6veyywv55xtemzaxr0saymd04a4r66eqpxphdl").data

// Create a bunch of nostr accounts
const mnemonic = "curve foster stay broccoli equal icon bamboo champion casino impact will damp";
const relays = [
    "ws://localhost:7007",
    "ws://localhost:7000",
    // "wss://relay.newatlantis.top",
    "wss://relay.damus.io/"
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
import { encrypt, decrypt } from 'nostr-tools/nip04'
const encrypted_text = await encrypt(bytesToHex(accounts[0].secret_key), npub, 'Hi Friend')

console.log("encrypted_text")
console.log(encrypted_text)


import { SimplePool } from "nostr-tools/pool";
export const nostrGet = async (relays, filter) => {
    const pool = new SimplePool();
    const events = await pool.querySync(relays, filter);
    pool.publi
    console.log("events");
    console.log(events);
    return events;
}

const signedEvent = finalizeEvent({
    kind: 4,
    created_at: Math.floor(Date.now() / 1000),
    tags: [
        ["p", npub]
    ],
    content: encrypted_text,
}, accounts[0].secret_key)
console.log("signedEvent")
console.log(signedEvent)
const myPool = new SimplePool();
await myPool.publish(relays, signedEvent)
console.log("Done sending event")
