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
  tags: [],
  content: 'hello',
}, secret_key)

let isGood = verifyEvent(signedEvent)

signedEvent = {
  kind: 308018,
  created_at: 1729427962,
  tags: [
    [ "title", "Twitch" ], [ "d", "twitch" ]
  ],
  content: "",
  pubkey: "a582c706dad3a703d6c0211dc25e6bb2cbc9081ced7c2adbab91150b905645a7",
  id: "884209832ccb2a6ac11c9631f1f819b46eacf406a7199847fa1ee177e88b56dc",
  sig: "7a861d4a4c867266cf86880b7aea2d6eb7f9a16e9579049dc42f650794e3d3c5d079026248ecb439c9c5ab5629e8d3ba6586881dcc0aab9de6327e331eb8ce5e"
}

console.log("\nsignedEvent")
console.log(signedEvent)
console.log("\nisGood")
console.log(isGood)


import { Relay } from 'nostr-tools'
// import 'websocket-polyfill' // UNCOMMENT WHEN USING BUN

const relay = await Relay.connect('wss://relay.newatiantis.top')
console.log(`\nconnected to ${relay.url}`)


relay.subscribe([
    {
      kinds: [1],
      authors: [public_key],
    },
  ], {
    onevent(event) {
      console.log('got event:', event)
    }
  })



console.log("\nsignedEvent")
console.log(signedEvent)

await relay.publish(signedEvent)
