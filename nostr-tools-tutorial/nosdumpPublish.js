import fs from 'fs';
import { Relay } from 'nostr-tools'
import { finalizeEvent, verifyEvent } from 'nostr-tools'

let raw_data = fs.readFileSync('/home/dentropy/Projects/CGFSTutorials/NostrEvents/nostr21-30818.jsonl', 'utf-8');
let raw_events = raw_data.split("\n")

// console.log("PAUL_WAS_HERE")
// console.log(raw_data)

const relay = await Relay.connect('ws://localhost:7007')
console.log("PAUL_WAS_HERE")

for( let i = 0; i < raw_events.length; i++){
    console.log(`i=${i}`)
    relay.publish(JSON.parse(raw_events[i]))
    console.log("Published an event")
}
// import { generateSecretKey, getPublicKey } from 'nostr-tools'
// import { generateSeedWords, validateWords, privateKeyFromSeedWords } from 'nostr-tools/nip06'

// const mnemonic = "curve foster stay broccoli equal icon bamboo champion casino impact will damp"
// let mnemonic_validation = validateWords(mnemonic)
// let secret_key = privateKeyFromSeedWords(mnemonic, "", 0)
// let public_key = getPublicKey(secret_key)



// import { finalizeEvent, verifyEvent } from 'nostr-tools'

// let signedEvent = finalizeEvent({
//   kind: 1,
//   created_at: Math.floor(Date.now() / 1000),
//   tags: [],
//   content: 'hello',
// }, secret_key)

// let isGood = verifyEvent(signedEvent)


// console.log("\nsignedEvent")
// console.log(signedEvent)
// console.log("\nisGood")
// console.log(isGood)


// import { Relay } from 'nostr-tools'

// const relay = await Relay.connect('ws://localhost:7000')
// console.log(`\nconnected to ${relay.url}`)


// relay.subscribe([
//     {
//       kinds: [1],
//       authors: [public_key],
//     },
//   ], {
//     onevent(event) {
//       console.log('got event:', event)
//     }
//   })



// console.log("\nsignedEvent")
// console.log(signedEvent)

// await relay.publish(signedEvent)
