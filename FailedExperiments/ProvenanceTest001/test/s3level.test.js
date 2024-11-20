import assert from "assert"
import { Level } from 'level'
import LevelSchemaProvenance from '../LevelSchemaProvenance.js'
import { v4 as uuidv4 } from 'uuid';
import { bases } from 'multiformats/basics'
import levelup from 'levelup'
import S3LevelDown from 's3leveldown'
import { S3Client } from '@aws-sdk/client-s3'
import encode from 'encoding-down'
import subleveldown from 'subleveldown'
describe('Check if settings are set correctly', function () {
    describe('Check level works correctly', function () {
        it('Create level object, insert and get data from it', async function () {
            const s3conf = {
                apiVersion: '2006-03-01',
                accessKeyId: 'minioadmin',
                secretAccessKey: 'minioadmin',
                endpoint: 'http://127.0.0.1:9000',
                s3ForcePathStyle: true,
                signatureVersion: 'v4'
            }
            const s3 = new S3Client(s3conf);
            const myLevelDB = levelup(encode(new S3LevelDown(String(uuidv4()), s3)), { valueEncoding: 'json' });
            // Define the recursive sublevel method
            function addSublevelMethod(dbInstance) {
                dbInstance.sublevel = function (name, options = {}) {
                const subdb = subleveldown(this, name, options);
                // Recursively add the sublevel method to the subdb
                addSublevelMethod(subdb);
                return subdb;
                };
            }
            
            // Add the sublevel method to the main db instance
            addSublevelMethod(myLevelDB);
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
            const s3conf = {
                apiVersion: '2006-03-01',
                accessKeyId: 'minioadmin',
                secretAccessKey: 'minioadmin',
                endpoint: 'http://127.0.0.1:9000',
                s3ForcePathStyle: true,
                signatureVersion: 'v4'
            }
            const s3 = new S3Client(s3conf);
            const myLevelDB = levelup(encode(new S3LevelDown(String(uuidv4()), s3)), { valueEncoding: 'json' });
            const myLSPDB = new LevelSchemaProvenance(myLevelDB)
            const sublevelName = uuidv4()
            const createLSPDBTest = await myLSPDB.createSchemaSublevel({
                sublevel_name: sublevelName,
                sublevel_settings: {
                    "LocalCIDStore": false,
                    "IndexProvenance": false,
                    "CollectionProvenance": true,
                    "CollectionProvenanceTimestamped": false,
                    "CollectionProvenanceStoreLocal": true,
                    "SchemaEnforced": true,
                    "ValueEncoding": "utf8"
                }
            })
            const expectedResponse = {
                status: 'error',
                description: 'RemoteCIDStore functionality is not yet implimented'
            }
            assert.deepEqual(createLSPDBTest, expectedResponse);
        })
        it('Fail to create LevelSchemaProvenance sublevel due to CollectionProvenanceStoreLocal set to false', async function () {
            const s3conf = {
                apiVersion: '2006-03-01',
                accessKeyId: 'minioadmin',
                secretAccessKey: 'minioadmin',
                endpoint: 'http://127.0.0.1:9000',
                s3ForcePathStyle: true,
                signatureVersion: 'v4'
            }
            const s3 = new S3Client(s3conf);
            const myLevelDB = levelup(encode(new S3LevelDown(String(uuidv4()), s3)), { valueEncoding: 'json' });
            const myLSPDB = new LevelSchemaProvenance(myLevelDB)
            const sublevelName = uuidv4()
            const createLSPDBTest = await myLSPDB.createSchemaSublevel({
                sublevel_name: sublevelName,
                sublevel_settings: {
                    "LocalCIDStore": true,
                    "IndexProvenance": false,
                    "CollectionProvenance": true,
                    "CollectionProvenanceTimestamped": false,
                    "CollectionProvenanceStoreLocal": false,
                    "SchemaEnforced": true,
                    "ValueEncoding": "utf8"
                }
            })
            const expectedResponse = {
                status: 'error',
                description: 'Remote CollectionProvenanceStoreLocal is not implimented yet'
            }
            assert.deepEqual(createLSPDBTest, expectedResponse);
        })
        it('Fail to create LevelSchemaProvenance sublevel due to schema enabled but missing', async function () {
            const s3conf = {
                apiVersion: '2006-03-01',
                accessKeyId: 'minioadmin',
                secretAccessKey: 'minioadmin',
                endpoint: 'http://127.0.0.1:9000',
                s3ForcePathStyle: true,
                signatureVersion: 'v4'
            }
            const s3 = new S3Client(s3conf);
            const myLevelDB = levelup(encode(new S3LevelDown(String(uuidv4()), s3)), { valueEncoding: 'json' });
            const myLSPDB = new LevelSchemaProvenance(myLevelDB)
            const sublevelName = uuidv4()
            const createLSPDBTest = await myLSPDB.createSchemaSublevel({
                sublevel_name: sublevelName,
                sublevel_settings: {
                    "LocalCIDStore": true,
                    "IndexProvenance": false,
                    "CollectionProvenance": true,
                    "CollectionProvenanceTimestamped": false,
                    "CollectionProvenanceStoreLocal": true,
                    "SchemaEnforced": true,
                    "ValueEncoding": "utf8"
                }
            })
            assert.equal(createLSPDBTest.status, "error");
            assert.equal(createLSPDBTest.description, "JSONSchema for collection failed to compile, make sure schema is included when SchemaEnforced is set to true");
        })
        it('Sucesfully create schemaless LevelSchemaProvenance sublevel', async function () {
            const s3conf = {
                apiVersion: '2006-03-01',
                accessKeyId: 'minioadmin',
                secretAccessKey: 'minioadmin',
                endpoint: 'http://127.0.0.1:9000',
                s3ForcePathStyle: true,
                signatureVersion: 'v4'
            }
            const s3 = new S3Client(s3conf);
            const myLevelDB = levelup(encode(new S3LevelDown(String(uuidv4()), s3)), { valueEncoding: 'json' });
            function addSublevelMethod(dbInstance) {
                dbInstance.sublevel = function (name, options = {}) {
                const subdb = subleveldown(this, name, options);
                // Recursively add the sublevel method to the subdb
                addSublevelMethod(subdb);
                return subdb;
                };
            }
            // Add the sublevel method to the main db instance
            addSublevelMethod(myLevelDB);
            const myLSPDB = new LevelSchemaProvenance(myLevelDB)
            const sublevelName = uuidv4()
            const createLSPDBTest = await myLSPDB.createSchemaSublevel({
                sublevel_name: sublevelName,
                sublevel_settings: {
                    "LocalCIDStore": true,
                    "IndexProvenance": false,
                    "CollectionProvenance": true,
                    "CollectionProvenanceTimestamped": false,
                    "CollectionProvenanceStoreLocal": true,
                    "SchemaEnforced": false,
                    "ValueEncoding": "utf8"
                }
            })
            assert.equal(createLSPDBTest.status, "success")
        })

        it('Fail to create LevelSchemaProvenance sublevel due to sublevel name already assigned', async function () {
            const s3conf = {
                apiVersion: '2006-03-01',
                accessKeyId: 'minioadmin',
                secretAccessKey: 'minioadmin',
                endpoint: 'http://127.0.0.1:9000',
                s3ForcePathStyle: true,
                signatureVersion: 'v4'
            }
            const s3 = new S3Client(s3conf);
            const myLevelDB = levelup(encode(new S3LevelDown(String(uuidv4()), s3)), { valueEncoding: 'json' });
            // Define the recursive sublevel method
            function addSublevelMethod(dbInstance) {
                dbInstance.sublevel = function (name, options = {}) {
                const subdb = subleveldown(this, name, options);
                // Recursively add the sublevel method to the subdb
                addSublevelMethod(subdb);
                return subdb;
                };
            }
            
            // Add the sublevel method to the main db instance
            addSublevelMethod(myLevelDB);
            const myLSPDB = new LevelSchemaProvenance(myLevelDB)
            const sublevelName = uuidv4()
            const createLSPDBTest = await myLSPDB.createSchemaSublevel({
                sublevel_name: sublevelName,
                sublevel_settings: {
                    "LocalCIDStore": true,
                    "IndexProvenance": false,
                    "CollectionProvenance": true,
                    "CollectionProvenanceTimestamped": false,
                    "CollectionProvenanceStoreLocal": true,
                    "SchemaEnforced": false,
                    "ValueEncoding": "utf8"
                }
            })
            const createLSPDBTestAlreadyTaken = await myLSPDB.createSchemaSublevel({
                sublevel_name: sublevelName,
                sublevel_settings: {
                    "LocalCIDStore": true,
                    "IndexProvenance": false,
                    "CollectionProvenance": true,
                    "CollectionProvenanceTimestamped": false,
                    "CollectionProvenanceStoreLocal": true,
                    "SchemaEnforced": false,
                    "ValueEncoding": "utf8"
                }
            })
            assert.equal(createLSPDBTestAlreadyTaken.status, "error");
            assert.equal(createLSPDBTestAlreadyTaken.description, 'This sublevel already exists');
        })
    })
    describe('Validate Insert', function () {
        it('Sucesfully create schemaless sublevel and insert to it', async function () {
            const s3conf = {
                apiVersion: '2006-03-01',
                accessKeyId: 'minioadmin',
                secretAccessKey: 'minioadmin',
                endpoint: 'http://127.0.0.1:9000',
                s3ForcePathStyle: true,
                signatureVersion: 'v4'
            }
            const s3 = new S3Client(s3conf);
            const myLevelDB = levelup(encode(new S3LevelDown(String(uuidv4()), s3)), { valueEncoding: 'json' });
            // Define the recursive sublevel method
            function addSublevelMethod(dbInstance) {
                dbInstance.sublevel = function (name, options = {}) {
                const subdb = subleveldown(this, name, options);
                // Recursively add the sublevel method to the subdb
                addSublevelMethod(subdb);
                return subdb;
                };
            }
            
            // Add the sublevel method to the main db instance
            addSublevelMethod(myLevelDB);
            const myLSPDB = new LevelSchemaProvenance(myLevelDB)
            const sublevelName = uuidv4()
            const createLSPDBTest = await myLSPDB.createSchemaSublevel({
                sublevel_name: sublevelName,
                sublevel_settings: {
                    "LocalCIDStore": true,
                    "CollectionProvenanceStoreLocal": true,
                    "SchemaEnforced": false,
                    "IndexProvenance": false,
                    "CollectionProvenance": true,
                    "CollectionProvenanceTimestamped": true,
                    "ValueEncoding": "utf8"
                }
            })
            let insertResponse = await myLSPDB.insert({
                sublevel_name: sublevelName, 
                sublevel_key: "testkey", 
                sublevel_value: "testvalue"
            })
            assert.equal(insertResponse.status, "success");
            let textEncoder = new TextEncoder();
            let textDecoder = new TextDecoder();
            let getResponse = await myLSPDB.get({
                sublevel_name: sublevelName,
                sublevel_key: "testkey"
            })
            let base58btcCoded = bases.base58btc.encode(await (textEncoder.encode("testvalue")))
            assert.equal(base58btcCoded, getResponse)
            let base58btcDecoded = bases.base58btc.decode(getResponse)
            let decodedTextResponse = textDecoder.decode(base58btcDecoded)
            assert.equal("testvalue", decodedTextResponse)
        })
        it('Sucesfully create schemaless sublevel, insert to it, then insert again', async function () {
            const s3conf = {
                apiVersion: '2006-03-01',
                accessKeyId: 'minioadmin',
                secretAccessKey: 'minioadmin',
                endpoint: 'http://127.0.0.1:9000',
                s3ForcePathStyle: true,
                signatureVersion: 'v4'
            }
            const s3 = new S3Client(s3conf);
            const myLevelDB = levelup(encode(new S3LevelDown(String(uuidv4()), s3)), { valueEncoding: 'json' });
            // Define the recursive sublevel method
            function addSublevelMethod(dbInstance) {
                dbInstance.sublevel = function (name, options = {}) {
                const subdb = subleveldown(this, name, options);
                // Recursively add the sublevel method to the subdb
                addSublevelMethod(subdb);
                return subdb;
                };
            }
            
            // Add the sublevel method to the main db instance
            addSublevelMethod(myLevelDB);
            const myLSPDB = new LevelSchemaProvenance(myLevelDB)
            const sublevelName = uuidv4()
            const createLSPDBTest = await myLSPDB.createSchemaSublevel({
                sublevel_name: sublevelName,
                sublevel_settings: {
                    "LocalCIDStore": true,
                    "CollectionProvenanceStoreLocal": true,
                    "SchemaEnforced": false,
                    "IndexProvenance": false,
                    "CollectionProvenance": true,
                    "CollectionProvenanceTimestamped": true,
                    "ValueEncoding": "utf8"
                }
            })
            let insertResponse = await myLSPDB.insert({
                sublevel_name: sublevelName, 
                sublevel_key: "testkey", 
                sublevel_value: "testvalue"
            })
            assert.equal(insertResponse.status, "success");
            let textEncoder = new TextEncoder();
            let textDecoder = new TextDecoder();
            let getResponse = await myLSPDB.get({
                sublevel_name: sublevelName,
                sublevel_key: "testkey"
            })
            let base58btcCoded = bases.base58btc.encode(await (textEncoder.encode("testvalue")))
            assert.equal(base58btcCoded, getResponse)
            let base58btcDecoded = bases.base58btc.decode(getResponse)
            let decodedTextResponse = textDecoder.decode(base58btcDecoded)
            assert.equal("testvalue", decodedTextResponse)
            let insertResponse2 = await myLSPDB.insert({
                sublevel_name: sublevelName, 
                sublevel_key: "testkey", 
                sublevel_value: "testvalue2"
            })
            assert.equal(insertResponse2.status, "error")
        })
        it('Sucesfully create a schema sublevel', async function () {
            const s3conf = {
                apiVersion: '2006-03-01',
                accessKeyId: 'minioadmin',
                secretAccessKey: 'minioadmin',
                endpoint: 'http://127.0.0.1:9000',
                s3ForcePathStyle: true,
                signatureVersion: 'v4'
            }
            const s3 = new S3Client(s3conf);
            const myLevelDB = levelup(encode(new S3LevelDown(String(uuidv4()), s3)), { valueEncoding: 'json' });
            // Define the recursive sublevel method
            function addSublevelMethod(dbInstance) {
                dbInstance.sublevel = function (name, options = {}) {
                const subdb = subleveldown(this, name, options);
                // Recursively add the sublevel method to the subdb
                addSublevelMethod(subdb);
                return subdb;
                };
            }
            
            // Add the sublevel method to the main db instance
            addSublevelMethod(myLevelDB);
            const myLSPDB = new LevelSchemaProvenance(myLevelDB)
            const sublevelName = uuidv4()
            const createLSPDBTest = await myLSPDB.createSchemaSublevel({
                sublevel_name: sublevelName,
                sublevel_settings: {
                    "LocalCIDStore": true,
                    "CollectionProvenanceStoreLocal": true,
                    "SchemaEnforced": true,
                    "Schema": {
                        "$schema": "http://json-schema.org/draft-07/schema#",
                        "title": "Generated schema for Root",
                        "type": "object",
                        "properties": {
                            "userId": {
                                "type": "number"
                            },
                            "id": {
                                "type": "number"
                            },
                            "title": {
                                "type": "string"
                            },
                            "completed": {
                                "type": "boolean"
                            }
                        },
                        "required": [
                            "userId",
                            "id",
                            "title",
                            "completed"
                        ]
                    },
                    "IndexProvenance": false,
                    "CollectionProvenance": true,
                    "CollectionProvenanceTimestamped": true,
                    "ValueEncoding": "utf8"
                }
            })
            assert.equal(createLSPDBTest.status, "success")
        })
        it('Sucesfully create a schema sublevel, insert invalid json into it', async function () {
            const s3conf = {
                apiVersion: '2006-03-01',
                accessKeyId: 'minioadmin',
                secretAccessKey: 'minioadmin',
                endpoint: 'http://127.0.0.1:9000',
                s3ForcePathStyle: true,
                signatureVersion: 'v4'
            }
            const s3 = new S3Client(s3conf);
            const myLevelDB = levelup(encode(new S3LevelDown(String(uuidv4()), s3)), { valueEncoding: 'json' });
            // Define the recursive sublevel method
            function addSublevelMethod(dbInstance) {
                dbInstance.sublevel = function (name, options = {}) {
                const subdb = subleveldown(this, name, options);
                // Recursively add the sublevel method to the subdb
                addSublevelMethod(subdb);
                return subdb;
                };
            }
            
            // Add the sublevel method to the main db instance
            addSublevelMethod(myLevelDB);
            const myLSPDB = new LevelSchemaProvenance(myLevelDB)
            const sublevelName = uuidv4()
            const createLSPDBTest = await myLSPDB.createSchemaSublevel({
                sublevel_name: sublevelName,
                sublevel_settings: {
                    "LocalCIDStore": true,
                    "CollectionProvenanceStoreLocal": true,
                    "SchemaEnforced": true,
                    "Schema": {
                        "$schema": "http://json-schema.org/draft-07/schema#",
                        "title": "Generated schema for Root",
                        "type": "object",
                        "properties": {
                            "userId": {
                                "type": "number"
                            },
                            "id": {
                                "type": "number"
                            },
                            "title": {
                                "type": "string"
                            },
                            "completed": {
                                "type": "boolean"
                            }
                        },
                        "required": [
                            "userId",
                            "id",
                            "title",
                            "completed"
                        ]
                    },
                    "IndexProvenance": false,
                    "CollectionProvenance": true,
                    "CollectionProvenanceTimestamped": true,
                    "ValueEncoding": "utf8"
                }
            })
            assert.equal(createLSPDBTest.status, "success")
            const insertResponse = await myLSPDB.insert({
                sublevel_name: sublevelName, 
                sublevel_key: "testkey", 
                sublevel_value: { hello: "world" }
            })
            assert.equal(insertResponse.status, "error")
        })
        it('Sucesfully create a schema sublevel, insert valid json into it, validate that data is in sublevel', async function () {
            const s3conf = {
                apiVersion: '2006-03-01',
                accessKeyId: 'minioadmin',
                secretAccessKey: 'minioadmin',
                endpoint: 'http://127.0.0.1:9000',
                s3ForcePathStyle: true,
                signatureVersion: 'v4'
            }
            const s3 = new S3Client(s3conf);
            const myLevelDB = levelup(encode(new S3LevelDown(String(uuidv4()), s3)), { valueEncoding: 'json' });
            // Define the recursive sublevel method
            function addSublevelMethod(dbInstance) {
                dbInstance.sublevel = function (name, options = {}) {
                const subdb = subleveldown(this, name, options);
                // Recursively add the sublevel method to the subdb
                addSublevelMethod(subdb);
                return subdb;
                };
            }
            
            // Add the sublevel method to the main db instance
            addSublevelMethod(myLevelDB);
            const myLSPDB = new LevelSchemaProvenance(myLevelDB)
            const sublevelName = uuidv4()
            const createLSPDBTest = await myLSPDB.createSchemaSublevel({
                sublevel_name: sublevelName,
                sublevel_settings: {
                    "LocalCIDStore": true,
                    "CollectionProvenanceStoreLocal": true,
                    "SchemaEnforced": true,
                    "Schema": {
                        "$schema": "http://json-schema.org/draft-07/schema#",
                        "title": "Generated schema for Root",
                        "type": "object",
                        "properties": {
                            "userId": {
                                "type": "number"
                            },
                            "id": {
                                "type": "number"
                            },
                            "title": {
                                "type": "string"
                            },
                            "completed": {
                                "type": "boolean"
                            }
                        },
                        "required": [
                            "userId",
                            "id",
                            "title",
                            "completed"
                        ]
                    },
                    "IndexProvenance": false,
                    "CollectionProvenance": true,
                    "CollectionProvenanceTimestamped": true,
                    "ValueEncoding": "utf8"
                }
            })
            assert.equal(createLSPDBTest.status, "success")
            const tmpData = {
                "userId": 1,
                "id": 1,
                "title": "delectus aut autem",
                "completed": false
            }
            const insertResponse = await myLSPDB.insert({
                sublevel_name: sublevelName, 
                sublevel_key: "testkey", 
                sublevel_value: tmpData
            })
            assert.equal(insertResponse.status, "success")
            const validateGet = await myLSPDB.get({
                sublevel_name: sublevelName,
                sublevel_key: "testkey"
            })
            assert.deepEqual(validateGet, tmpData)
        })
        it('Sucesfully create a schema sublevel with IndexProvenance, insert valid json into it', async function () {
            const s3conf = {
                apiVersion: '2006-03-01',
                accessKeyId: 'minioadmin',
                secretAccessKey: 'minioadmin',
                endpoint: 'http://127.0.0.1:9000',
                s3ForcePathStyle: true,
                signatureVersion: 'v4'
            }
            const s3 = new S3Client(s3conf);
            const myLevelDB = levelup(encode(new S3LevelDown(String(uuidv4()), s3)), { valueEncoding: 'json' });
            // Define the recursive sublevel method
            function addSublevelMethod(dbInstance) {
                dbInstance.sublevel = function (name, options = {}) {
                const subdb = subleveldown(this, name, options);
                // Recursively add the sublevel method to the subdb
                addSublevelMethod(subdb);
                return subdb;
                };
            }
            
            // Add the sublevel method to the main db instance
            addSublevelMethod(myLevelDB);
            const myLSPDB = new LevelSchemaProvenance(myLevelDB)
            const sublevelName = uuidv4()
            const createLSPDBTest = await myLSPDB.createSchemaSublevel({
                sublevel_name: sublevelName,
                sublevel_settings: {
                    "LocalCIDStore": true,
                    "CollectionProvenanceStoreLocal": true,
                    "SchemaEnforced": true,
                    "Schema": {
                        "$schema": "http://json-schema.org/draft-07/schema#",
                        "title": "Generated schema for Root",
                        "type": "object",
                        "properties": {
                            "userId": {
                                "type": "number"
                            },
                            "id": {
                                "type": "number"
                            },
                            "title": {
                                "type": "string"
                            },
                            "completed": {
                                "type": "boolean"
                            }
                        },
                        "required": [
                            "userId",
                            "id",
                            "title",
                            "completed"
                        ]
                    },
                    "IndexProvenance": true,
                    "CollectionProvenance": true,
                    "CollectionProvenanceTimestamped": true,
                    "ValueEncoding": "utf8"
                }
            })
            assert.equal(createLSPDBTest.status, "success")
            const tmpData = {
                "userId": 1,
                "id": 1,
                "title": "delectus aut autem",
                "completed": false
            }
            const insertResponse = await myLSPDB.insert({
                sublevel_name: sublevelName, 
                sublevel_key: "testkey", 
                sublevel_value: tmpData
            })
            assert.equal(insertResponse.status, "success")
        })
        it('Sucesfully create a schema sublevel with IndexProvenance, insert valid json into it, validate that data is in sublevel', async function () {
            const s3conf = {
                apiVersion: '2006-03-01',
                accessKeyId: 'minioadmin',
                secretAccessKey: 'minioadmin',
                endpoint: 'http://127.0.0.1:9000',
                s3ForcePathStyle: true,
                signatureVersion: 'v4'
            }
            const s3 = new S3Client(s3conf);
            const myLevelDB = levelup(encode(new S3LevelDown(String(uuidv4()), s3)), { valueEncoding: 'json' });
            // Define the recursive sublevel method
            function addSublevelMethod(dbInstance) {
                dbInstance.sublevel = function (name, options = {}) {
                const subdb = subleveldown(this, name, options);
                // Recursively add the sublevel method to the subdb
                addSublevelMethod(subdb);
                return subdb;
                };
            }
            
            // Add the sublevel method to the main db instance
            addSublevelMethod(myLevelDB);
            const myLSPDB = new LevelSchemaProvenance(myLevelDB)
            const sublevelName = uuidv4()
            const createLSPDBTest = await myLSPDB.createSchemaSublevel({
                sublevel_name: sublevelName,
                sublevel_settings: {
                    "LocalCIDStore": true,
                    "CollectionProvenanceStoreLocal": true,
                    "SchemaEnforced": true,
                    "Schema": {
                        "$schema": "http://json-schema.org/draft-07/schema#",
                        "title": "Generated schema for Root",
                        "type": "object",
                        "properties": {
                            "userId": {
                                "type": "number"
                            },
                            "id": {
                                "type": "number"
                            },
                            "title": {
                                "type": "string"
                            },
                            "completed": {
                                "type": "boolean"
                            }
                        },
                        "required": [
                            "userId",
                            "id",
                            "title",
                            "completed"
                        ]
                    },
                    "IndexProvenance": true,
                    "CollectionProvenance": true,
                    "CollectionProvenanceTimestamped": true,
                    "ValueEncoding": "utf8"
                }
            })
            assert.equal(createLSPDBTest.status, "success")
            const tmpData = {
                "userId": 1,
                "id": 1,
                "title": "delectus aut autem",
                "completed": false
            }
            const insertResponse = await myLSPDB.insert({
                sublevel_name: sublevelName, 
                sublevel_key: "testkey",
                sublevel_value: tmpData
            })
            assert.equal(insertResponse.status, "success")
            const getResponse = await myLSPDB.get({
                sublevel_name: sublevelName, 
                sublevel_key: "testkey"
            })
            assert.deepEqual(getResponse, tmpData)
        })
    })
    describe('Validate update query', function () {
        it('Sucesfully update something', async function () {
            const s3conf = {
                apiVersion: '2006-03-01',
                accessKeyId: 'minioadmin',
                secretAccessKey: 'minioadmin',
                endpoint: 'http://127.0.0.1:9000',
                s3ForcePathStyle: true,
                signatureVersion: 'v4'
            }
            const s3 = new S3Client(s3conf);
            const myLevelDB = levelup(encode(new S3LevelDown(String(uuidv4()), s3)), { valueEncoding: 'json' });
            // Define the recursive sublevel method
            function addSublevelMethod(dbInstance) {
                dbInstance.sublevel = function (name, options = {}) {
                const subdb = subleveldown(this, name, options);
                // Recursively add the sublevel method to the subdb
                addSublevelMethod(subdb);
                return subdb;
                };
            }
            
            // Add the sublevel method to the main db instance
            addSublevelMethod(myLevelDB);
            const myLSPDB = new LevelSchemaProvenance(myLevelDB)
            const sublevelName = uuidv4()
            const createLSPDBTest = await myLSPDB.createSchemaSublevel({
                sublevel_name: sublevelName,
                sublevel_settings: {
                    "LocalCIDStore": true,
                    "CollectionProvenanceStoreLocal": true,
                    "SchemaEnforced": true,
                    "Schema": {
                        "$schema": "http://json-schema.org/draft-07/schema#",
                        "title": "Generated schema for Root",
                        "type": "object",
                        "properties": {
                            "userId": {
                                "type": "number"
                            },
                            "id": {
                                "type": "number"
                            },
                            "title": {
                                "type": "string"
                            },
                            "completed": {
                                "type": "boolean"
                            }
                        },
                        "required": [
                            "userId",
                            "id",
                            "title",
                            "completed"
                        ]
                    },
                    "IndexProvenance": true,
                    "CollectionProvenance": true,
                    "CollectionProvenanceTimestamped": true,
                    "ValueEncoding": "utf8"
                }
            })
            assert.equal(createLSPDBTest.status, "success")
            const tmpData = {
                "userId": 1,
                "id": 1,
                "title": "delectus aut autem",
                "completed": false
            }
            const insertResponse = await myLSPDB.insert({
                sublevel_name: sublevelName,
                sublevel_key: "testkey",
                sublevel_value: tmpData
            })
            assert.equal(insertResponse.status, "success")
            const getResponse = await myLSPDB.get({
                sublevel_name: sublevelName, 
                sublevel_key: "testkey"
            })
            assert.deepEqual(getResponse, tmpData)
            const tmpData2 = {
                "userId": 2,
                "id": 2,
                "title": "Something latin",
                "completed": true
            }
            const updateResponse = await myLSPDB.update({
                sublevel_name: sublevelName,
                sublevel_key: "testkey",
                sublevel_value: tmpData2
            })
            assert.equal(updateResponse.status, "success")
            const getResponse2 = await myLSPDB.get({
                sublevel_name: sublevelName, 
                sublevel_key: "testkey"
            })
            assert.deepEqual(getResponse2, tmpData2)
        })
    })
    describe('Validate upsert query', function () {
        it('Sucesfully upsert something', async function () {
            const s3conf = {
                apiVersion: '2006-03-01',
                accessKeyId: 'minioadmin',
                secretAccessKey: 'minioadmin',
                endpoint: 'http://127.0.0.1:9000',
                s3ForcePathStyle: true,
                signatureVersion: 'v4'
            }
            const s3 = new S3Client(s3conf);
            const myLevelDB = levelup(encode(new S3LevelDown(String(uuidv4()), s3)), { valueEncoding: 'json' });
            // Define the recursive sublevel method
            function addSublevelMethod(dbInstance) {
                dbInstance.sublevel = function (name, options = {}) {
                const subdb = subleveldown(this, name, options);
                // Recursively add the sublevel method to the subdb
                addSublevelMethod(subdb);
                return subdb;
                };
            }
            
            // Add the sublevel method to the main db instance
            addSublevelMethod(myLevelDB);
            const myLSPDB = new LevelSchemaProvenance(myLevelDB)
            const sublevelName = uuidv4()
            const createLSPDBTest = await myLSPDB.createSchemaSublevel({
                sublevel_name: sublevelName,
                sublevel_settings: {
                    "LocalCIDStore": true,
                    "CollectionProvenanceStoreLocal": true,
                    "SchemaEnforced": true,
                    "Schema": {
                        "$schema": "http://json-schema.org/draft-07/schema#",
                        "title": "Generated schema for Root",
                        "type": "object",
                        "properties": {
                            "userId": {
                                "type": "number"
                            },
                            "id": {
                                "type": "number"
                            },
                            "title": {
                                "type": "string"
                            },
                            "completed": {
                                "type": "boolean"
                            }
                        },
                        "required": [
                            "userId",
                            "id",
                            "title",
                            "completed"
                        ]
                    },
                    "IndexProvenance": true,
                    "CollectionProvenance": true,
                    "CollectionProvenanceTimestamped": true,
                    "ValueEncoding": "utf8"
                }
            })
            assert.equal(createLSPDBTest.status, "success")
            const tmpData = {
                "userId": 1,
                "id": 1,
                "title": "delectus aut autem",
                "completed": false
            }
            const upsertResponse = await myLSPDB.upsert({
                sublevel_name: sublevelName, 
                sublevel_key: "testkey", 
                sublevel_value: tmpData
            })
            assert.equal(upsertResponse.status, "success")
            const getResponse = await myLSPDB.get({
                sublevel_name: sublevelName, 
                sublevel_key: "testkey"
            })
            assert.deepEqual(getResponse, tmpData)
            const tmpData2 = {
                "userId": 2,
                "id": 2,
                "title": "Something latin",
                "completed": true
            }
            const upsertResponse2 = await myLSPDB.upsert({
                sublevel_name: sublevelName, 
                sublevel_key: "testkey", 
                sublevel_value: tmpData2
            })
            assert.equal(upsertResponse2.status, "success")
            const getResponse2 = await myLSPDB.get({
                sublevel_name: sublevelName, 
                sublevel_key: "testkey"
            })
            assert.deepEqual(getResponse2, tmpData2)
        })
    })
})
