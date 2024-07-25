// Write a Multicodec+LevelDB namespace key integration tool

import { bases } from 'multiformats/basics'
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
var base58btcEncodedString = bases.base58btc.encode(textEncoder.encode("👨‍🏭😊🤔"))
console.log(`base58btcEncodedString = ${base58btcEncodedString}`)
import { Level } from "level"

const db = new Level('./db', { valueEncoding: 'utf8' })
await db.put(base58btcEncodedString, "Hello")
let levelEncoed = await db.get(bases.base58btc.encode(textEncoder.encode("👨‍🏭😊🤔")))
console.log(levelEncoed)
