import { Level } from 'level'

// Create a database
const db = new Level('./mydb')

async function iterateWithGT() {
  for await (const [key, value] of db.iterator({ gt: '\x00' })) {
    console.log(`${key.padEnd(12)}=${value}`)
  }
}

async function main(){
  console.log(await iterateWithGT())
}

main()
