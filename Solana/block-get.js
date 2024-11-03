import { Keypair, PublicKey, LAMPORTS_PER_SOL, clusterApiUrl,
    Connection,
   } from "@solana/web3.js";


const connection = new Connection('https://api.devnet.solana.com', "confirmed");

let slot = await connection.getSlot();
console.log(slot);


// [getConfirmedTransaction return error Transaction version (0) is not supported by the requesting client - Solana Stack Exchange](https://solana.stackexchange.com/questions/4676/getconfirmedtransaction-return-error-transaction-version-0-is-not-supported-by)
// [Web3.js API Examples | Solana](https://solana.com/docs/clients/javascript-reference)
let theBlock = await connection.getBlock(337304032, {maxSupportedTransactionVersion: 0})

console.log(theBlock)