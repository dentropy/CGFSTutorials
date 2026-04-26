import { bases } from 'multiformats/basics'

// Single known multibase.
console.log(bases.base32.decode('bozwxq'))

// Combine multiple multibases.
const base32or64 = bases.base32.decoder.or(bases.base64url.decoder)
console.log(base32or64.decode('bozwxq'))
console.log(base32or64.decode('udm14'))

const encoder = new TextEncoder();
let zbase32 = bases.base32z.encode(encoder.encode("I LIke Pie"))
console.log(bases.base32z.decode(zbase32))
const decoder = new TextDecoder();
let base32decoded = decoder.decode(bases.base32z.decode(zbase32))
console.log(base32decoded)