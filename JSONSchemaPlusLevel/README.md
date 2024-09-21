# JSON Schema Plus LevelDB

## Description

* Here we just want to extend LevelDB to only insert data in when it matches a JSONSChema
* This library works like S3 where you always need to input the bucket name(sublevel), as well as the key of the file you want
* Recursive sublevel's are not supposed, just create a new namespace. This is because each namespace contains metadata sublevels
* TODO Iterator code still need to be written

## Tutorial

``` bash
git clone ssh://git@git.newatlantis.top:222/dentropy/CGFSTutorials.git
cd CGFSTutorials
cd JSONSchemaPlusLevel
npm i

rm -rf db && node test.js

rm -rf db && node testExtended.js

```


#### Functions

* constructor(SAME_AS_LEVEL)
    * insert(sublevel_name, sublevel_key, sublevel_value)
        * If a key already exists in leveldb, do not overwrite it
* Schema Functions
    * createSchemaSublevel(sublevel_name, sublevel_schema)
        * Create a sublevel with JSONSchema restrictions
    * getJSONSchema(sublevel_name)
        * Get the JSONSchema for a sublevel
    * putSchema(sublevel_name, sublevel_key, sublevel_value)
        * Put a value in the namespace of a sublevel, that matches the sublevel's JSONSchema
    * insertSchema(sublevel_name, sublevel_key, sublevel_value)
        * Insert, produce error if value already exists, if a value in the namespace of a sublevel, that matches the sublevel's JSONSchema
    * delSchema(sublevel_name, sublevel_key)
        * Delete a value in a sublevel, basically same as .del in level library
    * getSchema(sublevel_name, sublevel_key)
        * Get a value in a sublevel, basically same as .get in level library
