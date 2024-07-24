import { createRxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { useEffect, useRef } from 'react'
import { addRxPlugin } from 'rxdb';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
addRxPlugin(RxDBDevModePlugin);

function MyRxDB() {

    let db = useRef(null)
    let myCollections = useRef(null)
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
    const runOnce = async () => {
        db.current = await createRxDatabase({
            name: 'heroesdb',                   // <- name
            storage: getRxStorageDexie(),       // <- RxStorage
            ignoreDuplicate: true,
            /* Optional parameters: */
            // password: 'myPassword',             // <- password (optional)
            // multiInstance: true,                // <- multiInstance (optional, default: true)
            // eventReduce: true,                  // <- eventReduce (optional, default: false)
            // cleanupPolicy: {}                   // <- custom cleanup policy (optional) 
        })
        try {
            // console.log("db.current.collections")
            // console.log(db.current.collections)
            // console.log(db.current.collections["humans"])
            // console.log(db.current.collections.humans)

            console.log(db.current.collections)
            console.log(Object.keys(db.current.collections))
            console.log("db.current")
            console.log(db.current.heroes)
            console.log(db.current["heroes"])


            if (myCollections.current == null) {
                try {
                    console.log("Adding collection")
                    console.log(myCollections.current)
                    myCollections.current = await db.current.addCollections({
                        heroes: {
                            schema: mySchema
                        }
                    });
                    // myCollections.current = await db.current.addCollections({
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


            // console.log("myCollections.current")
            // console.log(db.current.collections)
            // console.log(db.current)
            // console.log(myCollections.current.humans)
            // console.log(Object.keys(myCollections.current.humans))
            // console.log(Object.keys(myCollections.current.humans.methods))
            // console.log(myCollections.current.humans.insert)

            if (Object.keys(myCollections.current).includes("humans")) {
                myCollections.current.humans.insert({
                    name: 'foo',
                    color: 'red'
                });
                const query = await myCollections.current.humans
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
    }
    runOnce()

    async function runMyQuery(){
        console.log("Running MyQuery")
        console.log(db.current)
        console.log(db.current.collections)
        await db.current.collections.heroes.upsert({
            name: 'SomeHero2',
            color: 'red'
        });
        const query = await db.current.collections.heroes
        .findOne({
            selector: {}
        }).exec();
        console.log(query)

    }

    useEffect(() => {
        console.log("Use Effect")
    }, [])
    return (
        <>
            <h1>My RxDB Database</h1>
            <button onClick={runMyQuery}>Use RxDB</button>
        </>
    )
}


export default MyRxDB