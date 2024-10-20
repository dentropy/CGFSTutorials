import { Relay } from 'nostr-tools'
// import 'websocket-polyfill' // UNCOMMENT WHEN USING BUN

const relay = await Relay.connect('ws://localhost:7007')
console.log(`\nconnected to ${relay.url}`)
relay.subscribe([
    {
        kinds: [308018],
    },
  ], {
    onevent(event) {
      console.log('we got the event we wanted:', event)
    }
  })