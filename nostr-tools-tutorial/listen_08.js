import { Relay } from 'nostr-tools'
// import 'websocket-polyfill' // UNCOMMENT WHEN USING BUN

const relay = await Relay.connect('ws://localhost:7000')
console.log(`\nconnected to ${relay.url}`)


relay.subscribe([
    {
      // "#p": ["dentish"],
      'CID' : ["bagaaieraqeiesbwbkdgq5wzdcdxdqn6jgnbltptfsuufeq6wn5kuiikujkda"]
    },
  ], {
    onevent(event) {
      console.log('got event:', event)
    }
  })


