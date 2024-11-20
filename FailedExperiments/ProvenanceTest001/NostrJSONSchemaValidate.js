import Ajv from 'ajv'

export default function NostrJSONSchemaValidate(input_data) {

    /*
    {
        "kind": 1,
        "created_at": 1727822682,
        "tags": [],
        "content": "hello",
        "pubkey": "a582c706dad3a703d6c0211dc25e6bb2cbc9081ced7c2adbab91150b905645a7",
        "id": "56d628eb967aa0b6a87455a54d00daa6dbdfcbead2dcb440f47d205ed4693bdc",
        "sig": "3cb1d21914a69b44955faf9fbfeb093436ac3cfc696a76ba4a6aaffc08496c04358bc169eb9f2bab354963ff2336429056a542fa5e3d0fe4d6b7973dd92a331e"
    }
    */
    const rawNostrJSONSchema = {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "Generated schema for Root",
        "type": "object",
        "properties": {
            "kind": {
                "type": "number"
            },
            "created_at": {
                "type": "number"
            },
            "tags": {
                "type": "array",
                "items": {}
            },
            "content": {
                "type": "string"
            },
            "pubkey": {
                "type": "string"
            },
            "id": {
                "type": "string"
            },
            "sig": {
                "type": "string"
            }
        },
        "required": [
            "kind",
            "created_at",
            "content",
            "pubkey",
            "id",
            "sig"
        ]
    }

    const ajv = new Ajv()
    const nostrJSONSchema = ajv.compile(rawNostrJSONSchema)
    try {
        if( nostrJSONSchema(input_data) ) {
            return {
                status: "success"
            }
        } else {
            return {
                status: "error",
                description: "That JSON does not match the expected output of a Nostr Event",
                JSONSchema: rawNostrJSONSchema
            }
        }
    } catch (error) {
        return {
            status: "error",
            error: error,
            description: "That JSON does not match the expected output of a Nostr Event",
            JSONSchema: rawNostrJSONSchema
        }
    }
}