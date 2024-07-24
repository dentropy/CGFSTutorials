import { addRxPlugin, createRxDatabase } from "npm:rxdb";
import { getRxStorageDenoKV } from "npm:rxdb/plugins/storage-denokv";
import { RxDBDevModePlugin } from "npm:rxdb/plugins/dev-mode";
addRxPlugin(RxDBDevModePlugin);

import { mkdir } from "node:fs/promises";
try {
  // [javascript - How to determine the location of the deno script? - Stack Overflow](https://stackoverflow.com/questions/72156289/how-to-determine-the-location-of-the-deno-script)
  const createDir = await mkdir(Deno.cwd() + "/db", { recursive: true });

  console.log(`created ${createDir}`);
} catch (err) {
  console.error(err.message);
}

const mySchema = {
  "title": "hero schema",
  "version": 0,
  "description": "describes a simple hero",
  "primaryKey": "name",
  "type": "object",
  "properties": {
      "name": {
          "type": "string",
          "maxLength": 100 // <- the primary key must have set maxLength
      },
      "color": {
          "type": "string"
      },
      "healthpoints": {
          "type": "number",
          "minimum": 0,
          "maximum": 100
      },
      "secret": {
          "type": "string"
      },
      "birthyear": {
          "type": "number",
          "final": true,
          "minimum": 1900,
          "maximum": 2050
      },
      "skills": {
          "type": "array",
          "maxItems": 5,
          "uniqueItems": true,
          "items": {
              "type": "object",
              "properties": {
                  "name": {
                      "type": "string"
                  },
                  "damage": {
                      "type": "number"
                  }
              }
          }
      }
  },
  "required": [
      "name",
      "color"
  ]
}


let db = null
db = await createRxDatabase({
  name: "exampledb",
  storage: getRxStorageDenoKV({
    /**
     * Consistency level, either 'strong' or 'eventual'
     * (Optional) default='strong'
     */
    consistencyLevel: "strong",
    /**
     * Path which is used in the first argument of Deno.openKv(settings.openKvPath)
     * (Optional) default=''
     */
    openKvPath: "./db/rxdb",
    /**
     * Some operations have to run in batches,
     * you can test different batch sizes to improve performance.
     * (Optional) default=100
     */
    batchSize: 100,
  }),
});

let myCollections = null;

try {
  console.log("db.collections")
  console.log(Object.keys(db.collections));


  console.log("Adding collection");
  console.log(myCollections);
  myCollections = await db.addCollections({
    heroes: {
      schema: mySchema,
    },
  })
} catch (error) {
  console.log("got an error");
  console.log(error);
}




async function runMyQuery(db:any){
  console.log("Running MyQuery")
  console.log(db)
  console.log(db.collections)
  await db.collections.heroes.upsert({
      name: 'SomeHero2',
      color: 'red'
  });
  const query = await db.collections.heroes
  .findOne({
      selector: {}
  }).exec();
  console.log(query)
  console.log(query._data)
}
runMyQuery(db)