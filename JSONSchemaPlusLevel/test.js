// import LevelSchema from "./LevelSchemaExtended.js"
// import { Level } from "level"
// console.log(`\n\n`)
// console.log(`Setting up LevelDB`)
// const myLevelDB = new Level('./db', { valueEncoding: 'json' })
// console.log(`Sucesfully set up LevelDB`)
// console.log(`\n\n`)
// console.log(`Setting up LevelSchema`)
// let db = new LevelSchema(myLevelDB)
// console.log(`Sucesfully set up LevelSchema`)

import LevelSchema from "./LevelSchemaExtends.js"

console.log(`\n\n`)
console.log(`Setting up LevelSchemaExtended Version`)
let db = new LevelSchema('./db', { valueEncoding: 'json' })
console.log(`Sucesfully set up LevelSchema`)


console.log(`\n\n`)
console.log("Createing JSONSchema")
const schema = {
    type: "object",
    properties: {
      foo: {type: "integer"},
      bar: {type: "string"}
    },
    required: ["foo"],
    additionalProperties: false
  }
console.log(`This is our JSONSchema below`)
console.log(`${JSON.stringify(schema, null, 2)}`)


console.log(`\n\n`)
console.log("Create a level to store data")
let createSchemaSublevel = await db.createSchemaSublevel("test", schema)
console.log("createSchemaSublevel")
console.log(createSchemaSublevel)


console.log(`\n\n`)
console.log(`Test getting the schema we just set in the prvious step`)
let getJSONSchemaTest = await db.getJSONSchema("test")
console.log("getJSONSchemaTest")
console.log(getJSONSchemaTest)


console.log(`\n\n`)
console.log(`Test setting Valid data`)
try {
    let putSchemaTest = await db.putSchema(
        "test",
        "Mah Data",
        {
            foo : 12
        }
    )
    console.log("putSchemaTest Result")
    console.log(putSchemaTest)
} catch (error) {
    console.log("putSchemaTest failed")
}


console.log(`\n\n`)
console.log(`Test setting Invalid data`)
try {
    let putSchemaTest2 = await db.putSchema(
        "test",
        "Mah Data",
        {
            foo : ""
        }
    )
    console.log("")
    console.log("putSchemaTest2 Result")
    console.log(putSchemaTest2)
} catch (error) {
    console.log("")
    console.log("putSchemaTest2 failed")
    console.log(error)
}



console.log(`\n\n`)
console.log("Createing another JSONSchema")
const schema2 = {
    type: "object",
    properties: {
      the: {type: "string"}
    },
    required: ["foo"],
    additionalProperties: false
  }
console.log(`This is our JSONSchema below`)
console.log(`${JSON.stringify(schema2, null, 2)}`)


console.log(`\n\n`)
console.log(`Let's test deleting some data`)
// let testSublevel = db.sublevel("test", { valueEncoding: 'json' })
// await testSublevel.del("test")
let delete_response = await db.delSchema("test", "test")
console.log(delete_response)

console.log(`\n\n`)
console.log(`Let's check if the data was deleted, should return status:"error"`)
try {
    let result = await db.getSchema("test", "test")
    console.log(result)
    console.log("We did not get an error")
} catch (error) {
    console.log("Got the error")
    console.log(error)
}


console.log(`\n\n`)
console.log(`Let's insert data back in`)
let insertSchema = await db.insertSchema("test", "test", { foo : 14})
console.log("")
console.log("insertSchema")
console.log(insertSchema)


console.log(`\n\n`)
console.log(`Let's if the data is now there`)
try {
    let result = await db.getSchema("test", "test")
    console.log("result:")
    console.log(result)
    console.log("We did not get an error")
} catch (error) {
    console.log("Got the error")
    console.log(error)
}



console.log(`\n\n`)
console.log(`Let's test is insert produces an error like it is supposed to`)
try {
    let result = await db.insertSchema("test", "test", { foo : 16})
    console.log("result:")
    console.log(result)
} catch (error) {
    console.log("Got the error")
    console.log(error)
}
