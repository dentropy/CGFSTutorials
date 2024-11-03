import {
    clusterApiUrl,
    Connection,
    Keypair,
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram,
    Transaction,
    sendAndConfirmTransaction
} from "@solana/web3.js";
import * as bip39 from "bip39";
import { derivePath } from 'ed25519-hd-key';

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
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

async function waitOneSecond() {
    console.log('Before sleep');
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('After sleep');
  }

async function getTransactionsForAddress(address) {
  const signatures = await connection.getSignaturesForAddress(address);
  console.log("signatures")
  console.log(signatures)
  let transactions = []
  for await (const signature of signatures) {
    const transaction = await connection.getTransaction(signature.signature);
    transactions.push(transaction)
    console.log("Got Transactions")
    console.log(transaction)
    await waitOneSecond()
  }
  
  console.log("transactions")
  console.log({transactions});
  return transactions;
};


const address = new PublicKey(wallets[0].publicKey.toBase58());
let transactions = await getTransactionsForAddress(address)

console.log("transactions")
console.log(transactions)


/*
[getTransaction RPC Method | Solana](https://solana.com/docs/rpc/http/gettransaction)


curl https://api.devnet.solana.com -X POST -H "Content-Type: application/json" -d '
  {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "getTransaction",
    "params": [
      "4KXimz8JqASd6LTe5F9pn1Gbt6KprJWC829EUsASGAbpCSVy4erU8LcJY7ZcFFUdJ9G91tud3zzGGAsQo7X8THD",
      "json"
    ]
  }
' | jq

*/