import Ajv from 'ajv'
import { bases } from 'multiformats/basics'
import * as dagjson from '@ipld/dag-json'
import * as raw from 'multiformats/codecs/raw'

export default class LevelSchemaProvenance {

    constructor(levelDB) {
        // Set JSON Encoding in level_db_config
        this.level = levelDB
        this.rawSettingsSchema = {
            "$schema": "http://json-schema.org/draft-07/schema#",
            "title": "Generated schema for Root",
            "type": "object",
            "properties": {
                "LocalCIDStore": {
                    "type": "boolean"
                },
                "IndexProvenance": {
                    "type": "boolean"
                },
                "CollectionProvenance": {
                    "type": "boolean"
                },
                "CollectionProvenanceTimestamped": {
                    "type": "boolean"
                },
                "CollectionProvenanceStoreLocal": {
                    "type": "boolean"
                },
                "SchemaEnforced": {
                    "type": "boolean"
                },
                "ValueEncoding": {
                    "type": "string"
                },
                "schema": {
                    "type": "string"
                }
            },
            "required": [
                "LocalCIDStore",
                "IndexProvenance",
                "CollectionProvenance",
                "CollectionProvenanceTimestamped",
                "SchemaEnforced",
                "ValueEncoding"
            ]
        }
        this.ajv = new Ajv()
        this.settingsSchema = this.ajv.compile(this.rawSettingsSchema)
        this.textEncoder = new TextEncoder();
    }

    async createSchemaSublevel(sublevel_name, sublevel_settings) {
        // Validate Setting are valid
        try {
            this.settingsSchema(sublevel_settings)
        } catch (error) {
            return {
                status: "error",
                error: error,
                description: "Settings are invalid",
                settingsJSONSchema: this.rawSettingsSchema
            }
        }

        // Check for JSONSchema in settings and validate them
        if (sublevel_settings.SchemaEnforced == true) {
            try {
                const validate = this.ajv.compile(sublevel_settings.schema)
            } catch (error) {
                return {
                    status: "error",
                    error: error,
                    description: "JSONSchema for collection failed to compile"
                }
            }
        }

        // Check if the collection already exists or not
        let encoded_sublevel_name = this.textEncoder.encode(sublevel_name)
        let base32z_encoded_sublevel_name = bases.base32z.encode(encoded_sublevel_name)
        let collection_sublevel = this.sublevel(base32z_encoded_sublevel_name, { valueEncoding: 'json' })
        let collection_sublevel_settings = collection_sublevel.sublevel("settings", { valueEncoding: 'json' })
        try {
            await collection_sublevel_settings.get("settings")
        } catch (error) {
            return {
                status: "error",
                error: error,
                description: "Can not find settings"
            }
        }

        // Put the settings in the database
        collection_sublevel_settings.put("settings", sublevel_settings)

        // If logging is enabled log that this collection was created
        let collection_sublevel_logging = this.sublevel("logging", { valueEncoding: 'json' })
        if (this.settings.CollectionProvenance) {
            let logData = {
                "method": "create",
                "index": 0,
                "value": sublevel_settings,
            }
            if (sublevel_settings.CollectionProvenanceTimestamped) {
                logData.timestamp = Date.now().toString()
            }
            const encoded = dagjson.encode(logData)
            const hash = await sha256.digest(encoded)
            const logCID = CID.create(1, 0x0129, hash)
            if (settings.CollectionProvenanceStoreLocal) {
                let collection_sublevel_logCIDs = collection_sublevel.sublevel("logCIDs", { valueEncoding: 'buffer' })
                collection_sublevel_logCIDs.put(logCID, encoded)
            }
            else {
                return {
                    status: "error",
                    description: "Only CollectionProvenanceStoreLocal set to true is supported"
                }
            }
            collection_sublevel_logging.put("index", 0)
            collection_sublevel_logCIDs.put("0", encoded)
        }

    }

    async insert(sublevel_name, sublevel_key, sublevel_value) {
        let encoded_sublevel_name = this.textEncoder.encode(sublevel_name)
        let base32z_encoded_sublevel_name = bases.base32z.encode(encoded_sublevel_name)
        let encoded_sublevel_key = this.textEncoder.encode(sublevel_key)
        let base32z_encoded_sublevel_key = bases.base32z.encode(encoded_sublevel_key)
        let collection_sublevel = this.sublevel(base32z_encoded_sublevel_name, { valueEncoding: 'json' })
        let collection_sublevel_settings = collection_sublevel.sublevel("settings", { valueEncoding: 'json' })
        let settings = await collection_sublevel_settings.get("settings")
        let collection_sublevel_namespace = collection_sublevel.sublevel("settings", { valueEncoding: 'utf8' })

        // Check for the key in the namespace
        try {
            await collection_sublevel_namespace.get(base32z_encoded_sublevel_name)
            return {
                status: "error",
                description: "Value already exists, please use putSchema to overwrite existing data"
            }
            // Just add if not index provenance
        } catch (error) {
            // When this runs it means we can insert the value without overwriting somethign
        }

        // Setup CID Store
        if (settings.LocalCIDStore == true) {
            let collection_sublevel_CID_store = collection_sublevel.sublevel("CIDs", { valueEncoding: 'buffer' })
        }
        else {
            return {
                status: "error",
                description: "Central and Remote CID stores are not implimented yet"
            }
        }

        // Calcualte CID
        // Check codes here, https://github.com/multiformats/multicodec/blob/master/table.csv
        let encoded = null
        let storeCID = null
        if (settings.SchemaEnforced) {
            encoded = dagjson.encode(sublevel_value)
            const hash = await sha256.digest(encoded)
            storeCID = CID.create(1, 0x0129, hash)
        } else {
            encoded = raw.encode(data)
            const hash = await sha256.digest(sublevel_value)
            storeCID = CID.create(1, raw.code, hash)
        }

        // Store CID of value
        await collection_sublevel_CID_store.put(storeCID, encoded)

        // Put refernece to CID in namespace
        await collection_sublevel_namespace.put(base32z_encoded_sublevel_key, storeCID)

        if (this.settings.CollectionProvenance) {
            // Get LogCID Sublevel
            if (this.settings.CollectionProvenanceStoreLocal) {
                let collection_sublevel_logCIDs = collection_sublevel.sublevel("logCIDs", { valueEncoding: 'buffer' })
            }
            else {
                return {
                    status : "error",
                    description : "Central and Remote CID stores are not implimented yet"
                }
            }
            // Get CID sublevel
            let collection_sublevel_logging = this.sublevel("logging", { valueEncoding: 'json' })

            // Get previous log Index
            let logIndex = await collection_sublevel_logging.get("index")
            // Get the previous log CID
            let lastLogCID = collection_sublevel_logging.get(logIndex)
        
            // Generate logging object
            let lastLog = collection_sublevel_logCIDs(lastLogCID)
            lastLog = dagjson.decode(lastLog)

            // Generate CID for logging object
            let logData = {
                "method": "insert",
                "index": logIndex + 1,
                "value": sublevel_settings,
                "lastLogCID": CID.parse(lastLogCID)
            }
            if (sublevel_settings.CollectionProvenanceTimestamped) {
                logData.timestamp = Date.now().toString()
            }
            const encoded = dagjson.encode(logData)
            const hash = await sha256.digest(encoded)
            const logCID = CID.create(1, 0x0129, hash)
            if (settings.CollectionProvenanceStoreLocal) {
                let collection_sublevel_logCIDs = collection_sublevel.sublevel("logCIDs", { valueEncoding: 'buffer' })
                collection_sublevel_logCIDs.put(logCID, encoded)
            }
            else {
                return {
                    status: "error",
                    description: "Only CollectionProvenanceStoreLocal set to true is supported"
                }
            }
            // Update Logging store
            collection_sublevel_logging.put("index", logIndex + 1)
            collection_sublevel_logging.put(logIndex + 1, logCID)
            // Store CID of logging object
            collection_sublevel_logCIDs.put(logCID, encoded)
        }
    }


}
