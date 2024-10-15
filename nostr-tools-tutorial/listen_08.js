import { Relay } from 'nostr-tools'
// import 'websocket-polyfill' // UNCOMMENT WHEN USING BUN

const relay = await Relay.connect('wss://relay.damus.io')
console.log(`\nconnected to ${relay.url}`)


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
    since: Math.floor(Date.now() / 1000) - 20000,
    CID: ['bagaaieraqeiesbwbkdgq5wzdcdxdqn6jgnbltptfsuufeq6wn5kuiikujkda'],
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


