import fs from 'fs';
import { CID } from 'multiformats/cid'
import { encode, decode, code } from 'multiformats/codecs/raw'
import { sha256 } from 'multiformats/hashes/sha2'
import * as dagPB from '@ipld/dag-pb'

const filePath = './helloworld';
let value = await fs.readFileSync(filePath)
let data = await encode(value)
const hash = await sha256.digest(data)
const cidv0 = CID.create(0, dagPB.code, hash)
const cidv1 = CID.create(1, code, hash)


console.log("\nhash")
console.log(hash)
console.log(Buffer.from(hash.digest).toString('hex'))
console.log(Buffer.from(hash.bytes).toString('hex'))
console.log("\nvalue")
console.log(value)
console.log("\ndata")
console.log(data)
console.log("\ncode")
console.log(code)
console.log("\ncidv0")
console.log(cidv0)
console.log("\ncidv1")
console.log(cidv1)