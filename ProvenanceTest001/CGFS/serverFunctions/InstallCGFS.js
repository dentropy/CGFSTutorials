import { Command } from 'commander';
import fs from 'fs'
import LevelSchemaProvenance from '../../LevelSchemaProvenance.js'
import { Level } from 'level'
import * as nip19 from 'nostr-tools/nip19'
import Ajv from 'ajv'

// Setup CLI and parse arguments from CLI
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
        console.log("raw_json that was input")
        console.log(raw_json)
        console.log()
        input_data = JSON.parse(raw_json)
    } catch (error) {
        const error_response = {
            description: `The -i input path provided ${options.input} could not be read and parsed as JSON due to error below`,
            error: String(error)
        }
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


/* Parse and validate input_data from CLI
/*
{
    "nostr_public_key": "",
    "app_dir": "",
    "level_dir" : ""
}
*/
let input_validation_schema_raw = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "Generated schema for Root",
    "type": "object",
    "properties": {
        "nostr_public_key": {
            "type": "string"
        },
        "level_dir": {
            "type": "string"
        }
    },
    "required": [
        "nostr_public_key",
        "level_dir"
    ]
}
const ajv = new Ajv()
const input_validation_schema = ajv.compile(input_validation_schema_raw)
try {
    if (input_validation_schema(input_data)) {
        const error_response = {
            status: "success"
        }
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


// Configure LevelSchemaProveance and see if it works 
let myLevelDB
let myLSPDB
let CGFS_VERSION
try {
    myLevelDB = new Level(`${input_data.level_dir}`, { valueEncoding: 'json' })
    myLevelDB.open()
    myLSPDB = new LevelSchemaProvenance(myLevelDB)
    await new Promise(resolve => setTimeout(() => resolve(), 1000));
    CGFS_VERSION = await myLSPDB.getCGFSVersion()
} catch (error) {
    const error_response = {
        status: "error",
        error: error,
        description: "Could not mount that levelDB path"
    }
    console.log(error_response)
}


// Validate nostr_public_key
try {
    nip19.decode(input_data.nostr_public_key)
} catch (error) {
    const error_response = {
        status: "error",
        error: error,
        description: "nostr_public_key is supposed to be in npub format search 'nostr nip19'"
    }
    console.log(error_response)
}

// Load Schemas
let dir = "./CGFS/sublevels"
let files = await fs.readdirSync(dir)
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
let CGFSApp = {
    sublevel_settings: {},
    sublevels: {}
}
for (var fileIndex in files) {
    let filePath = dir + "/" + files[fileIndex]
    let fileContents = fs.readFileSync(filePath)
    let sublevelName = files[fileIndex].substring(0, files[fileIndex].length - 5);
    fileContents = textDecoder.decode(fileContents)
    fileContents = JSON.parse(fileContents)
    CGFSApp.sublevel_settings[sublevelName] = fileContents
}
for (var sublevelName in CGFSApp.sublevel_settings) {
    CGFSApp.sublevels[sublevelName] = await myLSPDB.createSchemaSublevel({
        sublevel_name: sublevelName,
        sublevel_settings: CGFSApp.sublevel_settings[sublevelName].sublevel_settings
    })
    if(CGFSApp.sublevels[sublevelName].status != "success"){
        const error_response = {
            status: "error",
            error: CGFSApp.sublevels[sublevelName],
            description: "Unable to create CGFS sublevel"
        }
        console.log(error_response)
        process.exit()
    }
}

// Add nostr_public_key to root ACL

// Add Functions