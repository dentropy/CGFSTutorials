import * as nip19 from 'nostr-tools/nip19'

let npub = nip19.decode("npub1xhavg6ralwct46r6ka8avhz7l65ffv2t8u57rxmdzx62mzgpdcws4sgj2f")

console.log(JSON.stringify(npub, null, 2))

"npub1ek36rza32zjc8pec8daz6veyywv55xtemzaxr0saymd04a4r66eqpxphdl"

let npub2 = 'bb960c6d7b110cc8b1cd49f8bb926189cc0e988d62f80d2b1b82fd3642ff08e3'
npub2 = nip19.npubEncode(npub2)

console.log(npub2)