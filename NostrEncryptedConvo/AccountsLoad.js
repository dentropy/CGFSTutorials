/*
Inputs
  * MNEMPONIC (Optional)
*/
import 'dotenv/config'
import generateNostrAccountsFromMnemonic from './lib/generateNostrAccountsFromMnemonic.js'

import bip39 from "bip39";
const mnemonic = process.env.MNEMONIC ||  bip39.generateMnemonic();
let accounts = generateNostrAccountsFromMnemonic(mnemonic)

console.log(`export MNEMONIC='${mnemonic}'`)
for(let i = 0 ; i < accounts.length; i++){
  console.log(`export NSEC${i}='${accounts[i].nsec}'`)
  console.log(`export NPUB${i}='${accounts[i].npub}'`)
}
if(process.env.NOSTR_RELAYS == "" || process.env.NOSTR_RELAYS == undefined){
    console.log(`export NOSTR_RELAYS='wss://relay.newatlantis.top'`)
} else {
  console.log(`export NOSTR_RELAYS='${process.env.NOSTR_RELAYS}'`)
}
if(process.env.NIP_65_NOSTR_RELAYS == "" || process.env.NOSTR_RELAYS == undefined){
  console.log(`export NIP_65_NOSTR_RELAYS='wss://nos.lol/,wss://nostr.land/,wss://nostr.wine/,wss://purplerelay.com/,wss://relay.damus.io/,wss://relay.snort.social/'`)
} else {
  console.log(`export NIP_65_NOSTR_RELAYS='${process.env.NIP_65_NOSTR_RELAYS}'`)
}