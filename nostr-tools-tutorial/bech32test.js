import { bech32 }from 'bech32';

let decoded_text = await bech32.decode('abcdef1qpzry9x8gf2tvdw0s3jn54khce6mua7lmqqqxw')

console.log(decoded_text)

function stringToHex(str) {
    const buffer = Buffer.from(str, 'utf8');
    return buffer.toString('hex');
}


var encoded = '1a9434ee165ed01b286becfc2771ef1705d3537d051b387288898cc00d5c885be'
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


var encoded = 'naddr1qvzqqqrcvgpzplfq3m5v3u5r0q9f255fdeyz8nyac6lagssx8zy4wugxjs8ajf7pqy88wumn8ghj7mn0wvhxcmmv9uq3zamnwvaz7tmwdaehgu3wd3skuep0qyghwumn8ghj7mn0wd68ytnhd9hx2tcpr3mhxue69uhhg6r9vd5hgctyv4kzumn0wd68yvfwvdhk6tcprdmhxue69uhhg6r9vehhyetnwshxummnw3erztnrdakj7qgwwaehxw309ahx7uewd3hkctcpz9mhxue69uhkummnw3ezumrpdejz7qg3waehxw309ahx7um5wgh8w6twv5hsz8rhwden5te0w35x2cmfw3skgetv9ehx7um5wgcjucm0d5hszxmhwden5te0w35x2en0wfjhxapwdehhxarjxyhxxmmd9uqsuamnwvaz7tmwdaejumr0dshszythwden5te0dehhxarj9ekxzmny9uq3zamnwvaz7tmwdaehgu3wwa5kuef0qyw8wumn8ghj7argv43kjarpv3jkctnwdaehgu339e3k7mf0qydhwumn8ghj7argv4nx7un9wd6zumn0wd68yvfwvdhk6tcqz3hx7um5wgkk2an9de6z6un9va5hxar9wg5dvsmv'
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