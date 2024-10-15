import { generateSecretKey, getPublicKey } from 'nostr-tools'
import { generateSeedWords, validateWords, privateKeyFromSeedWords } from 'nostr-tools/nip06'
import * as nip19 from 'nostr-tools/nip19'
/* Process nsec
export NSEC=
*/
const raw_nsec = process.env.NSEC;
console.log(raw_nsec)
let nsec = nip19.decode(raw_nsec)
console.log(nsec)
let sender_raw_public_key = await getPublicKey(nsec.data)
// Process npub

const raw_npub = 'npub17pfs355fdw83u8ga4se9u4xy2smkk0mz5ld6zpl9uqs8zjhckqdsp9ym48'
let npub = nip19.decode(raw_npub)
console.log(npub)


import { finalizeEvent, verifyEvent } from 'nostr-tools'

let firstEvent = finalizeEvent({
  kind: 1,
  created_at: Math.floor(Date.now() / 1000),
  tags: [],
  content: 'So what are we going to do about cultural drift changing the meaning of words and phrases?',
}, nsec.data)


let firstReplyEvent = finalizeEvent({
  kind: 1,
  created_at: Math.floor(Date.now() / 1000),
  tags: [
    // ["e", <event-id>, <relay-url>, <marker>, <pubkey>]
    ['e',
      firstEvent.id, // event-id
      '', // realy-url
      'reply', // marker eg. "reply", "root", or "mention"
      sender_raw_public_key  // pubkey
    ]
  ],
  content: 'Yea that gen Z slang is killler brah need some based zingers in here',
}, nsec.data)


let secondReplyEvent = finalizeEvent({
  kind: 1,
  created_at: Math.floor(Date.now() / 1000),
  tags: [
    // [ "p", "f05308d2896b8f1e1d1dac325e54c454376b3f62a7dba107e5e020714af8b01b", "", "mention"]
    ['p', npub.data, '', 'mention'],
    // ["e", <event-id>, <relay-url>, <marker>, <pubkey>]
    ['e',
      firstReplyEvent.id, // event-id
      '', // realy-url
      'reply', // marker eg. "reply", "root", or "mention"
      sender_raw_public_key  // pubkey
    ]
  ],
  content: 'Well my dude we need to get some definitions first, \n\nPlease Define "Cultural Drift"',
}, nsec.data)

import { Relay } from 'nostr-tools'

const relay = await Relay.connect('ws://localhost:7007')
console.log(`\nconnected to ${relay.url}`)


relay.subscribe([
    {
      kinds: [1],
      authors: [nsec.data],
    },
  ], {
    onevent(event) {
      console.log('got event:', event)
    }
  })



console.log("\nfirstReplyEvent")
console.log(firstReplyEvent)

await relay.publish(firstEvent)
console.log("Published firstEvent")
console.log(firstEvent.id)
await relay.publish(firstReplyEvent)
console.log("Published firstReplyEvent")
console.log(firstReplyEvent.id)
await relay.publish(secondReplyEvent)
console.log("Published secondReplyEvent")
console.log(secondReplyEvent.id)