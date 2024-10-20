import { bech32 }from 'bech32';

let decoded_text = await bech32.decode('abcdef1qpzry9x8gf2tvdw0s3jn54khce6mua7lmqqqxw')

console.log(decoded_text)

function stringToHex(str) {
    const buffer = Buffer.from(str, 'utf8');
    return buffer.toString('hex');
}


var encoded = 'npub17pfs355fdw83u8ga4se9u4xy2smkk0mz5ld6zpl9uqs8zjhckqdsp9ym48'
var decoded = bech32.decode(encoded, Infinity);
console.log(decoded)
console.log(bech32.fromWords(decoded.words))
var text = stringToHex(new Uint8Array(bech32.fromWords(decoded.words)));
console.log(text)

import * as nip19 from 'nostr-tools/nip19'
let npub = nip19.decode("npub17pfs355fdw83u8ga4se9u4xy2smkk0mz5ld6zpl9uqs8zjhckqdsp9ym48")
console.log(JSON.stringify(npub, null, 2))

// npub17pfs355fdw83u8ga4se9u4xy2smkk0mz5ld6zpl9uqs8zjhckqdsp9ym48
// f05308d2896b8f1e1d1dac325e54c454376b3f62a7dba107e5e020714af8b01b


var encoded = 'nevent1qvzqqqqqqypzpndr5x9mz599swrnswm695ejgguefgvhnk96vxlp6fk6ltm2844jqyvhwumn8ghj7mn0wd68yvfwvd6hyun9de6zuenedyhszxrhwden5te0wfjkccte9e3h2unjv4h8gtnx095j7qpqh6y938hrn5dsz24l4fjt2sczn47jwtqh4anw9gnjxs3v9jrglk4qh9w7x8'
var decoded = bech32.decode(encoded, Infinity);
console.log(decoded)
console.log(bech32.fromWords(decoded.words))
var hex_text = stringToHex(new Uint8Array(bech32.fromWords(decoded.words)));
var raw_utf8_text = new TextDecoder().decode(new Uint8Array(bech32.fromWords(decoded.words)));
var utf8_text = new TextDecoder().decode(new Uint8Array(bech32.fromWords(decoded.words.slice(56))));
var last_item = new TextDecoder().decode(new Uint8Array(bech32.fromWords(decoded.words.slice(64+32+8+8+8+8+8+8+8))));
var last_item_hex = stringToHex(new Uint8Array(bech32.fromWords(decoded.words.slice(64+32+8+8+8+8+8+8+8))));
console.log("decoded.words")
console.log(decoded.words)
console.log("hex_text")
console.log(hex_text)
console.log("raw_utf8_text")
console.log(raw_utf8_text)
console.log("utf8_text")
console.log(utf8_text)
console.log("last_item")
console.log(last_item)
console.log("last_item_hex")
console.log(last_item_hex) // THIS IS THE EVENT ID