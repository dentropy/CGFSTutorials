
import { verifyEvent } from 'nostr-tools';

let example_event = {
    "kind": 69420,
    "content": "Hello, world!",
    "tags": [],
    "created_at": 0,
    "pubkey": "a1d03fdd69d330b035803b9deb0f00c463e39420a689ff2534cb854f2a15f6af",
    "id": "894a3ea54c05b988631080bcaa17016356d0cf6c6baf1e1524ecd9404760e87e",
    "sig": "e7fd91b4e2ab830ce327e0f656cdc7cf46848ba13b969ae22656633085e92cc603186161ddcb37bc7cb62c126ca1a248fd1cdb742cb479035ecbab4ef4e7e3ab"
}

let verified = verifyEvent(example_event)
console.log(verified)