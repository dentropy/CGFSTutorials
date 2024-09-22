import assert from "assert"
import { Level } from 'level'
import LevelSchemaProvenance from '../LevelSchemaProvenance.js'
import { v4 as uuidv4 } from 'uuid';

describe('Check if settings are set correctly', function () {
  describe('Check level works correctly', function () {
    it('Create level object, insert and get data from it', async function () {
        const myLevelDB = new Level(`./mydb/${String( uuidv4() )}`, { valueEncoding: 'json' })
        const set_name = "Alice"
        await myLevelDB.put('name', set_name)
        const set_age = 30
        await myLevelDB.put('age', set_age)
        const set_city = 'New York'
        await myLevelDB.put('city', set_city)
        const name = await myLevelDB.get('name')
        const age = await myLevelDB.get('age')
        const city = await myLevelDB.get('city')
        assert.equal(set_name, name);
        assert.equal(set_age, age);
        assert.equal(set_city, city);
    });
    it('Fail to create LevelSchemaProvenance sublevel due to LocalCIDStore set to false', async function () {
        const myLevelDB = new Level(`./mydb/${String( uuidv4() )}`, { valueEncoding: 'json' })
        const myLSPDB   = new LevelSchemaProvenance(myLevelDB)
        const createLSPDBTest = await myLSPDB.createSchemaSublevel(
            String( uuidv4() ),
            {
                "LocalCIDStore": false,
                "IndexProvenance": true,
                "CollectionProvenance": true,
                "CollectionProvenanceTimestamped": false,
                "CollectionProvenanceStoreLocal": true,
                "SchemaEnforced": true,
                "ValueEncoding": "utf8"
            }
        )
        const expectedResponse = {
            status: 'error',
            description: 'RemoteCIDStore functionality is not yet implimented'
          }
        assert.deepEqual(createLSPDBTest, expectedResponse);
    })
    it('Fail to create LevelSchemaProvenance sublevel due to CollectionProvenanceStoreLocal set to false', async function () {
        const myLevelDB = new Level(`./mydb/${String( uuidv4() )}`, { valueEncoding: 'json' })
        const myLSPDB   = new LevelSchemaProvenance(myLevelDB)
        const createLSPDBTest = await myLSPDB.createSchemaSublevel(
            String( uuidv4() ),
            {
                "LocalCIDStore": true,
                "IndexProvenance": true,
                "CollectionProvenance": true,
                "CollectionProvenanceTimestamped": false,
                "CollectionProvenanceStoreLocal": false,
                "SchemaEnforced": true,
                "ValueEncoding": "utf8"
            }
        )
        const expectedResponse = {
            status: 'error',
            description: 'Remote CollectionProvenanceStoreLocal is not implimented yet'
          }
        assert.deepEqual(createLSPDBTest, expectedResponse);
    })
    it('Fail to create LevelSchemaProvenance sublevel due to schema enabled but missing', async function () {
        const myLevelDB = new Level(`./mydb/${String( uuidv4() )}`, { valueEncoding: 'json' })
        const myLSPDB   = new LevelSchemaProvenance(myLevelDB)
        const sublevelName = uuidv4()
        const createLSPDBTest = await myLSPDB.createSchemaSublevel(
            sublevelName,
            {
                "LocalCIDStore": true,
                "IndexProvenance": true,
                "CollectionProvenance": true,
                "CollectionProvenanceTimestamped": false,
                "CollectionProvenanceStoreLocal": true,
                "SchemaEnforced": true,
                "ValueEncoding": "utf8"
            }
        )
        assert.equal(createLSPDBTest.status, "error");
        assert.equal(createLSPDBTest.description, "JSONSchema for collection failed to compile, make sure schema is included when SchemaEnforced is set to true");
    })
    it('Sucesfully create schemaless LevelSchemaProvenance sublevel', async function () {
        const myLevelDB = new Level(`./mydb/${String( uuidv4() )}`, { valueEncoding: 'json' })
        const myLSPDB   = new LevelSchemaProvenance(myLevelDB)
        const sublevelName = uuidv4()
        const createLSPDBTest = await myLSPDB.createSchemaSublevel(
            sublevelName,
            {
                "LocalCIDStore": true,
                "IndexProvenance": true,
                "CollectionProvenance": true,
                "CollectionProvenanceTimestamped": false,
                "CollectionProvenanceStoreLocal": true,
                "SchemaEnforced": false,
                "ValueEncoding": "utf8"
            }
        )
        assert.equal(createLSPDBTest.status, "success")
    })

    it('Fail to create LevelSchemaProvenance sublevel due to sublevel name already assigned', async function () {
        const myLevelDB = new Level(`./mydb/${String( uuidv4() )}`, { valueEncoding: 'json' })
        const myLSPDB   = new LevelSchemaProvenance(myLevelDB)
        const sublevelName = uuidv4()
        const createLSPDBTest = await myLSPDB.createSchemaSublevel(
            sublevelName,
            {
                "LocalCIDStore": true,
                "IndexProvenance": true,
                "CollectionProvenance": true,
                "CollectionProvenanceTimestamped": false,
                "CollectionProvenanceStoreLocal": true,
                "SchemaEnforced": false,
                "ValueEncoding": "utf8"
            }
        )
        const createLSPDBTestAlreadyTaken = await myLSPDB.createSchemaSublevel(
            sublevelName,
            {
                "LocalCIDStore": true,
                "IndexProvenance": true,
                "CollectionProvenance": true,
                "CollectionProvenanceTimestamped": false,
                "CollectionProvenanceStoreLocal": true,
                "SchemaEnforced": false,
                "ValueEncoding": "utf8"
            }
        )
        assert.equal(createLSPDBTestAlreadyTaken.status, "error");
        assert.equal(createLSPDBTestAlreadyTaken.description, 'This sublevel already exists');
    })
  })
  describe('Validate Insert', function () {
    it('Sucesfully create schemaless sublevel and insert to it', async function () {
        const myLevelDB = new Level(`./mydb/${String( uuidv4() )}`, { valueEncoding: 'json' })
        const myLSPDB   = new LevelSchemaProvenance(myLevelDB)
        const sublevelName = uuidv4()
        const createLSPDBTest = await myLSPDB.createSchemaSublevel(
            sublevelName,
            {
                "LocalCIDStore": true,
                "CollectionProvenanceStoreLocal": true,
                "SchemaEnforced": false,
                "IndexProvenance": true,
                "CollectionProvenance": true,
                "CollectionProvenanceTimestamped": true,
                "ValueEncoding": "utf8"
            }
        )
        let insertResponse = await myLSPDB.insert(sublevelName, "testkey", "testvalue")
        console.log(insertResponse)
    })
    it('Sucesfully create schemaless sublevel, insert to it, then they and insert again', async function () {

    })
  })
})
