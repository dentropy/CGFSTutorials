import { bech32, bech32m }from 'bech32';

// let decoded_text = await bech32.decode('abcdef1qpzry9x8gf2tvdw0s3jn54khce6mua7lmqqqxw')
// console.log(decoded_text)

function stringToHex(str) {
    const buffer = Buffer.from(str, 'utf8');
    return buffer.toString('hex');
}


// var encoded = '1a9434ee165ed01b286becfc2771ef1705d3537d051b387288898cc00d5c885be'
// var decoded = bech32.decode(encoded, Infinity);
// console.log(decoded)
// console.log(bech32.fromWords(decoded.words))
// var text = stringToHex(new Uint8Array(bech32.fromWords(decoded.words)));
// console.log(text)

import * as nip19 from 'nostr-tools/nip19'
let npub = nip19.decode("npub17pfs355fdw83u8ga4se9u4xy2smkk0mz5ld6zpl9uqs8zjhckqdsp9ym48")
console.log(JSON.stringify(npub, null, 2))

// npub17pfs355fdw83u8ga4se9u4xy2smkk0mz5ld6zpl9uqs8zjhckqdsp9ym48
// f05308d2896b8f1e1d1dac325e54c454376b3f62a7dba107e5e020714af8b01b


var encoded = 'naddr1qvzqqqrcvgpzplfq3m5v3u5r0q9f255fdeyz8nyac6lagssx8zy4wugxjs8ajf7pqq2xummnw3ez6etkv4h8gttjv4nkjum5v4eqsyk5g2'

// var encoded = 'naddr1qvzqqqrcvgpzp7peldn3gkv2wgeap8dag2hc9nyhs8g04ft5wnccgxhepdwfxzfeqys8wumn8ghj7un9d3shjtnkv9hxgetjwashy6m9wghxvctdd9k8jtcpvemhxue69uhkv6tvw3jhytnwdaehgu3wwa5kuef0dec82c33d3ch2mrtv43n2arc8yu8ja3hwdhxkde4896827n9df6xxu348qmr2dpk8pn82anewf682umtdpukuurew4eksdt3v9nrx0mzwfhkzerrv9ehg0t5wf6k2qqhdehhxarjwdkhxttfdeehgctvdskkummyv448xhmqujy'


var encoded = 'naddr1qvzqqqrhnypzpuznprfgj6u0rcw3mtpjte2vg4phdvlk9f7m5yr7tcpqw9903vqmqydhwumn8ghj7un9d3shjtnwv4mkzarvv9h8g6tn9e6x7uqqq3skgerjrmg3et' // 26
// var encoded = 'naddr1qqzxuemfwsqs6amnwvaz7tmwdaejumr0dspzpgqgmmc409hm4xsdd74sf68a2uyf9pwel4g9mfdg8l5244t6x4jdqvzqqqrhnym0k2qj'

// My Test
// var encoded = 'naddr1ypmhxue69uhhyetvv9ujumn9washg6tpde6xjueww3hhqtmwwp6kyvt9dvenvun6vyeny7n2vvu8qetr8pjxz73kwejhj7thwc6n27r5v4kh5ctcwgc8xcted4jrqdrpx3ervdn9w9c8surgv3kr7cnjdaskgcmpwd6r66twv3jhsjd5sqq'

console.log("\n\nDECODING")
var decoded = bech32.decode(encoded, Infinity);
var raw_utf8_text = new TextDecoder().decode(new Uint8Array(bech32.fromWords(decoded.words)));


var utf8_text = bech32.fromWords(decoded.words)
utf8_text = new Uint8Array(utf8_text)
utf8_text = utf8_text.slice(26) // 26
var hex_text = utf8_text
utf8_text = new TextDecoder().decode(utf8_text);

// console.log("decoded")
// console.log(decoded)
// console.log("decoded.words")
// console.log(decoded.words)
console.log("raw_utf8_text")
console.log(raw_utf8_text)
console.log("utf8_text")
console.log(utf8_text)
console.log("hex_text")
console.log(stringToHex(  hex_text  ))



// console.log("TEST_BUFFER")
// function i2hex(i) {
//     return ('0' + i.toString(16)).slice(-2);
// }
// let arr = [10, 21, 21, 11, 26, 6, 21, 18, 13,  0, 12,  2,  0,  0,  0,  3, 23, 19,  4 ]
// let test_buffer = new Uint8Array(arr)
// console.log( Buffer.from(test_buffer).toString('hex')  )
// console.log(stringToHex(arr))
// console.log("\n\n\n")




// console.log("nip05")
// console.log(nip19.npubEncode(hex_text))

// var last_item = new TextDecoder().decode(new Uint8Array(bech32.fromWords(decoded.words.slice(64+32+8+8+8+8+8+8+8))));
// var last_item_hex = stringToHex(new Uint8Array(bech32.fromWords(decoded.words.slice(64+32+8+8+8+8+8+8+8))));
// console.log("last_item")
// console.log(last_item)
// console.log("last_item_hex")
// console.log(last_item_hex) // THIS IS THE EVENT ID


// let string_to_encode = ` wss://relay.newatiantis.top/npub1ek36rza32zjc8pec8daz6veyywv55xtemzaxr0saymd04a4r66eqpxphdl?broadcast=index`
// console.log("string_to_encode")
// console.log(string_to_encode)

// console.log(Buffer.from(decoded.words.slice(0, 64)))
// console.log(Buffer.from(string_to_encode, 'utf8'))
// console.log(Buffer.from(new Uint8Array(decoded.words.slice(0, 64))))
// console.log(Buffer.from(new Uint8Array(decoded.words.slice(0, 64))).length)


// console.log("HELP_ME")
// let words = bech32.toWords(Buffer.from('foobar', 'utf8'))
// console.log(words)
// let mah_array = Buffer.concat(
//     [ 
//       Buffer.from(decoded.words.slice(0, 64)) , 
//       Buffer.from(bech32.toWords(Buffer.from(string_to_encode, 'utf8')))
//     ]
// )


let is_this_it = nip19.decode("naddr1qq9xzetyd9kx2ttwv34szrthwden5te0dehhxtnvdakqygrszgsjsfemmsr6lxl8wf06t39uplq5dpntasudgsmqm39udnqchypsgqqqw7vsn4hag9")
console.log(is_this_it)


// var generateBech32 = new TextEncoder().encode(string_to_encode)
// generateBech32 = bech32.toWords(generateBech32)
// generateBech32 = new Uint8Array(generateBech32)
// generateBech32 = bech32.encode('naddr', generateBech32, Infinity)
// console.log(generateBech32)


let naddr_info = {
    identifier: "daily-learnings",
    pubkey: "a582c706dad3a703d6c0211dc25e6bb2cbc9081ced7c2adbab91150b905645a7",
    kind: 30818,
    relays: ["wss://relay.newatlantis.top"]
}

let naddr = nip19.naddrEncode(naddr_info)

console.log(naddr)

// console.log("NIP05")
// console.log(nip19.npubEncode('6c022070122128273bdc07af9be7725fa5c4bc0fc146866bec38d44360dc4bc6cc18b9030400007799'))