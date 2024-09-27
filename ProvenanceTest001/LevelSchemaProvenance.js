import Ajv from 'ajv'
import { bases } from 'multiformats/basics'
import * as dagjson from '@ipld/dag-json'
import * as raw from 'multiformats/codecs/raw'
import { sha256 } from 'multiformats/hashes/sha2'
import { CID } from 'multiformats/cid'



export default class LevelSchemaProvenance {

    constructor(levelDB) {
        // Set JSON Encoding in level_db_config
        this.level = levelDB
        this.level.open()
        this.settingsRawSchema = {
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
                "IndexProvenanceTimestamp": {
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
                "Schema": {
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
        this.createSchemaSublevelRawSchema = {
            "$schema": "http://json-schema.org/draft-07/schema#",
            "title": "Generated schema for Root",
            "type": "object",
            "properties": {
                "sublevel_name": {
                    "type": "object",
                    "properties": {},
                    "required": []
                },
                "sublevel_settings": {
                    "type": "object",
                    "properties": {},
                    "required": []
                }
            },
            "required": [
                "sublevel_name",
                "sublevel_settings"
            ]
        }
        this.getRawSchema = {
            "$schema": "http://json-schema.org/draft-07/schema#",
            "title": "Generated schema for Root",
            "type": "object",
            "properties": {
                "sublevel_name": {
                    "type": "object",
                    "properties": {},
                    "required": []
                },
                "sublevel_key": {
                    "type": "object",
                    "properties": {},
                    "required": []
                }
            },
            "required": [
                "sublevel_name",
                "sublevel_key"
            ]
        }
        this.changeRawSchmea = {
            "$schema": "http://json-schema.org/draft-07/schema#",
            "title": "Generated schema for Root",
            "type": "object",
            "properties": {
                "sublevel_name": {
                    "type": "object",
                    "properties": {},
                    "required": []
                },
                "sublevel_key": {
                    "type": "object",
                    "properties": {},
                    "required": []
                },
                "sublevel_value": {
                    "type": "object",
                    "properties": {},
                    "required": []
                }
            },
            "required": [
                "sublevel_name",
                "sublevel_key",
                "sublevel_value"
            ]
        }
        this.ajv = new Ajv()
        this.settingsSchema = this.ajv.compile(this.settingsRawSchema)
        this.createSchemaSublevelSchema = this.ajv.compile(this.createSchemaSublevelRawSchema)
        this.getSchema = this.ajv.compile(this.getRawSchema)
        this.changeSchema = this.ajv.compile(this.changeRawSchmea)
        this.textEncoder = new TextEncoder();
    }

    async createSchemaSublevel(input_data) {
        try {
            this.createSchemaSublevelSchema(input_data)
        } catch (error) {
            return {
                status: "error",
                error: error,
                description: "Invalid input_data",
                settingsJSONSchema: this.createSchemaSublevelRawSchema
            }
        }

        let sublevel_settings = input_data.sublevel_settings
        let sublevel_name = input_data.sublevel_name
        try {
            this.settingsSchema(sublevel_settings)
        } catch (error) {
            return {
                status: "error",
                error: error,
                description: "Settings are invalid",
                settingsJSONSchema: this.settingsRawSchema
            }
        }
        if (sublevel_settings.LocalCIDStore == false) {
            return {
                status: "error",
                description: "RemoteCIDStore functionality is not yet implimented"
            }
        }
        if (sublevel_settings.CollectionProvenanceStoreLocal == false) {
            return {
                status: "error",
                description: "Remote CollectionProvenanceStoreLocal is not implimented yet"
            }
        }

        // Check for JSONSchema in settings and validate them
        if (sublevel_settings.SchemaEnforced == true) {
            try {
                const validate = this.ajv.compile(sublevel_settings.Schema)
            } catch (error) {
                return {
                    status: "error",
                    error: error,
                    description: "JSONSchema for collection failed to compile, make sure schema is included when SchemaEnforced is set to true"
                }
            }
        }

        // Check if the collection already exis or not
        let encoded_sublevel_name = this.textEncoder.encode(sublevel_name)
        let base32z_encoded_sublevel_name = bases.base32z.encode(encoded_sublevel_name)
        let collection_sublevel = await this.level.sublevel(base32z_encoded_sublevel_name, { valueEncoding: 'json' })
        let CID_sublevel = await collection_sublevel.sublevel("CIDs", { valueEncoding: 'json' })
        let collection_sublevel_settings = await collection_sublevel.sublevel("settings", { valueEncoding: 'json' })
        try {
            const tmpSettings = await collection_sublevel_settings.get("settings")
            return {
                status: "error",
                description: "This sublevel already exists",
                settings: tmpSettings
            }
        } catch (error) {

        }

        // Put the settings in the database
        await collection_sublevel_settings.put("settings", sublevel_settings)

        // Store CID_store settings
        let CID_store_settings = {
            "CIDs": { type: "local" }
        }
        if (sublevel_settings.CollectionProvenance) {
            CID_store_settings["logCIDs"] = { type: "local" }
        }

        // If logging is enabled log that this collection was created
        let collection_sublevel_logging = await collection_sublevel.sublevel("logging", { valueEncoding: 'json' })
        if (sublevel_settings.CollectionProvenance) {
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
            let collection_sublevel_logCIDs = null
            if (sublevel_settings.CollectionProvenanceStoreLocal) {
                collection_sublevel_logCIDs = await CID_sublevel.sublevel("logCIDs", { valueEncoding: 'buffer' })
                await collection_sublevel_logCIDs.put(logCID, encoded)
            }
            else {
                return {
                    status: "error",
                    description: "Only CollectionProvenanceStoreLocal set to true is supported"
                }
            }
            await collection_sublevel_logging.put("index", 0)
            await collection_sublevel_logging.put("0", logCID.toV1())
        }
        return {
            status: "success"
        }

    }

    async get(input_data) {
        let sublevel_name = input_data.sublevel_name
        let sublevel_key = input_data.sublevel_key
        try {
            this.getSchema(input_data)
        } catch (error) {
            return {
                status: "error",
                error: error,
                description: "Invalid input_data",
                settingsJSONSchema: this.createSchemaSublevelRawSchema
            }
        }
        let encoded_sublevel_name = this.textEncoder.encode(sublevel_name)
        let base32z_encoded_sublevel_name = bases.base32z.encode(encoded_sublevel_name)
        let encoded_sublevel_key = this.textEncoder.encode(sublevel_key)
        let base32z_encoded_sublevel_key = bases.base32z.encode(encoded_sublevel_key)
        let collection_sublevel = this.level.sublevel(base32z_encoded_sublevel_name, { valueEncoding: 'json' })
        let CID_sublevel = await collection_sublevel.sublevel("CIDs", { valueEncoding: 'json' })
        let collection_sublevel_settings = collection_sublevel.sublevel("settings", { valueEncoding: 'json' })
        let settings = await collection_sublevel_settings.get("settings")
        let collection_sublevel_namespace = collection_sublevel.sublevel("namespace", { valueEncoding: 'json' })

        // Check for the key in the namespace
        let value_CID = null
        try {
            value_CID = await collection_sublevel_namespace.get(base32z_encoded_sublevel_key)
        } catch (error) {
            return {
                status: "error",
                description: "Could not find value"
            }
        }
        let collection_sublevel_CID_store = CID_sublevel.sublevel("CIDs", { valueEncoding: "utf8" })
        if (settings.SchemaEnforced) {
            let encodedCIDValue = await collection_sublevel_CID_store.get(value_CID["/"])
            let decodedData = bases.base58btc.decode(encodedCIDValue)
            let jsonData = dagjson.decode(decodedData)
            if (settings.IndexProvenance) {
                let encodedCIDValueMetadata = await collection_sublevel_CID_store.get(jsonData.currentCID)
                let decodedMetaData = bases.base58btc.decode(encodedCIDValueMetadata)
                jsonData = dagjson.decode(decodedMetaData)
            }
            return jsonData
        } else {
            let encodedCIDValue = await collection_sublevel_CID_store.get(value_CID["/"])
            if (settings.IndexProvenance) {
                let encodedCIDValueMetadata = await collection_sublevel_CID_store.get(jsonData.currentCID)
                let decodedMetaData = bases.base58btc.decode(encodedCIDValueMetadata)
                jsonData = dagjson.decode(decodedMetaData)
            }
            return encodedCIDValue
        }
    }

    async insert(input_data) {
        try {
            this.changeSchema(input_data)
        } catch (error) {
            return {
                status: "error",
                error: error,
                description: "Invalid input_data",
                settingsJSONSchema: this.changeRawSchmea
            }
        }
        let {sublevel_name, sublevel_key, sublevel_value} = input_data

        let encoded_sublevel_name = this.textEncoder.encode(sublevel_name)
        let base32z_encoded_sublevel_name = bases.base32z.encode(encoded_sublevel_name)
        let encoded_sublevel_key = this.textEncoder.encode(sublevel_key)
        let base32z_encoded_sublevel_key = bases.base32z.encode(encoded_sublevel_key)
        let collection_sublevel = this.level.sublevel(base32z_encoded_sublevel_name, { valueEncoding: 'json' })
        let CID_sublevel = await collection_sublevel.sublevel("CIDs", { valueEncoding: 'json' })
        let collection_sublevel_settings = collection_sublevel.sublevel("settings", { valueEncoding: 'json' })
        let settings = await collection_sublevel_settings.get("settings")
        let collection_sublevel_namespace = collection_sublevel.sublevel("namespace", { valueEncoding: 'json' })

        // Check for the key in the namespace
        let check_key_exists = null
        try {
            await collection_sublevel_namespace.get(base32z_encoded_sublevel_key)
            check_key_exists = true
        } catch (error) {
            // When this runs it means we can insert the value without overwriting somethign
            check_key_exists = false
        }
        if (check_key_exists) {
            return {
                status: "error",
                description: "Value already exists, please use putSchema to overwrite existing data"
            }
        }

        // Setup CID Store
        let collection_sublevel_CID_store = null
        if (settings.LocalCIDStore) {
            collection_sublevel_CID_store = CID_sublevel.sublevel("CIDs", { valueEncoding: 'utf8' })
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
        let base58btcEncoded = null
        if (settings.SchemaEnforced) {
            // Check the schema against the data coming in
            let json_schema_checker = this.ajv.compile(settings.Schema)

            let result_schema_check = json_schema_checker(sublevel_value)

            if (result_schema_check) {
                encoded = dagjson.encode(sublevel_value)
                const hash = await sha256.digest(encoded)
                storeCID = CID.create(1, 0x0129, hash)
                base58btcEncoded = bases.base58btc.encode(encoded)
            } else {
                return {
                    status: "error",
                    description: "The input value did not match the JSONSchema"
                }
            }
        } else {
            // TODO, should the raw data coming in already be base encoded?
            if (typeof (sublevel_value) == "string") {
                if (sublevel_value[0] != "z") {
                    encoded = this.textEncoder.encode(sublevel_value)
                    base58btcEncoded = bases.base58btc.encode(encoded)
                } else {
                    encoded = sublevel_value
                }

            }
            if (typeof (sublevel_value) == "object") {
                encoded = this.textEncoder.encode(JSON.stringify(sublevel_value))
                base58btcEncoded = bases.base58btc.encode(encoded)
            }
            const hash = await sha256.digest(encoded)
            storeCID = CID.create(1, raw.code, hash)
        }

        // Store CID of value
        await collection_sublevel_CID_store.put(storeCID, base58btcEncoded)

        // Put refernece to CID in namespace
        if (settings.IndexProvenance) {
            let indexMetadata = {
                previousCID: null,
                currentCID: storeCID
            }
            if (settings.IndexProvenanceTimestamp) {
                indexMetadata.timestamp = Date.now().toString()
            }
            const encoded = dagjson.encode(indexMetadata)
            const hash = await sha256.digest(encoded)
            const metadataCID = CID.create(1, 0x0129, hash)
            const metadataBase58btcEncoded = bases.base58btc.encode(encoded)
            await collection_sublevel_CID_store.put(metadataCID, metadataBase58btcEncoded)
            await collection_sublevel_namespace.put(base32z_encoded_sublevel_key, metadataCID)
        } else {
            await collection_sublevel_namespace.put(base32z_encoded_sublevel_key, storeCID)
        }

        // TODO we gotta read the settings from levelDB

        if (settings.CollectionProvenance) {
            // Get LogCID Sublevel
            let collection_sublevel_logCIDs = null
            if (settings.CollectionProvenanceStoreLocal) {
                collection_sublevel_logCIDs = await CID_sublevel.sublevel("logCIDs", { valueEncoding: 'buffer' })
            }
            else {
                return {
                    status: "error",
                    description: "Central and Remote CID stores are not implimented yet"
                }
            }

            // Get CID sublevel
            let collection_sublevel_logging = collection_sublevel.sublevel("logging", { valueEncoding: 'json' })

            // Get previous log Index
            let logIndex = await collection_sublevel_logging.get("index")

            // Get the previous log CID
            let lastLogCID = await collection_sublevel_logging.get("0")

            // Generate CID for logging object
            let logData = {
                "method": "insert",
                "index": logIndex + 1,
                "value": storeCID,
                "lastLogCID": lastLogCID["/"]
            }
            const encoded = dagjson.encode(logData)
            const hash = await sha256.digest(encoded)
            const logCID = CID.create(1, 0x0129, hash)
            if (settings.CollectionProvenanceTimestamped) {
                logData.timestamp = Date.now().toString()
            }

            if (settings.CollectionProvenanceStoreLocal) {
                let collection_sublevel_logCIDs = CID_sublevel.sublevel("logCIDs", { valueEncoding: 'buffer' })
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
        return {
            status: "success"
        }
    }

    async update(sublevel_name, sublevel_key, sublevel_value) {
        let encoded_sublevel_name = this.textEncoder.encode(sublevel_name)
        let base32z_encoded_sublevel_name = bases.base32z.encode(encoded_sublevel_name)
        let encoded_sublevel_key = this.textEncoder.encode(sublevel_key)
        let base32z_encoded_sublevel_key = bases.base32z.encode(encoded_sublevel_key)
        let collection_sublevel = this.level.sublevel(base32z_encoded_sublevel_name, { valueEncoding: 'json' })
        let CID_sublevel = await collection_sublevel.sublevel("CIDs", { valueEncoding: 'json' })
        let collection_sublevel_settings = collection_sublevel.sublevel("settings", { valueEncoding: 'json' })
        let settings = await collection_sublevel_settings.get("settings")
        let collection_sublevel_namespace = collection_sublevel.sublevel("namespace", { valueEncoding: 'json' })

        // Check for the key in the namespace
        let check_key_exists = null
        let namespace_CID_pointer = null
        try {
            namespace_CID_pointer = await collection_sublevel_namespace.get(base32z_encoded_sublevel_key)
            check_key_exists = true
        } catch (error) {
            // When this runs it means we can insert the value without overwriting somethign
            check_key_exists = false
        }
        if (!check_key_exists) {
            return {
                status: "error",
                description: "Value has not been inserted or upserted yet, please use one of those functions"
            }
        }

        // Setup CID Store
        let collection_sublevel_CID_store = null
        if (settings.LocalCIDStore) {
            collection_sublevel_CID_store = CID_sublevel.sublevel("CIDs", { valueEncoding: 'utf8' })
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
        let base58btcEncoded = null
        if (settings.SchemaEnforced) {
            // Check the schema against the data coming in
            let json_schema_checker = this.ajv.compile(settings.Schema)

            let result_schema_check = json_schema_checker(sublevel_value)

            if (result_schema_check) {
                encoded = dagjson.encode(sublevel_value)
                const hash = await sha256.digest(encoded)
                storeCID = CID.create(1, 0x0129, hash)
                base58btcEncoded = bases.base58btc.encode(encoded)
            } else {
                return {
                    status: "error",
                    description: "The input value did not match the JSONSchema"
                }
            }
        } else {
            // TODO, should the raw data coming in already be base encoded?
            if (typeof (sublevel_value) == "string") {
                if (sublevel_value[0] != "z") {
                    encoded = this.textEncoder.encode(sublevel_value)
                    base58btcEncoded = bases.base58btc.encode(encoded)
                } else {
                    encoded = sublevel_value
                }

            }
            if (typeof (sublevel_value) == "object") {
                encoded = this.textEncoder.encode(JSON.stringify(sublevel_value))
                base58btcEncoded = bases.base58btc.encode(encoded)
            }
            const hash = await sha256.digest(encoded)
            storeCID = CID.create(1, raw.code, hash)
        }

        // Store CID of value
        await collection_sublevel_CID_store.put(storeCID, base58btcEncoded)

        // Put refernece to CID in namespace
        if (settings.IndexProvenance) {
            // Get the metadata CID
            let metadataBase58 = await collection_sublevel_CID_store.get(namespace_CID_pointer["/"])
            let metadataBuffer = bases.base58btc.decode(metadataBase58)
            let metadataJSON = dagjson.decode(metadataBuffer)
            let indexMetadata = {
                previousCID: metadataJSON.currentCID,
                currentCID: storeCID
            }
            if (settings.IndexProvenanceTimestamp) {
                indexMetadata.timestamp = Date.now().toString()
            }
            const encoded = dagjson.encode(indexMetadata)
            const hash = await sha256.digest(encoded)
            const metadataCID = CID.create(1, 0x0129, hash)
            const metadataBase58btcEncoded = bases.base58btc.encode(encoded)
            await collection_sublevel_CID_store.put(metadataCID, metadataBase58btcEncoded)
            await collection_sublevel_namespace.put(base32z_encoded_sublevel_key, metadataCID)
        } else {
            await collection_sublevel_namespace.put(base32z_encoded_sublevel_key, storeCID)
        }

        // TODO we gotta read the settings from levelDB

        if (settings.CollectionProvenance) {
            // Get LogCID Sublevel
            let collection_sublevel_logCIDs = null
            if (settings.CollectionProvenanceStoreLocal) {
                collection_sublevel_logCIDs = await CID_sublevel.sublevel("logCIDs", { valueEncoding: 'buffer' })
            }
            else {
                return {
                    status: "error",
                    description: "Central and Remote CID stores are not implimented yet"
                }
            }

            // Get CID sublevel
            let collection_sublevel_logging = collection_sublevel.sublevel("logging", { valueEncoding: 'json' })

            // Get previous log Index
            let logIndex = await collection_sublevel_logging.get("index")

            // Get the previous log CID
            let lastLogCID = await collection_sublevel_logging.get("0")

            // Generate CID for logging object
            let logData = {
                "method": "update",
                "index": logIndex + 1,
                "value": storeCID,
                "lastLogCID": lastLogCID["/"]
            }
            const encoded = dagjson.encode(logData)
            const hash = await sha256.digest(encoded)
            const logCID = CID.create(1, 0x0129, hash)
            if (settings.CollectionProvenanceTimestamped) {
                logData.timestamp = Date.now().toString()
            }

            if (settings.CollectionProvenanceStoreLocal) {
                let collection_sublevel_logCIDs = CID_sublevel.sublevel("logCIDs", { valueEncoding: 'buffer' })
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
        return {
            status: "success"
        }
    }

    async upsert(sublevel_name, sublevel_key, sublevel_value) {
        let encoded_sublevel_name = this.textEncoder.encode(sublevel_name)
        let base32z_encoded_sublevel_name = bases.base32z.encode(encoded_sublevel_name)
        let encoded_sublevel_key = this.textEncoder.encode(sublevel_key)
        let base32z_encoded_sublevel_key = bases.base32z.encode(encoded_sublevel_key)
        let collection_sublevel = this.level.sublevel(base32z_encoded_sublevel_name, { valueEncoding: 'json' })
        let CID_sublevel = await collection_sublevel.sublevel("CIDs", { valueEncoding: 'json' })
        let collection_sublevel_settings = collection_sublevel.sublevel("settings", { valueEncoding: 'json' })
        let settings = await collection_sublevel_settings.get("settings")
        let collection_sublevel_namespace = collection_sublevel.sublevel("namespace", { valueEncoding: 'json' })

        // Check for the key in the namespace
        let check_key_exists = null
        let namespace_CID_pointer = null
        try {
            namespace_CID_pointer = await collection_sublevel_namespace.get(base32z_encoded_sublevel_key)
            check_key_exists = true
        } catch (error) {
            // When this runs it means we can insert the value without overwriting somethign
            check_key_exists = false
        }

        // Setup CID Store
        let collection_sublevel_CID_store = null
        if (settings.LocalCIDStore) {
            collection_sublevel_CID_store = CID_sublevel.sublevel("CIDs", { valueEncoding: 'utf8' })
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
        let base58btcEncoded = null
        if (settings.SchemaEnforced) {
            // Check the schema against the data coming in
            let json_schema_checker = this.ajv.compile(settings.Schema)

            let result_schema_check = json_schema_checker(sublevel_value)

            if (result_schema_check) {
                encoded = dagjson.encode(sublevel_value)
                const hash = await sha256.digest(encoded)
                storeCID = CID.create(1, 0x0129, hash)
                base58btcEncoded = bases.base58btc.encode(encoded)
            } else {
                return {
                    status: "error",
                    description: "The input value did not match the JSONSchema"
                }
            }
        } else {
            // TODO, should the raw data coming in already be base encoded?
            if (typeof (sublevel_value) == "string") {
                if (sublevel_value[0] != "z") {
                    encoded = this.textEncoder.encode(sublevel_value)
                    base58btcEncoded = bases.base58btc.encode(encoded)
                } else {
                    encoded = sublevel_value
                }

            }
            if (typeof (sublevel_value) == "object") {
                encoded = this.textEncoder.encode(JSON.stringify(sublevel_value))
                base58btcEncoded = bases.base58btc.encode(encoded)
            }
            const hash = await sha256.digest(encoded)
            storeCID = CID.create(1, raw.code, hash)
        }

        // Store CID of value
        await collection_sublevel_CID_store.put(storeCID, base58btcEncoded)

        // Put refernece to CID in namespace
        if (settings.IndexProvenance) {
            // Get the metadata CID
            let indexMetadata = null
            if (check_key_exists) {
                let metadataBase58 = await collection_sublevel_CID_store.get(namespace_CID_pointer["/"])
                let metadataBuffer = bases.base58btc.decode(metadataBase58)
                let metadataJSON = dagjson.decode(metadataBuffer)
                indexMetadata = {
                    previousCID: metadataJSON.currentCID,
                    currentCID: storeCID
                }
            }
            else {
                indexMetadata = {
                    previousCID: null,
                    currentCID: storeCID
                }
            }
            if (settings.IndexProvenanceTimestamp) {
                indexMetadata.timestamp = Date.now().toString()
            }
            const encoded = dagjson.encode(indexMetadata)
            const hash = await sha256.digest(encoded)
            const metadataCID = CID.create(1, 0x0129, hash)
            const metadataBase58btcEncoded = bases.base58btc.encode(encoded)
            await collection_sublevel_CID_store.put(metadataCID, metadataBase58btcEncoded)
            await collection_sublevel_namespace.put(base32z_encoded_sublevel_key, metadataCID)
        } else {
            await collection_sublevel_namespace.put(base32z_encoded_sublevel_key, storeCID)
        }

        // TODO we gotta read the settings from levelDB

        if (settings.CollectionProvenance) {
            // Get LogCID Sublevel
            let collection_sublevel_logCIDs = null
            if (settings.CollectionProvenanceStoreLocal) {
                collection_sublevel_logCIDs = await CID_sublevel.sublevel("logCIDs", { valueEncoding: 'buffer' })
            }
            else {
                return {
                    status: "error",
                    description: "Central and Remote CID stores are not implimented yet"
                }
            }

            // Get CID sublevel
            let collection_sublevel_logging = collection_sublevel.sublevel("logging", { valueEncoding: 'json' })

            // Get previous log Index
            let logIndex = await collection_sublevel_logging.get("index")

            // Get the previous log CID
            let lastLogCID = await collection_sublevel_logging.get("0")

            // Generate CID for logging object
            let logData = {
                "method": "upsert",
                "index": logIndex + 1,
                "value": storeCID,
                "lastLogCID": lastLogCID["/"]
            }
            const encoded = dagjson.encode(logData)
            const hash = await sha256.digest(encoded)
            const logCID = CID.create(1, 0x0129, hash)
            if (settings.CollectionProvenanceTimestamped) {
                logData.timestamp = Date.now().toString()
            }

            if (settings.CollectionProvenanceStoreLocal) {
                let collection_sublevel_logCIDs = CID_sublevel.sublevel("logCIDs", { valueEncoding: 'buffer' })
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
        return {
            status: "success"
        }
    }

    async del() {
        return {
            status: "error",
            description: "Not yet implimented."
        }
    }


}
