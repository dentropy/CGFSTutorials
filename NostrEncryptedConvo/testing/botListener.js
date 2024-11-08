const pool = new SimplePool();

const relays = [
    "ws://localhost:7007",
    "wss://relay.newatlantis.top",
    "wss://relay.damus.io/"
]

pool.subscribeMany(
    relays,
    [
      {
        kinds: [4],
        "#e": ['32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245'],
      },
    ],
    {
      onevent(event) {
        
      },
      oneose() {
        h.close()
      }
    }
  )