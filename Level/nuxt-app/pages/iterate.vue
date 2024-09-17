<template>
    <div>
        <h1>Iterated Data</h1>
        <p>{{ tmpString }}</p>
        <br>
        <button @click="setLevelValues">Get Level Data</button>
        <br>
        <button @click="printLevelValues">printLevelValues</button>
        <p>{{ getLevelValues }}</p>
        <br>
        <br>
        <br>
        <br>
        <p>{{ counter }}</p>
        <button @click="incrementCounter">Increment</button>
        <br>
        <br>
    </div>
</template>

<script>
import { BrowserLevel } from 'browser-level'

const db = new BrowserLevel('mydb', { valueEncoding: 'json' })

async function iterateWithGT() {
  let tmp_values = {}
  for await (const [key, value] of db.iterator({ gt: '\x00' })) {
    console.log(`${key.padEnd(12)}=${value}`)
    tmp_values[key] = value
  }
  console.log("tmp_values")
  console.log(tmp_values)
  return tmp_values
}

// async function main() {
//     let tmpValues = await iterateWithGT()
//     this.setLevelValues(tmpValues)
// }

// main()


export default {
  data() {
    return {
      tmpString: 'Hello from Vue!',
      levelValues: [],
      counter: 0
    };
  },
  methods: {
    async setLevelValues() {
        let tmpValueLevel = await iterateWithGT()
        console.log(tmpValueLevel)
        console.log("tmpValueLevel")
        // tmpValueLevel = JSON.stringify(tmpValueLevel)
        console.log(tmpValueLevel)
        this.levelValues = tmpValueLevel
    },
    incrementCounter() {
      this.counter++;  // Updating the counter data property
    },
    printLevelValues() {
      console.log(this.levelValues)
    }
  },
  computed: {
    getLevelValues() {
        return JSON.stringify(this.levelValues, null, 2)
    }
  }
};
</script>