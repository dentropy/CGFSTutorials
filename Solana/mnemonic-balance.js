import { Keypair, PublicKey, LAMPORTS_PER_SOL, clusterApiUrl,
    Connection,
   } from "@solana/web3.js";
import * as bip39 from "bip39";
import { derivePath } from 'ed25519-hd-key';

// [Connecting to a Solana Environment | Solana](https://solana.com/developers/cookbook/development/connect-environment)
const connection = new Connection('https://api.devnet.solana.com', "confirmed");

// const mnemonic = bip39.generateMnemonic()
const mnemonic = "tree panic cancel dinner tuna shaft aim jaguar quality lunar select program";
console.log(`mnemonic = ${mnemonic}`)
const seed = bip39.mnemonicToSeedSync(mnemonic, "");
let wallets = []
for (let i = 0; i < 10; i++) {
  const path = `m/44'/501'/${i}'/0'`;
  const keypair = Keypair.fromSeed(derivePath(path, seed.toString("hex")).key);
  wallets.push(keypair)
  console.log(`${path} => ${keypair.publicKey.toBase58()}`);
}
for (let i = 0; i < 10; i++) {
    const balance = await connection.getBalance(wallets[i].publicKey);
    console.log(`${i} ${wallets[i].publicKey.toBase58()}=${balance}`)
}
