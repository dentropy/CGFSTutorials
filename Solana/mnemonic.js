import { derivePath } from 'ed25519-hd-key';
import { Keypair } from "@solana/web3.js";
import * as bip39 from "bip39";

// const mnemonic = bip39.generateMnemonic()
// [pki - How do I create an HD wallet and child wallets in Solana? - Stack Overflow](https://stackoverflow.com/questions/72658589/how-do-i-create-an-hd-wallet-and-child-wallets-in-solana)
const mnemonic = "tree panic cancel dinner tuna shaft aim jaguar quality lunar select program";
console.log(`mnemonic = ${mnemonic}`)

const seed = bip39.mnemonicToSeedSync(mnemonic, "");
const keypair = Keypair.fromSeed(seed.slice(0, 32));
 
console.log(`${keypair.publicKey.toBase58()}`);

let wallets = []
for (let i = 0; i < 10; i++) {
  const path = `m/44'/501'/${i}'/0'`;
  const keypair = Keypair.fromSeed(derivePath(path, seed.toString("hex")).key);
  wallets.push(keypair)
  console.log(`${path} => ${keypair.publicKey.toBase58()}`);
}
