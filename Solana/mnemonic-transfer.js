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

// Docs used to generate this code
// [Transactions and Instructions | Solana](https://solana.com/docs/core/transactions#simple-sol-transfer)


// [Connecting to a Solana Environment | Solana](https://solana.com/developers/cookbook/development/connect-environment)
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
const sender = wallets[0]

let transferAmount = 0.001;
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
        [sender] // signer
    );
    console.log(`Sent transaction ${i} for wallet ${wallets[i].publicKey.toBase58()}`)
}
