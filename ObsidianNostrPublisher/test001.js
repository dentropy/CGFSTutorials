import { generateSecretKey, getPublicKey } from 'nostr-tools'
import { generateSeedWords, validateWords, privateKeyFromSeedWords } from 'nostr-tools/nip06'
import * as nip19 from 'nostr-tools/nip19'
import { finalizeEvent, verifyEvent } from 'nostr-tools'
import { Relay } from 'nostr-tools'


const mnemonic = "curve foster stay broccoli equal icon bamboo champion casino impact will damp"
let mnemonic_validation = validateWords(mnemonic)
let secret_key = privateKeyFromSeedWords(mnemonic, "", 13)
let public_key = getPublicKey(secret_key)

console.log("Using public_key")
console.log(public_key)


const relay = await Relay.connect('wss://relay.newatlantis.top')

function convertString(str) {
    return str.toLowerCase().replace(/[^a-z]/g, '-');
}

// function transformString(str) {
//     return str.toLowerCase().replace(/\d+/g, '-').replace(/[^a-z]/g, '_');
// }

function transformString(str) {
    return str.toLowerCase().replace(/ /g, '_').replace(/\d+/g, '-').replace(/[^\w-]/g, '-');
}


function removeYamlFromMarkdown(markdown) {
    if (markdown == undefined) {
        return undefined
    }
    const lines = markdown.trim().split('\n');
    if (lines[0].trim() === '---') {
        let index = lines.indexOf('---', 1);
        if (index !== -1) {
            lines.splice(0, index + 1);
        }
    }
    const updatedMarkdown = lines.join('\n').trim();
    return updatedMarkdown;
}

import { Database } from "bun:sqlite";

// const db = await new Database("./pkm.sqlite");
const db = await new Database("./pkm.sqlite");
let query = `SELECT * FROM markdown_nodes;`

query = `SELECT *  from markdown_nodes where id in (SELECT to_node_id from markdown_edges where title='index') or title = 'index'; `

let documents = db.query(query).all()
console.log(`Got ${documents.length} Documents`)
for (var i = 0; i < documents.length; i++) {
    await new Promise(r => setTimeout(() => r(), 1000));
    console.log("Fetching Document");
    let tags = [
        ['d', convertString(documents[i].title)],
        ['#d', convertString(documents[i].title)]
    ]
    if(convertString(documents[i].title) != transformString(documents[i].title)){
        tags.push(['d', transformString(documents[i].title)])
        tags.push(['#d', transformString(documents[i].title)])
    }
    let signedEvent = finalizeEvent({
        kind: 30818,
        created_at: Math.floor(Date.now() / 1000),
        tags: tags,
        content: removeYamlFromMarkdown(documents[i].raw_markdown),
    }, secret_key)
    let published = await relay.publish(signedEvent)
    let naddr_info = {
        identifier: convertString(documents[i].title),
        pubkey: public_key,
        kind: 30818,
        relays: ["wss://relay.newatlantis.top"]
    }
    let naddr = nip19.naddrEncode(naddr_info)
    let raw_name_naddr_info = {
        identifier: convertString(documents[i].title),
        pubkey: public_key,
        kind: 30818,
        relays: ["wss://relay.newatlantis.top"]
    }
    let raw_name_naddr = nip19.naddrEncode(raw_name_naddr_info)
    console.log(`Sending ${documents[i].title}`)
    console.log("published")
    console.log(published)
    console.log(signedEvent)
    console.log("addr")
    console.log(naddr)
    console.log("raw_name_naddr")
    console.log(raw_name_naddr)
    console.log("\n\n")
}
console.log("Done")
