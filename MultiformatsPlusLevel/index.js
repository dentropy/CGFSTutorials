import * as ipld from '@ipld/dag-json'
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
let encoded = ipld.encode(data)
const hash = await sha256.digest(encoded)
const cidv0 = CID.create(0, dagPB.code, hash)
const cidv1 = CID.create(1, code, hash)


import { Level } from "level"

const db = new Level('./db', { valueEncoding: 'buffer' })
await db.put(cidv1, encoded)
let levelEncoed = await db.get(cidv1)
let levelDecoded = ipld.decode(levelEncoed)
console.log(levelDecoded)