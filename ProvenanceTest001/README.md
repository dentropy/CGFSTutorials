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

* utf8
* json
* buffer


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
    * Delete a value in a sublevel, basically same as .del in level library
* get(sublevel_name, sublevel_key)
    * Get a value in a sublevel, basically same as .get in level library
