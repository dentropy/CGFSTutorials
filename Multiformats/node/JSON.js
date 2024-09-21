// Source: https://github.com/multiformats/js-multiformats?tab=readme-ov-file#about
import { CID } from 'multiformats/cid'
import * as json from 'multiformats/codecs/json'
import { sha256 } from 'multiformats/hashes/sha2'

const bytes = json.encode({ hello: 'world' })

const hash = await sha256.digest(bytes)
const cid = CID.create(1, 0x0129, hash)
//> CID(bagaaierasords4njcts6vs7qvdjfcvgnume4hqohf65zsfguprqphs3icwea)