import { generateSecretKey, getPublicKey } from 'nostr-tools'
import { generateSeedWords, validateWords, privateKeyFromSeedWords } from 'nostr-tools/nip06'
import { finalizeEvent, verifyEvent } from 'nostr-tools'
import { Relay } from 'nostr-tools'


const mnemonic = "curve foster stay broccoli equal icon bamboo champion casino impact will damp"
let mnemonic_validation = validateWords(mnemonic)
let secret_key = privateKeyFromSeedWords(mnemonic, "", 0)
let public_key = getPublicKey(secret_key)

const relay = await Relay.connect('wss://relay.newatlantis.top')

function convertString(str) {
    return str.toLowerCase().replace(/[^a-z]/g, '-');
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

const db = await new Database("./pkm.sqlite");
let query = `SELECT * FROM markdown_nodes;`
let documents = db.query(query).all()
console.log("Got Documents")
for (var i = 0; i < documents.length; i++) {
    await new Promise(r => setTimeout(() => r(), 1000));
    console.log("Fetching Document");
    let signedEvent = finalizeEvent({
        kind: 30818,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
            ['title', documents[i].title],
            ['d', convertString(documents[i].title)],
            ['#d', convertString(documents[i].title)],
        ],
        content: removeYamlFromMarkdown(documents[i].raw_markdown),
    }, secret_key)
    let published = await relay.publish(signedEvent)
    console.log(signedEvent)
    console.log("EVENT_SHOULD_HAVE_BEEN_SENT")
}
console.log("DONE")


console.log(documents)

