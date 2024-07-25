import { CID } from 'multiformats/cid'
import * as json from 'multiformats/codecs/json'
import * as raw from 'multiformats/codecs/raw'
import { sha256 } from 'multiformats/hashes/sha2'


var data = { hello: 'world' }
var hash = await sha256.digest(json.encode({ hello: 'world' }))
var myCID = CID.create(1, json.code, hash)
console.log(`Data     : ${JSON.stringify(data, null, 2)}`)
console.log(`Hash     : ${hash.bytes}`)
console.log(`CID      : ${myCID}`)
console.log(`CID Code : ${myCID.code}`)
//> CID(bagaaierasords4njcts6vs7qvdjfcvgnume4hqohf65zsfguprqphs3icwea)

const textEncoder = new TextEncoder();
var data = "Hello World"
var uint8Data = textEncoder.encode("Hello World")
var rawEncode = raw.encode(uint8Data)
var hash = await sha256.digest(rawEncode)
var myCID = CID.create(1, raw.code, hash)
console.log("\n\n")
console.log(`Data :     ${JSON.stringify(data, null, 2)}`)
console.log(`uint8Data: ${uint8Data}`)
console.log(`rawEncode: ${rawEncode}`)
console.log(`Hash :     ${hash.bytes}`)
console.log(`CID  :     ${myCID}`)
console.log(`CID Code : ${myCID.code}`)

// console.log("\n\n\n")
// console.log("Hash Data")
// console.log(typeof(hash.bytes))
// console.log(hash.bytes)
// console.log(typeof(hash.digest))
// console.log(hash.digest)
// console.log(hash.size)


var data = data = {
    x: 1,
    /* CID instances are encoded as links */
    y: [2, 3, CID.parse('QmaozNR7DZHQK1ZcU9p7QdrshMvXqWK6gpu5rmrkPdT3L4')],
    z: {
      a: CID.parse('QmaozNR7DZHQK1ZcU9p7QdrshMvXqWK6gpu5rmrkPdT3L4'),
      b: null,
      c: 'string'
    }
  }
var hash = await sha256.digest(json.encode({ hello: 'world' }))
var myCID = CID.create(1, json.code, hash)
console.log(`Data     : ${JSON.stringify(data, null, 2)}`)
console.log(data)
console.log(`Hash     : ${hash.bytes}`)
console.log(`CID      : ${myCID}`)
console.log(`CID Code : ${myCID.code}`)
//> CID(bagaaierasords4njcts6vs7qvdjfcvgnume4hqohf65zsfguprqphs3icwea)

