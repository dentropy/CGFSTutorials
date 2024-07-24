import { CID } from 'multiformats/cid'
import * as json from 'multiformats/codecs/json'
import * as raw from 'multiformats/codecs/raw'
import { sha256 } from 'multiformats/hashes/sha2'


var data = { hello: 'world' }
var hash = await sha256.digest(json.encode({ hello: 'world' }))
var myCID = CID.create(1, json.code, hash)
console.log(`Data : ${JSON.stringify(data, null, 2)}`)
console.log(`Hash : ${hash.bytes}`)
console.log(`CID  : ${myCID}`)
//> CID(bagaaierasords4njcts6vs7qvdjfcvgnume4hqohf65zsfguprqphs3icwea)

const textEncoder = new TextEncoder();
var data = "Hello World"
var uint8Data = textEncoder.encode("Hello World")
var hash = await sha256.digest(raw.encode(uint8Data))
var myCID = CID.create(1, raw.code, hash)
console.log("\n\n")
console.log(`Data :     ${JSON.stringify(data, null, 2)}`)
console.log(`uint8Data: ${uint8Data}`)
console.log(`Hash :     ${hash.bytes}`)
console.log(`CID  :     ${myCID}`)


// console.log("\n\n\n")
// console.log("Hash Data")
// console.log(typeof(hash.bytes))
// console.log(hash.bytes)
// console.log(typeof(hash.digest))
// console.log(hash.digest)
// console.log(hash.size)
