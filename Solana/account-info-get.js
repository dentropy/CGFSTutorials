import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import * as bip39 from "bip39";
import { derivePath } from "ed25519-hd-key";

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

// const mnemonic = bip39.generateMnemonic()
const mnemonic =
  "tree panic cancel dinner tuna shaft aim jaguar quality lunar select program";
console.log(`mnemonic = ${mnemonic}`);
const seed = bip39.mnemonicToSeedSync(mnemonic, "");
let wallets = [];
for (let i = 0; i < 10; i++) {
  const path = `m/44'/501'/${i}'/0'`;
  const keypair = Keypair.fromSeed(derivePath(path, seed.toString("hex")).key);
  wallets.push(keypair);
  console.log(`${path} => ${keypair.publicKey.toBase58()}`);
}

const address = new PublicKey(wallets[0].publicKey.toBase58());
let theBlock = await connection.getAccountInfo(
    address,
  { maxSupportedTransactionVersion: 0 },
);

console.log(theBlock);
