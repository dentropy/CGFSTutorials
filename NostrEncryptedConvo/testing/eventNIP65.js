import { getPublicKey, nip19, nip04 } from 'nostr-tools'
import { validateWords, privateKeyFromSeedWords } from 'nostr-tools/nip06'
import { SimplePool } from "nostr-tools/pool";
import { bytesToHex } from '@noble/hashes/utils'
import { finalizeEvent, verifyEvent } from 'nostr-tools'

const mnemonic = "curve foster stay broccoli equal icon bamboo champion casino impact will damp";
let mnemonic_validation = validateWords(mnemonic)
if (!mnemonic_validation) {
    console.log("Invalid Mnemonic")
    process.exit(0);
}
let accounts = []
for (var i = 0; i < 20; i++) {
    let secret_key = privateKeyFromSeedWords(mnemonic, "", i)
    let public_key = getPublicKey(secret_key)
    let uint8_secret_key = new Buffer.from(secret_key, "hex")
    let nsec = nip19.nsecEncode(uint8_secret_key)
    let npub = nip19.npubEncode(public_key)
    accounts.push({
        secret_key: secret_key,
        pubkey: public_key,
        nsec: nsec,
        npub: npub
    })
}

const relays = [
    "ws://localhost:7007",
    // "ws://localhost:7000",
    // "wss://relay.newatlantis.top",
    // "wss://relay.damus.io/"
]
const myPool = new SimplePool();


for (var i = 0; i < accounts.length; i++){
    console.log(`Account Index = ${i}`)
    console.log(accounts[i])
    const signedEvent = finalizeEvent({
        kind: 10002,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
            ["r", "ws://localhost:7007"],
            ["r", "wss://relay.newatlantis.top"]
        ],
        content: "",
    }, accounts[i].secret_key)
    await myPool.publish(relays, signedEvent)
    console.log("Published Event")
    console.log(signedEvent)
}
