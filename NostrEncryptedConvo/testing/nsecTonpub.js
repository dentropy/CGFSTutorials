import { nip19, getPublicKey } from 'nostr-tools'


let private_key = nip19.decode(process.env.NSEC).data

let public_key = getPublicKey(nip19.decode(process.env.NSEC).data)

let npub = nip19.npubEncode(getPublicKey(nip19.decode(process.env.NSEC).data))
console.log(private_key)

console.log(public_key)

console.log(npub)
