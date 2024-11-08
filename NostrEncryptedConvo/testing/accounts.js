import { getPublicKey, nip19, nip04 } from 'nostr-tools'
import { validateWords, privateKeyFromSeedWords } from 'nostr-tools/nip06'
import { SimplePool } from "nostr-tools/pool";
import { bytesToHex } from '@noble/hashes/utils'
import { finalizeEvent, verifyEvent } from 'nostr-tools'

const mnemonic = "curve foster stay broccoli equal icon bamboo champion casino impact will damp";
let mnemonic_validation = validateWords(mnemonic)
if (!mnemonic_validation) {
    console.log("Invalid Mnemonic")
    process.exit(0);
}
let accounts = []
for (var i = 0; i < 20; i++) {
    let secret_key = privateKeyFromSeedWords(mnemonic, "", i)
    let public_key = getPublicKey(secret_key)
    let uint8_secret_key = new Buffer.from(secret_key, "hex")
    let nsec = nip19.nsecEncode(uint8_secret_key)
    let npub = nip19.npubEncode(public_key)
    accounts.push({
        secret_key: secret_key,
        pubkey: public_key,
        nsec: nsec,
        npub: npub
    })
}

for (var i = 0; i < accounts.length; i++){
    console.log(`Account Index = ${i}`)
    console.log(accounts[i])
}


let content = "l9frhWPvOo72Y9BrDmgFsg==?iv=dTS7crOyUQOfInWqaZUydA=="
let decrypted_content = await nip04.decrypt(
    bytesToHex(accounts[0].secret_key),
    accounts[19].pubkey,
    content
)

console.log("decrypted_content")
console.log(decrypted_content)