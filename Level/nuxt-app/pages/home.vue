<template>
    <div>
        <h1>Paul Was Here</h1>
    </div>
</template>

<script>
import { BrowserLevel } from 'browser-level'

const db = new BrowserLevel('mydb', { valueEncoding: 'json' })

async function main() {
  try {
    // Put some values
    await db.put('name', 'Alice')
    await db.put('age', 30)
    await db.put('city', 'New York')

    console.log('Values have been put into the database')

    // Get values
    const name = await db.get('name')
    const age = await db.get('age')
    const city = await db.get('city')

    console.log('Retrieved values:')
    console.log('Name:', name)
    console.log('Age:', age)
    console.log('City:', city)

    // Close the database
    await db.close()
  } catch (error) {
    console.error('Error:', error)
  }
}

main()
</script>