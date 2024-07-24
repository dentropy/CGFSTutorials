import { createRxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { addRxPlugin } from 'rxdb';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
addRxPlugin(RxDBDevModePlugin);

export default async function myRxDBInit() {

    let db = null
    let myCollections = null
    console.log("DOES THIS RERENDER?\n\n\n")
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

    // db = await createRxDatabase({
    //     name: 'heroesdb',                   // <- name
    //     storage: getRxStorageDexie(),       // <- RxStorage
    //     ignoreDuplicate: true,
    //     /* Optional parameters: */
    //     // password: 'myPassword',             // <- password (optional)
    //     // multiInstance: true,                // <- multiInstance (optional, default: true)
    //     // eventReduce: true,                  // <- eventReduce (optional, default: false)
    //     // cleanupPolicy: {}                   // <- custom cleanup policy (optional) 
    // })
    const myRxDatabase = await createRxDatabase({
        name: 'heroesdb',
        storage: getRxStorageMongoDB({
            /**
             * MongoDB connection string
             * @link https://www.mongodb.com/docs/manual/reference/connection-string/
             */
            connection: 'mongodb://localhost:27017,localhost:27018,localhost:27019'
        })
    });
    
    try {
        // console.log("db.collections")
        // console.log(db.collections)
        // console.log(db.collections["humans"])
        // console.log(db.collections.humans)

        console.log(db.collections)
        console.log(Object.keys(db.collections))
        console.log("db")
        console.log(db.heroes)
        console.log(db["heroes"])


        if (myCollections == null) {
            try {
                console.log("Adding collection")
                console.log(myCollections)
                myCollections = await db.addCollections({
                    heroes: {
                        schema: mySchema
                    }
                });
                // myCollections = await db.addCollections({
                //     // key = collectionName
                //     humans: {
                //         schema: mySchema,
                //         statics: {},                          // (optional) ORM-functions for this collection
                //         methods: {},                          // (optional) ORM-functions for documents
                //         attachments: {},                      // (optional) ORM-functions for attachments
                //         options: {},                          // (optional) Custom parameters that might be used in plugins
                //         migrationStrategies: {},              // (optional)
                //         autoMigrate: true,                    // (optional) [default=true]
                //         cacheReplacementPolicy: function(){}, // (optional) custom cache replacement policy
                //         conflictHandler: function(){}         // (optional) a custom conflict handler can be used
                //     }
                // })
            } catch (error) {
                console.log("myCollection error")
                console.log(error)
            }
        }


        // console.log("myCollections")
        // console.log(db.collections)
        // console.log(db)
        // console.log(myCollections.humans)
        // console.log(Object.keys(myCollections.humans))
        // console.log(Object.keys(myCollections.humans.methods))
        // console.log(myCollections.humans.insert)

        if (Object.keys(myCollections).includes("humans")) {
            myCollections.humans.insert({
                name: 'foo',
                color: 'red'
            });
            const query = await myCollections.humans
                .findOne({
                    selector: {}
                }).exec();
            console.log("query")
            console.log(query)
            console.log(query._data)
        }
    } catch (error) {
        console.log("got an error")
        console.log(error)
    }
    return db
}
