import { NSecSigner, NRelay1 } from '@nostrify/nostrify';
import { nip19, nip44, getPublicKey } from "nostr-tools"
import { privateKeyFromSeedWords, validateWords } from "nostr-tools/nip06";

let mnemonic = 'soap vault ahead turkey runway erosion february snow modify copy nephew rude'
let sk1 = privateKeyFromSeedWords(mnemonic, "", 0)
let sk1Signer = new NSecSigner(sk1)
let pk1 = getPublicKey(sk1)
let sk2 = privateKeyFromSeedWords(mnemonic, "", 0)
let pk2 = getPublicKey(sk2)
let sk2Signer = new NSecSigner(sk2)



const secret_message = "I LIKE PIE"
// From sk1 to sk2
const key = nip44.getConversationKey(sk1, pk2)
let kind14Ciphertext = nip44.encrypt(secret_message, key)
let unix_time = Math.floor((new Date()).getTime() / 1000);
let kind14Event = await sk1Signer.signEvent({ 
    kind: 14, 
    content: kind14Ciphertext, 
    tags: [["p", pk1]], 
    created_at: unix_time 
})
let kind1059Ciphertext = nip44.encrypt(JSON.stringify(kind14Event), key)
let kind1059Event = await sk1Signer.signEvent({ 
    kind: 1059, 
    content: kind1059Ciphertext, 
    tags: [["p", pk1]], 
    created_at: unix_time 
})

console.log("WE DECRYPT HERE")
let event13 = JSON.parse(nip44.decrypt(kind1059Event.content, key))
console.log(kind1059Event)
console.log("\n\n\n")
console.log(event13)
const event13Key = nip44.getConversationKey(sk2, event13.pubkey)
let result2 = nip44.decrypt(event13.content, event13Key)
console.log("\n\n\n")
console.log(result2)