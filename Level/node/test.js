import { Level } from "level"

// Create a database
const db = new Level('./db', { valueEncoding: 'json' })

// Add an entry with key 'a' and value 1
await db.put('a', 1)


let key = 'b🍋'

// Add multiple entries
await db.batch([{ type: 'put', key: key, value: 2 }])

// Get value of key 'a': 1
const value = await db.get(key)
console.log(`value = ${value}`)

let key2 = "h"
let db2 = db.sublevel("newlevel🥞")
await db2.put('hello', "world")
let value2 = await db2.get('hello')

console.log(`value2 = ${value}`)

// Iterate entries with keys that are greater than 'a'
// for await (const [key, value] of db.iterator({ gt: 'a' })) {
//   console.log(value) // 2
// }