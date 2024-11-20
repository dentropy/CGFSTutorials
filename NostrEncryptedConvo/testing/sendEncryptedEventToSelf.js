import { getPublicKey, nip19, nip04 } from 'nostr-tools'
import { validateWords, privateKeyFromSeedWords } from 'nostr-tools/nip06'
import { bytesToHex, hexToBytes } from '@noble/hashes/utils'
import { finalizeEvent, verifyEvent } from 'nostr-tools'
import { SimplePool } from "nostr-tools/pool";

let nsec = process.env.NSEC;
if (nsec == "" || nsec == undefined) {
    console.log(
        `You did not set the NSEC environment variable with your nostr key`,
    );
    process.exit();
} else {
    console.log(`\nYour nsec is ${nsec}`);
}

let npub = process.env.NPUB;
if (nsec == "" || nsec == undefined) {
    console.log(
        `You did not set the NPUB environment variable with who you want to send message to`,
    );
    process.exit();
} else {
    console.log(`\nYour npub is ${nsec}`);
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
    console.log(relays);
}


const encrypted_text = await nip04.encrypt(bytesToHex(nip19.decode(nsec).data), npub, 'Hi Friend')
const signedEvent = finalizeEvent({
    kind: 4,
    created_at: Math.floor(Date.now() / 1000),
    tags: [
        ["p", nip19.decode(npub).data]
    ],
    content: encrypted_text,
}, nip19.decode(pnsec).data)
console.log("signedEvent")
console.log(signedEvent)
const myPool = new SimplePool();
await myPool.publish(relays, signedEvent)
console.log("Done sending event")
