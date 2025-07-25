import { generateSecretKey, getPublicKey } from 'nostr-tools'
import { generateSeedWords, validateWords, privateKeyFromSeedWords } from 'nostr-tools/nip06'

const mnemonic = "curve foster stay broccoli equal icon bamboo champion casino impact will damp"
let mnemonic_validation = validateWords(mnemonic)
let secret_key = privateKeyFromSeedWords(mnemonic, "", 0)
let public_key = getPublicKey(secret_key)



import { finalizeEvent, verifyEvent } from 'nostr-tools'

let signedEvent = finalizeEvent({
  kind: 1,
  created_at: Math.floor(Date.now() / 1000),
  tags: [
    ['p', "dentish"],
    ['CIDA', "bagaaieraqeiesbwbkdgq5wzdcdxdqn6jgnbltptfsuufeq6wn5kuiikujkda"]
  ],
  content: 'hello',
}, secret_key)

let isGood = verifyEvent(signedEvent)


console.log("\nsignedEvent")
console.log(signedEvent)
console.log("\nisGood")
console.log(isGood)


import { Relay } from 'nostr-tools'
// import 'websocket-polyfill' // UNCOMMENT WHEN USING BUN

const relay = await Relay.connect('ws://localhost:7000')
console.log(`\nconnected to ${relay.url}`)


relay.subscribe([
    {
      "#CIDA": []
    },
  ], {
    onevent(event) {
      console.log('got event:', event)
    }
  })



console.log("\nsignedEvent")
console.log(signedEvent)
console.log(JSON.stringify(signedEvent, null, 2))

await relay.publish(signedEvent)
