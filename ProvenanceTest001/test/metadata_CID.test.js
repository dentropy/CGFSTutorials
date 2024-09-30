import assert from "assert"
import { Level } from 'level'
import LevelSchemaProvenance from '../LevelSchemaProvenance.js'
import { v4 as uuidv4 } from 'uuid';
import { bases } from 'multiformats/basics'
import * as raw from 'multiformats/codecs/raw'
import { sha256 } from 'multiformats/hashes/sha2'
import { CID } from 'multiformats/cid'

describe('Test metadata_CID functionality', function () {
    describe('Test core metadata_CID functionality', function () {
        it('Sucesfully submit a metadata_CID with a insert request', async function () {
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

            // Generate metadata CID
            const textEncoder = new TextEncoder();
            const data = "This is a test"
            const metadata_data = "Hello World"
            const uint8Data = textEncoder.encode(metadata_data)
            const rawEncode = raw.encode(uint8Data)
            const hash = await sha256.digest(rawEncode)
            const myCID = CID.create(1, raw.code, hash)

            const insertResponse = await myLSPDB.insert({
                sublevel_name: sublevelName, 
                sublevel_key: "testkey", 
                sublevel_value: data,
                metadata_CID: String(myCID)
            })
            assert.equal(insertResponse.status, "success")
            const getResponse = await myLSPDB.get({
                sublevel_name: sublevelName, 
                sublevel_key: "testkey"
            })
            const textDecoder = new TextDecoder();
            const bufferResponse = bases.base58btc.decode(getResponse)
            const stringResponse = await textDecoder.decode(bufferResponse)
            assert.equal(stringResponse, data)
        })
        it('Sucesfully require CID_metadata', async function () {
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
                    "ValueEncoding": "utf8",
                    "RequireMetadataCID": true
                }
            })

            // Generate metadata CID
            const textEncoder = new TextEncoder();
            const data = "This is a test"
            const metadata_data = "Hello World"
            const uint8Data = textEncoder.encode(metadata_data)
            const rawEncode = raw.encode(uint8Data)
            const hash = await sha256.digest(rawEncode)
            const myCID = CID.create(1, raw.code, hash)

            const insertResponse = await myLSPDB.insert({
                sublevel_name: sublevelName, 
                sublevel_key: "testkey", 
                sublevel_value: data,
                metadata_CID: String(myCID)
            })
            assert.equal(insertResponse.status, "success")
            const getResponse = await myLSPDB.get({
                sublevel_name: sublevelName, 
                sublevel_key: "testkey"
            })
            const textDecoder = new TextDecoder();
            const bufferResponse = bases.base58btc.decode(getResponse)
            const stringResponse = await textDecoder.decode(bufferResponse)
            assert.equal(stringResponse, data)
            const insertResponse2 = await myLSPDB.insert({
                sublevel_name: sublevelName, 
                sublevel_key: "testkey", 
                sublevel_value: data
            })
            assert.equal(insertResponse2.status, "error")
        })
    })
})