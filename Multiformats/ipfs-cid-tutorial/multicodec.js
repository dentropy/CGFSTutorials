import { varint } from 'multiformats'
import { base58btc } from 'multiformats/bases/base58'

// this is from the multicodec table
const codec = { name: 'ed25519-pub', code: 0xed }

// thing we want to multibase encode
const thing = new Uint8Array([0xde, 0xad, 0xbe, 0xef])

// set up a target byte array we want to encode to,
// first by figuring out how long it needs to be, then prefixing it with the code
const el = varint.encodingLength(codec.code)
const encoded = new Uint8Array(thing.length + el)
varint.encodeTo(codec.code, encoded) // set prefix
encoded.set(thing, el) // add the original bytes

// if you want it multibase encoded, use encode(), if you want just
// base encoded (without multibase prefix), use baseEncode()
const baseEncoded = base58btc.encode(encoded)
console.log(baseEncoded)