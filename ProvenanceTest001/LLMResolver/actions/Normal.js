import { Command } from 'commander';
import fs from 'fs'
import LevelSchemaProvenance from '../../LevelSchemaProvenance.js'
import { Level } from 'level'
import * as nip19 from 'nostr-tools/nip19'
import Ajv from 'ajv'
import { generateSecretKey, getPublicKey } from 'nostr-tools/pure'
import { SimplePool } from 'nostr-tools/pool'
import * as nip04 from 'nostr-tools/nip04'
import { finalizeEvent, verifyEvent } from 'nostr-tools'
import { Relay } from 'nostr-tools'

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
        "nostr_private_key": {
            "type": "string"
        },
        "app_dir": {
            "type": "string"
        },
        "level_dir": {
            "type": "string"
        },
        "LLM_URL": {
            "type": "string"
        }
    },
    "required": [
        "nostr_private_key",
        "app_dir",
        "level_dir",
        "LLM_URL"
    ]
}
const ajv = new Ajv()
const input_validation_schema = ajv.compile(input_validation_schema_raw)
try {
    if (input_validation_schema(input_data)) {
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

// Configure LevelSchemaProveance and see if it works 
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

// Validate nostr_public_key
let nsec = null
let public_key = null
try {
    nsec = await nip19.decode(input_data.nostr_private_key)
    public_key = getPublicKey(nsec.data)
} catch (error) {
    const error_response = {
        status: "error",
        error: error,
        description: "nostr_public_key is supposed to be in npub format search 'nostr nip19'"
    }
    console.log(error_response)
}


console.log(`nip19 app key ${nip19.npubEncode(public_key)}`)

async function process_nostr_event(relay, event) {
    console.log("Trying to connect")
    console.log("Connected")
    console.log("RUNNING process_nostr_event")
    // Try and decrypt Nostr response
    // let encrypted_messsage = null
    // try {
    //     encrypted_messsage = await nip04.decrypt(nsec.data, event.pubkey, event.content)
    // } catch (error) {
    //     // Send nostr reply back
    //     let error_response = {
    //         "status": "error",
    //         "description": "we could not decrypt your resposne"
    //     }
    //     let ciphertext = await nip04.encrypt(nsec.data, event.pubkey, JSON.stringify(error_response, null, 2))
    //     let signedEvent = finalizeEvent({
    //         kind: 1,
    //         created_at: Math.floor(Date.now() / 1000),
    //         tags: [
    //             // ["p", `${event.pubkey}`]
    //         ],
    //         content: JSON.stringify(error_response, null, 2),
    //     }, nsec.data)

    //     let isGood = verifyEvent(signedEvent)
    //     let relay_response = await relay.publish(relays, signedEvent)
    //     console.log("relay_response_1")
    //     console.log(relay_response)
    // }
    // console.log("\nencrypted_messsage")
    // console.log(encrypted_messsage)
    console.log("No Encrypted Stuff Here")

    // Send response to the user saying we recieved the response
    let response_to_user = {
        "status": "success",
        "description": "Running your query on the LLM now"
    }
    // let ciphertext = await nip04.encrypt(nsec.data, event.pubkey, JSON.stringify(response_to_user, null, 2))
    let signedEvent = finalizeEvent({
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
            // ["p", `${event.pubkey}`]
        ],
        content: JSON.stringify(response_to_user, null, 2),
    }, nsec.data)
    let isGood = verifyEvent(signedEvent)
    console.log("isGood_001")
    console.log(isGood)
    let relay_response = await relay.publish(signedEvent)
    console.log("relay_response_2")
    console.log(relay_response)

    // Send the response to the LLM
    let post_data = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "model": "llama3:8b",
            "stream": false,
            "messages": [
                {
                    "role": "user",
                    "content": event.content
                }
            ]
        })
    }
    console.log("post_data")
    console.log(post_data)
    const llm_fetch = await fetch(
        input_data.LLM_URL,
        post_data
        );
    const llm_response = await llm_fetch.json(); // HTML string
    // TODO check if response if valid

    // Send response to the user
    // ciphertext = await nip04.encrypt(nsec.data, event.pubkey, llm_response.message.content)
    signedEvent = finalizeEvent({
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
            // ["p", `${event.pubkey}`]
        ],
        content: llm_response.message.content,
    }, nsec.data)
    console.log("signedEvent")
    console.log(signedEvent)
    isGood = verifyEvent(signedEvent)
    let final_publish = await relay.publish(signedEvent)
    console.log("relay_response_3")
    console.log(final_publish)

}


// Setup Nostr Subscription
const pool = new SimplePool()
const relays = [
    // 'ws://localhost:7000',
    'wss://e.nos.lol/',
    // 'wss://nos.lol/',
    // 'wss://nostr-pub.wellorder.net/',
    // 'wss://nostr-verified.wellorder.net/',
    // 'wss://nostr.bitcoiner.social/',
    // 'wss://nostr.einundzwanzig.space/',
    // 'wss://nostr.land/',
    // 'wss://offchain.pub/',
    // 'wss://purplepag.es/',
    // 'wss://relay.damus.io/',
    // 'wss://relay.nostr.bg/',
    // 'wss://relay.primal.net/',
    // 'wss://relay.snort.social/'
]
const relay = await Relay.connect('wss://nos.lol/')
console.log("public_key")
console.log(public_key)
const sub = relay.subscribe([
    {
        kinds: [1],
        since: 1728329649 - 365,
        ["#p"]: [public_key]
    },
], {
    onevent(event) {
        console.log("PAUL_WAS_HERE")
        console.log('we got the event we wanted:', event)
        process_nostr_event(relay, event)
    }
})

// pool.subscribeMany(
//     relays,
//     [
//         {
//             kinds: [1],
//             since: 1728329649 - 365,
//             ["#p"]: [public_key]
//         },
//     ], {
//     async onevent(event) {
//         console.log("PAUL_WAS_HERE")
//         console.log('we got the event we wanted:', event)
//         await process_nostr_event(pool, relays, event)
//     }
// })