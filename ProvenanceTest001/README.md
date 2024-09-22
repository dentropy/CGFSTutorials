``` json

{
    "LocalCIDStore": true,
    "IndexProvenance": true,
    "CollectionProvenance": true,
    "SchemaEnforced": true,
    "ValueEncoding": ""
}

```

#### Value Encoding Options

* "utf8"
* "json"
* "buffer"


## Functions Implimented
* constructor(LevelDB Object)
* createSchemaSublevel(sublevel_name, sublevel_schema)
    * Create a sublevel with JSONSchema restrictions

## TODO

* getSettings(sublevel_name)
    * Get the JSONSchema for a sublevel
* insert(sublevel_name, sublevel_key, sublevel_value)
    * Put a value in the namespace of a sublevel, that matches the sublevel's JSONSchema
* upsert(sublevel_name, sublevel_key, sublevel_value)
    * Insert, produce error if value already exists, if a value in the namespace of a sublevel, that matches the sublevel's JSONSchema
* del(sublevel_name, sublevel_key)
    * ENABLED IN SETTINGS
    * Delete a value in a sublevel, basically same as .del in level library
* get(sublevel_name, sublevel_key)
    * Get a value in a sublevel, basically same as .get in level library
* ITERATOR STUFF
* REVERSE CID LOOKUP (Maybe do DID's first)

#### npm installs

``` bash

npm install --save-dev mocha
npm install @ipld/dag-json
npm install level
npm install multiformats
npm install uuid

```

#### Tests to do

* What are they
	* Setup and test level works
	* Create a LevelSchemaProvenance object
	* Test creating Sublevel's with invalid settings
	* Successfully create a sublevel
	* Test zbase32 encoding of sublevel
	* Test schema insert with no key there
	* Test schema insert with key already there
	* Test schema insert with no key there 
	* Test schemaless data insert with key already there
	* Test upsert with no value there
	* Test upsert with value already there