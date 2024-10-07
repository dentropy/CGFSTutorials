import * as nip19 from 'nostr-tools/nip19'


let { type, data } = nip19.decode("npub1h50pnxqw9jg7dhr906fvy4mze2yzawf895jhnc3p7qmljdugm6gsrurqev")

console.log(type)
console.log(data)