import { generateSecretKey, getPublicKey } from 'nostr-tools/pure'
import * as nip19 from 'nostr-tools/nip19'

let sk = generateSecretKey()
let nsec = nip19.nsecEncode(sk)



let pk = getPublicKey(generateSecretKey())
let npub = nip19.npubEncode(pk)

console.log(nsec)
console.log(npub)