import Ajv from 'ajv'
import { Level } from "level"

export default class LevelSchema extends Level {

    constructor(...args){
        // Set JSON Encoding in level_db_config
        super(...args)
        this.ajv = new Ajv()
        this.schemaSublevel = this.sublevel("JSONSchema", { valueEncoding: 'json' })
    }

    async createSchemaSublevel(sublevel_name, sublevel_schema){
        if(sublevel_name == "JSONSchema"){
            return {
                status : "error",
                description : "That sublevel name is reserved"
            }
        }

        // Validate JSONSchema is valid
        try {
            const validate = this.ajv.compile(sublevel_schema)
        } catch (error) {
            return {
                status : "error",
                error  : error,
                description : "JSONSchema failed to compile"
            }
        }

        // Check if sublevel_name is already taken
        try {
            await this.schemaSublevel.get(sublevel_name)
        } catch (error) {
            await this.schemaSublevel.put(sublevel_name, sublevel_schema)
            console.log(`Insert Sucessful`)
            return {
                status : "success"
            }
        }
        return {
            status : "error",
            description : "That sublevel already exists"
        }
    }

    async getJSONSchema(sublevel_name){
        try {
            let the_schema = await this.schemaSublevel.get(sublevel_name)
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
        let raw_schema = null
        try {
            raw_schema = await this.schemaSublevel.get(sublevel_name)
        } catch (error) {
            return {
                status : "error",
                error  : error,
                description : "Can not find schema"
            }
        }

        // Compile it, try catch not technically required
        let schema = null;
        try {
            schema = this.ajv.compile(raw_schema)
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
            try {
                let tmpDB = this.sublevel(sublevel_name, { valueEncoding: 'json' })
                tmpDB.put(sublevel_key, sublevel_value)
            } catch (error) {
                return {
                    status : "error",
                    error  : error,
                    description : "Could not put data into sublevel"
                }
            }
        }
        else {
            return {
                status : "error",
                error  : validation,
                description : "Data does not follow JSON Schema"
            }
        }
        return {
            status : "success"
        }

    }

    async insertSchema(sublevel_name, sublevel_key, sublevel_value){
        try {
            let tmpSublevel = this.sublevel(sublevel_name, { valueEncoding: 'json' })
            await tmpSublevel.get(sublevel_key)
            return {
                status : "error",
                description : "Value already exists, please use putSchema to overwrite existing data"
            }
        } catch (error) {
            return await this.putSchema(sublevel_name, sublevel_key, sublevel_value)
        }
    }

    async insert(sublevel_name, sublevel_key, sublevel_value){
        let tmpSublevel = this.sublevel(sublevel_name, { valueEncoding: 'json' })
        try {
            await tmpSublevel.get(sublevel_key)
            return {
                status : "error",
                description : "Value already exists, please use putSchema to overwrite existing data"
            }
        } catch (error) {
            return await tmpSublevel(sublevel_name, sublevel_key, sublevel_value)
        }
    }

    async delSchema(sublevel_name, sublevel_key){
        let tmpSublevel = this.sublevel(sublevel_name, { valueEncoding: 'json' })
        try {
            return await tmpSublevel.del(sublevel_key)
        } catch (error) {
            return {
                status: "error",
                description: "Could not delete that key from that sublevel",
                details: error
            }
        }
    }

    async getSchema(sublevel_name, sublevel_key){
        try {
            let tmpSublevel = this.sublevel(sublevel_name, { valueEncoding: 'json' })
            return await tmpSublevel.get(sublevel_key)
        } catch (error) {
            return {
                status : "error",
                description : "We got an error from leveldb",
                details: error
            }
        }
    }

}