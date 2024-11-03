/* 
Script Description


*/

import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import * as bip39 from "bip39";
import { derivePath } from "ed25519-hd-key";

// Create HD wallet from Mnemonic
const mnemonic =
  "tree panic cancel dinner tuna shaft aim jaguar quality lunar select program";
// For new mnenmonic uncomment code below
// const mnemonic = bip39.generateMnemonic()
console.log(`mnemonic = ${mnemonic}`);
const seed = bip39.mnemonicToSeedSync(mnemonic, "");
let wallets = [];
for (let i = 0; i < 10; i++) {
  const path = `m/44'/501'/${i}'/0'`;
  const keypair = Keypair.fromSeed(derivePath(path, seed.toString("hex")).key);
  wallets.push(keypair);
  console.log(`${path} => ${keypair.publicKey.toBase58()}`);
}

// Setup Solana RPC Object
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

// List Balances of all Wallets
let balances = [];
for (let i = 0; i < 10; i++) {
  const balance = await connection.getBalance(wallets[i].publicKey);
  console.log(`${i} ${wallets[i].publicKey.toBase58()}=${balance}`);
  balances.push(balance);
}

// Get transactions from wallet 0
async function waitOneSecond() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log("Sleept for a second to not spam RPC inerface");
}
async function getTransactionsForAddress(address, numTransactions) {
  const signatures = await connection.getSignaturesForAddress(address);
  console.log("Got Signatures");
  // console.log(signatures);
  let transactions = [];
  let transactionCount = 0;
  for await (const signature of signatures) {
    const transaction = await connection.getTransaction(signature.signature);
    transactions.push(transaction);
    console.log("Got Transaction");
    // console.log(transaction)
    transactionCount += 1;
    if (transactionCount >= numTransactions) {
      console.log(`We for ${numTransactions} transactions`);
      break;
    }
    await waitOneSecond();
  }
  return transactions;
}
const address = new PublicKey(wallets[0].publicKey.toBase58());
let transactions = await getTransactionsForAddress(address, 3);

// Get the block data for a one of the transactions we got
console.log(`Slot = ${transactions[0].slot}`);
let theSlot = await connection.getSlot(transactions[0].slot, {
    maxSupportedTransactionVersion: 0,
  });

console.log("theSlot")
console.log(theSlot)

let theBlock = await connection.getBlock(transactions[0].slot, {
  maxSupportedTransactionVersion: 0,
});
console.log("theBlock")
console.log(theBlock)


// To create transactions after you load up an address,
// tranferAmount should be 0.001 by default
async function loadUpWallets(wallets, transferAmount) {
  for (let i = 1; i < 10; i++) {
    const transferInstruction = SystemProgram.transfer({
      fromPubkey: wallets[0].publicKey,
      toPubkey: wallets[i].publicKey,
      lamports: transferAmount * LAMPORTS_PER_SOL, // Convert transferAmount to lamports
    });

    // Add the transfer instruction to a new transaction
    const transaction = new Transaction().add(transferInstruction);

    // Send the transaction to the network
    const transactionSignature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [sender], // signer
    );
    console.log(
      `Sent transaction ${i} for wallet ${wallets[i].publicKey.toBase58()}`,
    );
  }
}
