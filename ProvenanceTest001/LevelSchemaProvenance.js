import Ajv from 'ajv'
import { bases } from 'multiformats/basics'

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
        if(sublevel_settings.SchemaEnforced == true) {
            try {
                const validate = this.ajv.compile(sublevel_settings.schema)
            } catch (error) {
                return {
                    status : "error",
                    error  : error,
                    description : "JSONSchema for collection failed to compile"
                }
            }
        }

        // Check if the collection already exists or not
        let encoded_sublevel_name = this.textEncoder.encode(sublevel_name)
        let base32z_encoded_sublevel_name = bases.base32z.encode(encoded_sublevel_name)
        let collection_sublevel = this.sublevel(base32z_encoded_sublevel_name, { valueEncoding: 'json' })
        let collection_sublevel_settings = collection_sublevel.sublevel("settings", { valueEncoding: 'json' })
        try {
            raw_schema = await collection_sublevel_settings.get("settings")
        } catch (error) {
            return {
                status : "error",
                error  : error,
                description : "Can not find settings"
            }
        }

        // Put the settings in the database
        collection_sublevel_settings.put("settings",sublevel_settings)

        // If logging is enabled log that this collection was created
        let collection_sublevel_logging = this.sublevel("logging", { valueEncoding: 'json' })
        if(ublevel_settings.CollectionProvenance){
            collection_sublevel_logging.put("index", { "current" : 1 })
            if(sublevel_settings.CollectionProvenanceTimestamped){
                collection_sublevel_logging.put("0", {
                    "method": "create",
                    "value" : sublevel_settings,
                    "timestamp": Date.now().toString() // Unix time with miliseconds
                })
            } else {
                collection_sublevel_logging.put("0", {
                    "method": "create",
                    "value" : sublevel_settings
                })
            }
        }

    }


}
