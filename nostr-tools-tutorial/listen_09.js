import { Relay } from 'nostr-tools'
// import 'websocket-polyfill' // UNCOMMENT WHEN USING BUN

// 'wss://relay.damus.io'
const relay = await Relay.connect('wss://nos.lol')
console.log(`\nconnected to ${relay.url}`)

import * as nip19 from 'nostr-tools/nip19'
let npub_raw = 'npub17pfs355fdw83u8ga4se9u4xy2smkk0mz5ld6zpl9uqs8zjhckqdsp9ym48'
let npub = nip19.decode(npub_raw)
console.log(npub)
// relay.subscribe([
//     {
//       // "#p": ["dentish"],
//       'CID' : ["bagaaieraqeiesbwbkdgq5wzdcdxdqn6jgnbltptfsuufeq6wn5kuiikujkda"]
//     },
//   ], {
//     onevent(event) {
//       console.log('got event:', event)
//     }
//   })



let events = []
const sub = relay.subscribe([
  {
    authors: [npub.data],
    // [`${npub.data}`]: []
    kinds: [1],
    since: 1728329649 - 1000,
    // ["#p"]: ["55a3bae6e50964b38d1d669b78cb4aa86c1bbc08c82e9cae5e522e412e89c50c"]
  },
], {
  onevent(event) {
    console.log('we got the event we wanted:', event)
    events.push(event)
  },
  oneose() {
    sub.close()
    console.log(events)
  }
})


