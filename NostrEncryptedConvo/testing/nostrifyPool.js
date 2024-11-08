import { NRelay1, NPool } from '@nostrify/nostrify';
// const relay = new NRelay1('ws://localhost:7007');

const relays = [
    "ws://localhost:7007",
    "wss://relay.newatlantis.top",
    // "wss://relay.newatlantis.top",
    // "wss://relay.damus.io/"
]

const pool = new NPool({
    open: (url) => new NRelay1(url),
    reqRouter: async (filters) => new Map([
        ["ws://localhost:7007", filters],
        ["ws://localhost:7007", filters],
      ]),
    eventRouter: async (event) => relays,
});

let unix_time = Math.floor((new Date()).getTime() / 1000);
let filter = {
  kinds: [4],
  "#p": "a582c706dad3a703d6c0211dc25e6bb2cbc9081ced7c2adbab91150b905645a7",
  "since": String(unix_time - 5000)
}

for await (const msg of pool.req([filter])) {
  if (msg[0] === 'EVENT') console.log(msg[2]);
  if (msg[0] === 'EOSE') break; // Sends a `CLOSE` message to the relay.
}


// let result = await pool.query([filter])
// console.log(result)