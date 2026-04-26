import { nip19 } from "nostr-tools"
let npub_raw = "npub1ek36rza32zjc8pec8daz6veyywv55xtemzaxr0saymd04a4r66eqpxphdl"
let npub_hex = nip19.decode(npub_raw)
let npub_two = nip19.npubEncode(npub_hex.data)

console.log(npub_raw)
console.log(npub_two)