import { getPublicKey, nip19 } from "nostr-tools";
import { privateKeyFromSeedWords, validateWords } from "nostr-tools/nip06";
import { bytesToHex, hexToBytes } from '@noble/hashes/utils'


export default function generateNostrAccountsFromMnemonic(mnemonic) {
  let mnemonic_validation = validateWords(mnemonic);
  if (!mnemonic_validation) {
    console.log("Invalid Mnemonic");
    process.exit(0);
  }
  let accounts = [];
  for (var i = 0; i < 20; i++) {
    let secret_key = privateKeyFromSeedWords(mnemonic, "", i);
    let public_key = getPublicKey(secret_key);
    let uint8_secret_key = new Buffer.from(secret_key, "hex");
    let nsec = nip19.nsecEncode(uint8_secret_key);
    let npub = nip19.npubEncode(public_key);
    accounts.push({
      secret_key: bytesToHex(secret_key),
      pubkey: public_key,
      nsec: nsec,
      npub: npub,
    });
  }
  return accounts
}