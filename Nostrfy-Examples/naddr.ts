import { nip19 } from 'nostr-tools'

let a = nip19.decode("naddr1qvzqqqrcvypzp2x32cxk5era2qtfj9njgmer0vm0ky3l3ytglks3m36r2vl7c7sgqyt8wumn8ghj7un9d3shjtnswf5k6ctv9ehx2aqqz3jx7cm4d4jkuarpw35k7m3dwdcxzcm9wvftxk40")

console.log(a)

import { NSecSigner, NRelay1 } from '@nostrify/nostrify';
import { privateKeyFromSeedWords, validateWords } from "nostr-tools/nip06";

let mnemonic = 'soap vault ahead turkey runway erosion february snow modify copy nephew rude'
let secret_key = privateKeyFromSeedWords(mnemonic, "", 0);
secret_key = nip19.decode("nsec12e9gad6z3seh4hxexpf99zl9jw9vgl26vsppa8rnk7h7udy82u0qwquth6").data
const signer = new NSecSigner(secret_key);
const pubkey = await signer.getPublicKey();


let newAddr = nip19.naddrEncode({
    identifier: 'test001',
    pubkey: pubkey,
    relays: ["wss://t.mememap.net"],
    kind: 39661,
})
console.log(newAddr)


let b = nip19.decode(newAddr)

console.log(b)