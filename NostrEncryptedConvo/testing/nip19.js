import * as nip19 from 'nostr-tools/nip19'

let npub = nip19.decode("npub1xhavg6ralwct46r6ka8avhz7l65ffv2t8u57rxmdzx62mzgpdcws4sgj2f")

console.log("Decoded npub")
console.log(JSON.stringify(npub, null, 2))

let npub2 = 'a582c706dad3a703d6c0211dc25e6bb2cbc9081ced7c2adbab91150b905645a7'
npub2 = nip19.npubEncode(npub2)

console.log("Encoed npub")
console.log(npub2)



/*

npub1ek36rza32zjc8pec8daz6veyywv55xtemzaxr0saymd04a4r66eqpxphdl
npub1ek36rza32zjc8pec8daz6veyywv55xtemzaxr0saymd04a4r66eqpxphdl

*/