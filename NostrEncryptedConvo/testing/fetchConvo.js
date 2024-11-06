import { getPublicKey, nip19 } from 'nostr-tools'
import { validateWords, privateKeyFromSeedWords } from 'nostr-tools/nip06'
import { bytesToHex, hexToBytes } from '@noble/hashes/utils'
import { finalizeEvent, verifyEvent } from 'nostr-tools'

// My Account
let npub = nip19.decode("npub1ek36rza32zjc8pec8daz6veyywv55xtemzaxr0saymd04a4r66eqpxphdl").data
const ollama_url = "http://192.168.7.209:11434"
const mnemonic = "curve foster stay broccoli equal icon bamboo champion casino impact will damp";

// Create a bunch of nostr accounts
const relays = [
    "ws://localhost:7007",
    // "wss://relay.newatlantis.top",
    // "wss://relay.damus.io/"
]


let mnemonic_validation = validateWords(mnemonic)
if (!mnemonic_validation) {
    console.log("Invalid Mnemonic")
    process.exit(0);
}
let accounts = []
for (var i = 0; i < 10; i++) {
    let secret_key = privateKeyFromSeedWords(mnemonic, "", i)
    let public_key = getPublicKey(secret_key)
    let uint8_secret_key = new Buffer.from(secret_key, "hex")
    let nsec = nip19.nsecEncode(uint8_secret_key)
    let npub = nip19.npubEncode(public_key)
    accounts.push({
        secret_key: secret_key,
        public_key: public_key,
        nsec: nsec,
        npub: npub
    })
}


import { SimplePool } from "nostr-tools/pool";
export const nostrGet = async (relays, filter) => {
    const pool = new SimplePool();
    const events = await pool.querySync(relays, filter);
    // console.log("events");
    // console.log(events);
    return events;
};



let unix_time = Math.floor((new Date()).getTime() / 1000);
let filter_from_account_0 = {
    // "ids": ["85fb734453ea95e5147ff5d152e33102b7ac48aa827b59c33446d81374305d33"]
    // since: unix_time - 1000000,
    authors: [accounts[0].public_key],
    kinds: [4],
    "#p": accounts[1].public_key
}

let filter_from_account_1 = {
    // "ids": ["85fb734453ea95e5147ff5d152e33102b7ac48aa827b59c33446d81374305d33"]
    // since: unix_time - 1000000,
    authors: [accounts[1].public_key],
    kinds: [4],
    "#p": accounts[0].public_key
};

let events_from_account_0 = await nostrGet(relays, filter_from_account_0);
let events_from_account_1 = await nostrGet(relays, filter_from_account_1);
let all_events = events_from_account_0.concat(events_from_account_1)

console.log(`events_from_account_0 ${events_from_account_0.length}`)
console.log(`events_from_account_1 ${events_from_account_1.length}`)
// console.log(all_events)


// Decrypt the messages
import { encrypt, decrypt } from 'nostr-tools/nip04'
let decrypted_events = []

for(var i = 0; i < all_events.length; i++){
    try {
        // console.log("i")
        let myEvent = all_events[i]
        // Get the p tag
        let sent_to = ""
        // console.log(myEvent)
        for(var nostr_tag_index = 0;  nostr_tag_index < myEvent.tags.length; nostr_tag_index ++){
            if(myEvent.tags[nostr_tag_index][0] == "p"){
                // console.log("SHOULD SET")
                // console.log(myEvent.tags[nostr_tag_index][1])
                sent_to = myEvent.tags[nostr_tag_index][1]
            }
        }
        if(sent_to == ""){
            console.log("Can't find p tag")
            process.error()
        }
        // Get the matching public key
        let account_sent_to = ""
        for(let account of accounts){
            if(account.public_key == sent_to){
                account_sent_to = account
            }
        }
        // console.log(account_sent_to)
        let decrypted_content = await decrypt(account_sent_to.secret_key, myEvent.pubkey, myEvent.content)
        // console.log("decrypted_content")
        // console.log(decrypted_content)
        myEvent.decrypted_content = decrypted_content
        decrypted_events.push(myEvent)
    } catch (error) {
        console.log("ERROR")
        console.log(error)
    }
}

// Sort decrypted events
decrypted_events.sort((a, b) => a.created_at - b.created_at);
console.log("decrypted_events")
console.log(decrypted_events)

// Get the last 3 messages
let prompt_messages_unformatted = decrypted_events.slice(-5)
let prompt_messages = []
for(let prompt_message of prompt_messages_unformatted){
    let role = "user"
    if (accounts[0].public_key == prompt_message.pubkey){
        role = "assistant"
    }
    prompt_messages.push({
        role: role,
        content: prompt_message.decrypted_content
    })
}

console.log("prompt_messages")
console.log(prompt_messages)
const response_001 = await fetch(`${ollama_url}/api/chat`, {
    method: "POST",
    body: JSON.stringify({
        "model": "llama3.2",
        "messages": prompt_messages,
        "stream": false
    }),
    headers: { "Content-Type": "application/json" },
});
const response_001_body = await response_001.json();
console.log("response_001_body")
console.log(response_001_body)
