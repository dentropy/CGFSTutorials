import { NSecSigner } from '@nostrify/nostrify';
import { privateKeyFromSeedWords, validateWords } from "nostr-tools/nip06";

let mnemonic = 'soap vault ahead turkey runway erosion february snow modify copy nephew rude'
let secret_key = privateKeyFromSeedWords(mnemonic, "", 0);
const signer = new NSecSigner(secret_key);

const pubkey = await signer.getPublicKey();
const event = await signer.signEvent({ kind: 69420, content: 'Hello, world!', tags: [], created_at: 0 })

console.log(event)
