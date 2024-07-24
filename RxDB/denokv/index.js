import { createRxDatabase, addRxPlugin } from 'npm:rxdb';
import { getRxStorageDenoKV } from 'npm:rxdb/plugins/storage-denokv';
import { RxDBDevModePlugin } from 'npm:rxdb/plugins/dev-mode';
addRxPlugin(RxDBDevModePlugin);


import { mkdir } from "node:fs/promises";
try {
    // [javascript - How to determine the location of the deno script? - Stack Overflow](https://stackoverflow.com/questions/72156289/how-to-determine-the-location-of-the-deno-script)
    const createDir = await mkdir(Deno.cwd() + "/db", { recursive: true });

    console.log(`created ${createDir}`);
} catch (err) {
    console.error(err.message);
}


const myRxDatabase = await createRxDatabase({
    name: 'exampledb',
    storage: getRxStorageDenoKV({
        /**
         * Consistency level, either 'strong' or 'eventual'
         * (Optional) default='strong'
         */
        consistencyLevel: 'strong',
        /**
         * Path which is used in the first argument of Deno.openKv(settings.openKvPath)
         * (Optional) default=''
         */
        openKvPath: './db/rxdb',
        /**
         * Some operations have to run in batches,
         * you can test different batch sizes to improve performance.
         * (Optional) default=100
         */
        batchSize: 100
    })
});