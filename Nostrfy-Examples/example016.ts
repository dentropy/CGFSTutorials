import { NSchema as n } from "@nostrify/nostrify";
import { generateSecretKey, getPublicKey, verifyEvent } from "@nostr/tools";
import { NRelay1, NSecSigner } from "@nostrify/nostrify";

const sk: Uint8Array = generateSecretKey(); // `sk` is a Uint8Array
const pk: string = getPublicKey(sk); // `pk` is a hex string
const signer = new NSecSigner(sk);
const unix_time: number = Math.floor((new Date()).getTime() / 1000);
const username: string = faker.internet.username();

const event = await signer.signEvent({
    kind: 3036,
    content: "Hello, world!",
    tags: [
        ["d", username.toLowerCase()],
        ["L", "nip05.domain"],
        ["l", "test.local".toLowerCase(), "nip05.domain"],
        ["p", pk],
    ],
    created_at: unix_time,
});

let filter = {
    kinds: [3036],
    "d": [],
    "L": [],
    "l": [],
    "p": []
}