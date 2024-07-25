import { encode, decode } from '@ipld/dag-json'
import { CID } from 'multiformats'
import { sha256 } from 'multiformats/hashes/sha2'

import * as dagPB from '@ipld/dag-pb'
import { code } from 'multiformats/codecs/json'

const data = {
  x: 1,
  /* CID instances are encoded as links */
  y: [2, 3, CID.parse('QmaozNR7DZHQK1ZcU9p7QdrshMvXqWK6gpu5rmrkPdT3L4')],
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



console.log("data")
console.log(data)
console.log("encoded")
console.log(encoded)
console.log("\ncidv0")
console.log(cidv0)
console.log(cidv0.code)
console.log("\ncidv1")
console.log(cidv1)
console.log(cidv1.code)

// let decoded = decode(encoded)
// decoded.y[0] // 2
// let test_var = CID.asCID(decoded.z.a) // cid instance
// console.log("\n\ntest_var")
// console.log(test_var)
