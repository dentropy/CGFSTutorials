import { CID } from 'multiformats'
import * as raw from 'multiformats/codecs/raw'
import { sha256 } from 'multiformats/hashes/sha2'

const textEncoder = new TextEncoder();
var helloworld = "Hello World"
var uint8Data = textEncoder.encode(helloworld)
var rawEncode = raw.encode(uint8Data)
var testhash = await sha256.digest(rawEncode)
var myCID = CID.create(1, raw.code, testhash)

import { encode, decode } from '@ipld/dag-json'
import { code } from 'multiformats/codecs/json'
import * as dagPB from '@ipld/dag-pb'

const data = {
    x: 1,
    /* CID instances are encoded as links */
    y: [2, 3, myCID],
    z: {
        a: CID.parse('QmaozNR7DZHQK1ZcU9p7QdrshMvXqWK6gpu5rmrkPdT3L4'),
        b: null,
        c: 'string'
    }
}
let encoded = encode(data)
const hash = await sha256.digest(encoded)
const cidv0 = CID.create(0, dagPB.code, hash)
const cidv1 = CID.create(1, code, hash)
let decoded = decode(encoded)

console.log("\n\n")
console.log("myCID")
console.log( myCID )

console.log("\n\n")
console.log("data")
console.log(data)

console.log("\n\n")
console.log("cidv0")
console.log(cidv0)
console.log(cidv0.code)
console.log("cidv1")
console.log(cidv1)
console.log(cidv1.code)

console.log("\n\n")
console.log("encoded")
console.log(encoded)

console.log("\n\n")
console.log("decoded")
console.log(decoded)

console.log("\n\n")
console.log("json_coded")
console.log(JSON.stringify(decoded, null, 2))

console.log("\n\n")
console.log("recoded")
console.log(encode(JSON.parse(JSON.stringify(decoded, null, 2))))
let decoded2 = decode(encoded)

console.log("\n\n")
console.log("decoded2")
console.log(decoded2)


