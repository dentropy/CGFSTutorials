import { generateSecretKey, getPublicKey, nip19 } from 'nostr-tools'
import { generateSeedWords, validateWords, privateKeyFromSeedWords } from 'nostr-tools/nip06'



const mnemonic = "curve foster stay broccoli equal icon bamboo champion casino impact will damp";
const relays = [ "ws://localhost:7007"]

// const mnemonic = generateSeedWords()
let mnemonic_validation = validateWords(mnemonic)
// let secret_key = privateKeyFromSeedWords(mnemonic, "", 0)
// // let secret_key = generateSecretKey()
// let public_key = getPublicKey(secret_key)
// let uint8_secret_key = new Buffer.from(secret_key, "hex")
// let nsec = nip19.nsecEncode(uint8_secret_key)
// let npub = nip19.npubEncode(public_key)

let accounts = []
for (var i = 0; i < 10; i++){
    let secret_key = privateKeyFromSeedWords(mnemonic, "", i)
    let public_key = getPublicKey(secret_key)
    let uint8_secret_key = new Buffer.from(secret_key, "hex")
    let nsec = nip19.nsecEncode(uint8_secret_key)
    let npub = nip19.npubEncode(public_key)
    accounts.push({
        secret_key: secret_key,
        public_key: public_key,
        nsec: nsec,
        npub: npub
    })
}

console.log(JSON.stringify(accounts, null, 2))

// Send the event
import { Relay } from 'nostr-tools'
const relay = await Relay.connect('ws://localhost:7007')
await relay.publish(signedEvent)


// Wait a second
await new Promise(r => setTimeout(() => r(), 1000));


// Get Event off relay
export const nostrGet = async (relays, params) => {
    //   const relayObject = await window.nostr.getRelays();
    //   const relays = Object.keys(relayObject);
  
    const pool = new SimplePool();
    const events = await pool.get(relays, params);
    console.log("events");
    console.log(events);
    return events;
  };
  let nostr_filter = {
    "authors": [npub.data],
  };
  