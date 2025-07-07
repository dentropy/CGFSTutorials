// DOES NOT WORK, NPhraseSigner is Missing

import { NPhraseSigner } from '@nostrify/seed';

const signer = new NPhraseSigner('soap vault ahead turkey runway erosion february snow modify copy nephew rude', {
  account: 0, // Optional account number. Default is 0.
  passphrase: '', // Optional passphrase. Default is no passphrase.
});

const pubkey = await signer.getPublicKey();

console.log(`\n\nPubkey is ${pubkey}\n\n`)

const event = await signer.signEvent({ content: 'Hello, world!', kind: 1, tags: [], created_at: 0 })

console.log(event)
