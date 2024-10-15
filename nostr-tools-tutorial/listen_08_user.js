import { Relay } from 'nostr-tools'
import * as nip19 from 'nostr-tools/nip19'
import * as nip04 from 'nostr-tools/nip04'
import { bytesToHex, hexToBytes } from '@noble/hashes/utils'
// import 'websocket-polyfill' // UNCOMMENT WHEN USING BUN

const relay = await Relay.connect('wss://relay.damus.io')
let npub = nip19.decode("npub17pfs355fdw83u8ga4se9u4xy2smkk0mz5ld6zpl9uqs8zjhckqdsp9ym48")
let nsec = nip19.decode("")
console.log(npub)
console.log(nsec)
console.log(nsec.data.toString(16))
console.log(`\nconnected to ${relay.url}`)


relay.subscribe([
    {
      // "#p": ["dentish"],
      'authors' : [npub.data],
      "kinds": [4]
    },
  ], {
    async onevent(event) {
      console.log('got event:', event)
      console.log(nsec.data)
      console.log(nsec.data.toString())
      console.log(event.pubkey)
      console.log(event.content)
      let ecnrypted_message = await nip04.decrypt(nsec.data, event.pubkey, event.content)
      console.log(ecnrypted_message)
    }
  })

// let relay_data = await relay.subscribe([
//     {
//         // "#p": ["dentish"],
//         'authors' : [npub.data],
//         "kinds": [4]
//       } 
// ])

// console.log(relay_data)


