import { Level } from 'level'

// Create a database
const db = new Level('./mydb')

async function dumpLevel(db) {
  let returnObj = {}
  for await (const [key, value] of db.iterator({ gt: '\x00' })) {
    returnObj[key] = value
  }
  return returnObj
}

async function main(){
  console.log(await dumpLevel(db))
}

main()
