<script setup lang="js">
    import PackagedBrowserLevel from 'browser-level';
    async function runFunction() {
        let levelDB = new PackagedBrowserLevel.BrowserLevel('example', { valueEncoding: 'json' })
        // Add an entry with key 'a' and value 1
        // console.log("Loading up BrowserLevel`")
        // await levelDB.put('a', 1)
        // await levelDB.put('b', 2)

        // // Add multiple entries
        // await levelDB.batch([{ type: 'put', key: 'b', value: 2 }])

        // // Get value of key 'a': 1
        const value = await levelDB.get('a')
        console.log(`levelDB=${value}`)
        const value2 = await levelDB.get('b')
        console.log(`levelDB=${value2}`)
        // // Iterate entries with keys that are greater than 'a'
        // for await (const [key, value] of levelDB.iterator({ gt: 'a' })) {
        //     console.log("LEVEL_STUFF")
        //     console.log(value) // 2
        // }

        // db2 = levelDB.sublevel("newlevel")
        // await db2.put('hello', "world")

    }

    // Delay execution by 1 second
    setTimeout(runFunction, 1000);

    let db = await myRxDBInit()
</script>

<template>
    <div>
        <h1>Welcome to Index</h1>
        <button onclick="console.log('I WAS HERE')">I WAS HERE</button>
        <br />
        <button @click="console.log(db)">Load RxDB</button>
        <br />
        <button @click="runMyQuery(db)">Query RxDB</button>
    </div>
    <MyRxDB></MyRxDB>
</template>
  