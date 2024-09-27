import assert from "assert"
import { Level } from 'level'
import LevelSchemaProvenance from '../LevelSchemaProvenance.js'
import { v4 as uuidv4 } from 'uuid';
import { bases } from 'multiformats/basics'
import * as raw from 'multiformats/codecs/raw'
import { sha256 } from 'multiformats/hashes/sha2'
import { CID } from 'multiformats/cid'

describe('Check if settings are set correctly', function () {
    describe('Check level works correctly', function () {
        it('Sucesfully create schemaless LevelSchemaProvenance sublevel, then run putRawCID on it', async function () {
            const myLevelDB = new Level(`./mydb/${String(uuidv4())}`, { valueEncoding: 'json' })
            const myLSPDB = new LevelSchemaProvenance(myLevelDB)
            const sublevelName = uuidv4()
            const createLSPDBTest = await myLSPDB.createSchemaSublevel({
                sublevel_name: sublevelName,
                sublevel_settings: {
                    "LocalCIDStore": true,
                    "IndexProvenance": false,
                    "CollectionProvenance": true,
                    "CollectionProvenanceTimestamped": false,
                    "CollectionProvenanceStoreLocal": true,
                    "SchemaEnforced": false,
                    "ValueEncoding": "utf8"
                }
            })
            assert.equal(createLSPDBTest.status, "success")

            const textEncoder = new TextEncoder()
            const data = "Hello World"
            const uint8Data = textEncoder.encode(data)
            const rawBase58btcEncode = bases.base58btc.encode(uint8Data)
            const hash = await sha256.digest(uint8Data)
            const myCID = CID.create(1, raw.code, hash)

            let putRawCIDTest = await myLSPDB.putRawCID({
                sublevel_name: sublevelName,
                CID: String(myCID),
                content: rawBase58btcEncode,
                CID_sublevel_name: "CIDs"
            })
            assert.equal(putRawCIDTest.status, "success")
        })
    })
})