/*
Inputs
  * MNEMPONIC (Optional)
*/
import 'dotenv/config'
import generateNostrAccountsFromMnemonic from './generateNostrAccountsFromMnemonic.js'

import bip39 from "bip39";
const mnemonic = process.env.MNEMONIC ||  bip39.generateMnemonic();
let accounts = generateNostrAccountsFromMnemonic(mnemonic)

console.log("To import a mnemonic run the following,")
console.log("export mnemonic='unlock secret your mnemonic goes here'")
// console.log(accounts)
for(let i = 0 ; i < accounts.length; i++){
  console.log(accounts[i])
  console.log(`NSEC${i}`)
  process.env[`NSEC${i}`] = accounts[i].nsec;
  process.env[`NPUB${i}`] = accounts[i].npub;
}
console.log("Backup your Mnemonic which is,")
console.log(mnemonic)
console.log("To set NSEC run the following for account 0")
console.log(`export NSEC='${accounts[0].nsec}'`)
