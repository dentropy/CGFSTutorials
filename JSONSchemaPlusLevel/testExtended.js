import LevelSchema from "./LevelSchemaExtends.js"
import { Level } from "level"

// const myLevelDB = new Level('./db', { valueEncoding: 'json' })
let db = new LevelSchema('./db', { valueEncoding: 'json' })

// console.log(LevelSchema)
// console.log(db)


const schema = {
    type: "object",
    properties: {
      foo: {type: "integer"},
      bar: {type: "string"}
    },
    required: ["foo"],
    additionalProperties: false
  }
let putSchemaSublevel = await db.putSchemaSublevel("test", schema)
console.log("putSchemaSublevel")
console.log(putSchemaSublevel)


let getJSONSchemaTest = await db.getJSONSchema("test")
console.log("")
console.log("getJSONSchemaTest")
console.log(getJSONSchemaTest)

try {
    let putSchemaTest = await db.putSchema(
        "test",
        "Mah Data",
        {
            foo : 12
        }
    )
    console.log("")
    console.log("putSchemaTest Result")
    console.log(putSchemaTest)
} catch (error) {
    console.log("")
    console.log("putSchemaTest failed")
}


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

const schema2 = {
    type: "object",
    properties: {
      the: {type: "string"}
    },
    required: ["foo"],
    additionalProperties: false
  }
// let testSublevel = myLevelDB.sublevel("test", { valueEncoding: 'json' })
// await testSublevel.del("test")
let insertSchema = await db.insertSchema("test", "test", { foo : 14})
console.log("")
console.log("insertSchema")
console.log(insertSchema)
let insertSchema2 = await db.insertSchema("test", "test3", { foo : 14})
console.log("insertSchema2")
console.log(insertSchema2)