import { bases } from 'multiformats/basics'

// Single known multibase.
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

var exampleString = "Hello World"
var exampleEncodedString = textEncoder.encode(exampleString)
var base32zEncodedString = bases.base32z.encode(exampleEncodedString)
var base32zDecodedBuffer = bases.base32z.decode(base32zEncodedString)
var base32zDecodedString = textDecoder.decode(base32zDecodedBuffer)
var base58btcEncodedString = bases.base58btc.encode(exampleEncodedString)
var base58btcDecodedBuffer = bases.base58btc.decode(base58btcEncodedString)
var base58btcDecodedString = textDecoder.decode(base58btcDecodedBuffer)

console.log(`exampleString = ${exampleString}`)
console.log(`exampleEncodedString = ${exampleEncodedString}`)
console.log(`base32zEncodedString = ${base32zEncodedString}`)
console.log(`base32zDecodedBuffer = ${base32zDecodedBuffer}`)
console.log(`base32zDecodedString = ${base32zDecodedString}`)
console.log(`base58btcEncodedString = ${base58btcEncodedString}`)
console.log(`base58btcDecodedBuffer = ${base58btcDecodedBuffer}`)
console.log(`base58btcDecodedString = ${base58btcDecodedString}`)
console.log("\n\n")


var exampleString = "Paul Was Here !@# 😫😊🥹🍔🤬"
var exampleEncodedString = textEncoder.encode(exampleString)
var base32zEncodedString = bases.base32z.encode(exampleEncodedString)
var base32zDecodedBuffer = bases.base32z.decode(base32zEncodedString)
var base32zDecodedString = textDecoder.decode(base32zDecodedBuffer)
var base58btcEncodedString = bases.base58btc.encode(exampleEncodedString)
var base58btcDecodedBuffer = bases.base58btc.decode(base58btcEncodedString)
var base58btcDecodedString = textDecoder.decode(base58btcDecodedBuffer)

console.log(`exampleString = ${exampleString}`)
console.log(`exampleEncodedString = ${exampleEncodedString}`)
console.log(`base32zEncodedString = ${base32zEncodedString}`)
console.log(`base32zDecodedBuffer = ${base32zDecodedBuffer}`)
console.log(`base32zDecodedString = ${base32zDecodedString}`)
console.log(`base58btcEncodedString = ${base58btcEncodedString}`)
console.log(`base58btcDecodedBuffer = ${base58btcDecodedBuffer}`)
console.log(`base58btcDecodedString = ${base58btcDecodedString}`)
console.log("\n\n")
