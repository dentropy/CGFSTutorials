import { Command } from 'commander';
import fs from 'fs';
import Ajv from 'ajv'
import LevelSchemaProvenance from '../../LevelSchemaProvenance.js'
import { Level } from 'level'

let textDecoder = new TextDecoder();

const program = new Command();

program
    .name('CGFS AddAdmin')
    .description('CLI tool to interface with CGFS App')
    .version('0.0.1');

program
    .option('-i, --input <file_path>', 'filepath of JSON used for this command')
    .option('-r, --raw <raw_json>', 'input raw JSON')

program.parse(process.argv);

const options = program.opts();

console.log(options)

if (options.input === undefined && options.raw === undefined) {
    const error_response = {
        description: "Please provide an input using --input <file_path> or --r <raw_json>"
    }
    console.log(JSON.stringify(error_response, null, 2))
    process.exit()
}
if (options.input != undefined && options.raw != undefined) {
    const error_response = {
        description: "Both -i file_path and -r raw_json flags were used, please only use one"
    }
    console.log(JSON.stringify(error_response, null, 2))
    process.exit()
}

let raw_json = {}
let input_data = {}
if (options.input != undefined) {
    try {
        raw_json = await fs.readFileSync(options.input, "utf8")
        console.log(raw_json)
        input_data = JSON.parse(raw_json)
    } catch (error) {
        const error_response = {
            description: `The -i input path provided ${options.input} could not be read and parsed as JSON due to error below`,
            error: String(error)
        }
        console.log(error)
        console.log(JSON.stringify(error_response, null, 2))
        process.exit()
    }
}

if (options.raw != undefined) {
    try {
        input_data = JSON.parse(options.raw)
    } catch (error) {
        const error_response = {
            description: `The -r raw data could not be read and parsed as JSON due to error below`,
            raw_data: options.raw,
            error: error
        }
        console.log(JSON.stringify(error_response, null, 2))
        process.exit()
    }
}

console.log(input_data)


/*
{
    "level_dir": "",
    "app_did": "",
    "nostr_private_key": "",
    "nostr_key_status": ""
}
*/

let input_validation_schema_raw = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "Generated schema for Root",
    "type": "object",
    "properties": {
        "level_dir": {
            "type": "string"
        },
        "nostr_private_key": {
            "type": "string"
        },
        "nostr_key_status": {
            "type": "string"
        }
    },
    "required": [
        "level_dir",
        "nostr_private_key",
        "nostr_key_status"
    ]
}

const ajv = new Ajv()
const input_validation_schema = ajv.compile(input_validation_schema_raw)
try {
    if( input_validation_schema(input_data) ) {
        const error_response = {
            status: "success"
        }
        console.log(error_response)
    } else {
        const error_response = {
            status: "error",
            description: "That JSON does not match the expected output of the JSONSchema listed in this error",
            JSONSchema: input_validation_schema_raw
        }
        console.log(error_response)
    }
} catch (error) {
    const error_response = {
        status: "error",
        error: error,
        description: "That JSON does not match the expected output of the JSONSchema listed in this error",
        JSONSchema: input_validation_schema_raw
    }
    console.log(error_response)
}

// Setup LevelSchemaProvenance

let myLevelDB
try {
    myLevelDB = new Level(`${input_data.level_dir}`, { valueEncoding: 'json' })
} catch (error) {
    const error_response = {
        status: "error",
        error: error,
        description: "Could not mount that levelDB path"
    }
    console.log(error_response)
}
let myLSPDB = new LevelSchemaProvenance(myLevelDB)
let CGFS_VERSION = await myLSPDB.getCGFSVersion()

console.log(CGFS_VERSION)

// Check if the Root ACL sublevel exists, if it does not create IT
let ACLSublevelSettings = await myLSPDB.getSublevelSettings("ACLs")
console.log(ACLSublevelSettings)

// Validate if nostr_private_key is a nostr private key

// Calculate the public key of nostr_private_key

// Perform Upsert