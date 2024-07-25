import Ajv from 'ajv'

export default class LevelSchema {

    constructor(myLevel){
        // Set JSON Encoding in level_db_config
        this.ajv = new Ajv()
        this.db = myLevel
        this.schemaDB = this.db.sublevel("JSONSchema", { valueEncoding: 'json' })
    }

    async putSchemaSublevel(sublevel_name, sublevel_schema){
        // Make sure not JSONSchema
        try {
            const validate = this.ajv.compile(sublevel_schema)
        } catch (error) {
            return {
                status : "error",
                error  : error,
                description : "JSONSchema failed to compile"
            }
        }
        // Check JSONSChema is JSONSchema
        try {
            // We do not want to overwtite Schemas that already exist
            let specialDB = this.db.sublevel("JSONSchema", { valueEncoding: 'json' })
            console.log("schemaDB")
            console.log(this.schemaDB)
            await this.schemaDB(sublevel_name)
        } catch (error) {
            await this.schemaDB(sublevel_name, sublevel_schema, { valueEncoding: 'json' })
            console.log(`Insert Sucessful`)
            return {
                status : "success",
            }
        }
        return {
            status : "error",
            description : "That sublevel already exists"
        }
    }

    async getJSONSchema(sublevel_name){
        try {
            let the_schema = await this.schemaDB(sublevel_name)
            return the_schema
        } catch (error) {
            return {
                status : "error",
                error  : error,
                description : "Can not find schema"
            }
        }
    }
    
    async putSchema(sublevel_name, sublevel_key, sublevel_value){
        // Get the schema from the database
        try {
            let raw_schema = await this.schemaDB(sublevel_name)
        } catch (error) {
            return {
                status : "error",
                error  : error,
                description : "Can not find schema"
            }
        }
        // Compile it, try catch not technically required
        try {
            const schema = ajv.compile(raw_schema)
        } catch (error) {
            return {
                status : "error",
                error  : error,
                description : "Could not compile schema"
            }
        }
        // Check if our data is valid
        let validation = schema(sublevel_value)
        if (validation) {
            let tmpDB = this.db.sublevel(sublevel_name, { valueEncoding: 'json' })
            tmpDB.put(sublevel_key, sublevel_value)
        }
        else {
            return {
                status : "error",
                error  : validation,
                description : "Data does not follow JSON Schema"
            }
        }

    }

    async insertSchema(sublevel_name, sublevel_key, sublevel_value){
        try {
            let tmpDB = this.db.sublevel(sublevel_name, { valueEncoding: 'json' })
            val = await this.tmpDB.get(sublevel_key)
            return {
                status : "error",
                description : "Value already exists, please use putSchema to overwrite existing data"
            }
        } catch (error) {
            await this.putSchema(tsublevel_name, sublevel_key, sublevel_value)
        }
    }

    getDB(){
        return this.db
    }

}