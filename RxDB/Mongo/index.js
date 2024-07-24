import { addRxPlugin, createRxDatabase } from "rxdb";
import { getRxStorageMongoDB } from "rxdb/plugins/storage-mongodb";
import { RxDBDevModePlugin } from "rxdb/plugins/dev-mode";
addRxPlugin(RxDBDevModePlugin);

// import { mkdir } from "node:fs/promises";
// try {
//   // [javascript - How to determine the location of the deno script? - Stack Overflow](https://stackoverflow.com/questions/72156289/how-to-determine-the-location-of-the-deno-script)
//   const createDir = await mkdir(Deno.cwd() + "/db", { recursive: true });

//   console.log(`created ${createDir}`);
// } catch (err) {
//   console.error(err.message);
// }

const mySchema = {
  "title": "hero schema",
  "version": 0,
  "description": "describes a simple hero",
  "primaryKey": "name",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "maxLength": 100, // <- the primary key must have set maxLength
    },
    "color": {
      "type": "string",
    },
    "healthpoints": {
      "type": "number",
      "minimum": 0,
      "maximum": 100,
    },
    "secret": {
      "type": "string",
    },
    "birthyear": {
      "type": "number",
      "final": true,
      "minimum": 1900,
      "maximum": 2050,
    },
    "skills": {
      "type": "array",
      "maxItems": 5,
      "uniqueItems": true,
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
          },
          "damage": {
            "type": "number",
          },
        },
      },
    },
  },
  "required": [
    "name",
    "color",
  ],
};

let db = null;
db = await createRxDatabase({
  name: "exampledb",
  storage: getRxStorageMongoDB({
    consistencyLevel: "strong",
    connection: "mongodb://localhost:27017",
    //multiInstance: true,
    // ignoreDuplicate: true
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

// try {

//   console.log("collections");
//   console.log(Object.keys(db));
//   console.log(db.storage)
//   console.log(db.collections)
// //   console.log(Object.keys(db.heroes));
// //   console.log("db");
// //   console.log(db.heroes);
// //   console.log(db["heroes"]);
//   try {
//     console.log("Adding collection");
//     await db.addCollections({
//       heroes: {
//         schema: mySchema,
//       },
//     });
//   } catch (error) {
//     console.log("myCollection error");
//     console.log(error);
//   }
//   //   console.log("myCollections")
//   //   console.log(db.collections)
//   //   console.log(db)
//   //   console.log(myCollections.humans)
//   //   console.log(Object.keys(myCollections.humans))
//   //   console.log(Object.keys(myCollections.humans.methods))
//   //   console.log(myCollections.humans.insert)

//   //   if (Object.keys(myCollections).includes("humans")) {
//   //     myCollections.humans.insert({
//   //       name: "foo",
//   //       color: "red",
//   //     });
//   //     const query = await myCollections.humans
//   //       .findOne({
//   //         selector: {},
//   //       }).exec();
//   //     console.log("query");
//   //     console.log(query);
//   //     console.log(query._data);
//   //   }
// } catch (error) {
//   console.log("got an error");
//   console.log(error);
// }

// async function runMyQuery(db){
//   console.log("Running MyQuery")
//   //   console.log(db)
//   //   console.log(db.collections)
//   console.log(Object.keys(db.collections))
//   await db.collections.heroes.upsert({
//       name: 'SomeHero2',
//       color: 'red'
//   });
//   const query = await db.collections.heroes
//   .findOne({
//       selector: {}
//   }).exec();
//   //   console.log(query)
//   console.log(query._data)
// }
// await runMyQuery(db)

// process.exit()
