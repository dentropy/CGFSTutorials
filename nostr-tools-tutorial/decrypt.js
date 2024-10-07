import { Relay } from 'nostr-tools'
import * as nip19 from 'nostr-tools/nip19'
import * as nip04 from 'nostr-tools/nip04'
import { bytesToHex, hexToBytes } from '@noble/hashes/utils'
// import 'websocket-polyfill' // UNCOMMENT WHEN USING BUN

let npub = nip19.decode("npub1ek36rza32zjc8pec8daz6veyywv55xtemzaxr0saymd04a4r66eqpxphdl")
let nsec = nip19.decode("")
console.log(npub)
console.log(nsec)
console.log(nsec.data.toString(16))


let event = {
    content: "PPi+wm18SgrxOib2ukEg9g==?iv=CGOa6xuLZBCSNafG3v6ktQ==",
    created_at: 1728151575,
    id: "0a542b044d837d3ae1040a402d642a28e352c982b85663f5b4e9726a0e0cbc2b",
    kind: 4,
    pubkey: "cda3a18bb150a58387383b7a2d332423994a1979d8ba61be1d26dafaf6a3d6b2",
    sig: "80ab738ad7589460a910241d8fd77b73c5b2dfedc687d389739eb3774d5717ca2fc135ae5468b7b4076c11dc4bbd1e3ed9c40187786a9b2f53dfac36de35eaaf",
    tags: [
      [ "p", "d582ea4464058383af89dbc571f72aaaaffd103aab3bbc8ddd2342e66d7e6b56" ]
    ]
}


let ecnrypted_message = await nip04.decrypt(nsec.data, event.pubkey, event.content)
console.log(ecnrypted_message)