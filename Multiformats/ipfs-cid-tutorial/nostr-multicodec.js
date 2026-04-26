import { nip19 } from "nostr-tools"
import { varint } from 'multiformats'
import { base58btc } from 'multiformats/bases/base58'
import { fromHex, toHex } from "multiformats/bytes"

let npub_raw = "npub1ek36rza32zjc8pec8daz6veyywv55xtemzaxr0saymd04a4r66eqpxphdl"
               "npub1ek36rza32zjc8pec8daz6veyywv55xtemzaxr0saymd04a4r6 c4a26l2"
let npub_hex = nip19.decode(npub_raw)
let npub_bytes = fromHex(npub_hex.data)

console.log(npub_raw)
console.log(npub_hex)
console.log(npub_bytes)

// this is from the multicodec table
const codec = { name: 'secp256k1-pub', code: 0xe7 }

// thing we want to multibase encode
const thing = npub_bytes

// set up a target byte array we want to encode to,
// first by figuring out how long it needs to be, then prefixing it with the code
const el = varint.encodingLength(codec.code)
const encoded = new Uint8Array(thing.length + el)
varint.encodeTo(codec.code, encoded) // set prefix
encoded.set(thing, el) // add the original bytes



// if you want it multibase encoded, use encode(), if you want just
// base encoded (without multibase prefix), use baseEncode()
const baseEncoded = base58btc.encode(encoded)
console.log("\n\nbaseEncoded")
console.log(baseEncoded)



let baseDecoded = base58btc.decode(baseEncoded)
console.log("\n\nbaseDecoded")
console.log(baseDecoded)
console.log(baseDecoded.slice(2, -1))



let baseToHex = toHex(baseDecoded.slice(2))
console.log("\n\nbaseToHex")
console.log(baseToHex)
console.log("npub_hex")
console.log(npub_hex)

let nip19Back = nip19.npubEncode(baseToHex)
console.log("nip19Back")
console.log(nip19Back)