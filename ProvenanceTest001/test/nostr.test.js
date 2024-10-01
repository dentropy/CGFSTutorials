import NostrJSONSchemaValidate from "../NostrJSONSchemaValidate.js"
import assert from "assert"

describe('Run some valid and invalid nostr events through this nostr event validateor', function () {
    it('Test a simple VALID nostr event', async function () {
        let nostr_event = {
            "kind": 1,
            "created_at": 1727822682,
            "tags": [
              [
                "p",
                "dentish"
              ],
              [
                "CID",
                "bagaaieraqeiesbwbkdgq5wzdcdxdqn6jgnbltptfsuufeq6wn5kuiikujkda"
              ]
            ],
            "content": "hello",
            "pubkey": "a582c706dad3a703d6c0211dc25e6bb2cbc9081ced7c2adbab91150b905645a7",
            "id": "56d628eb967aa0b6a87455a54d00daa6dbdfcbead2dcb440f47d205ed4693bdc",
            "sig": "3cb1d21914a69b44955faf9fbfeb093436ac3cfc696a76ba4a6aaffc08496c04358bc169eb9f2bab354963ff2336429056a542fa5e3d0fe4d6b7973dd92a331e"
          }
          let nostr_json_test = NostrJSONSchemaValidate(nostr_event)
          assert.equal(nostr_json_test.status, "success")
    })
    it('Test a simple INVALID nostr event', async function () {
        let nostr_event = {
            "kind": 1,
            "created_at": 1727822682,
            "tags": [
              [
                "p",
                "dentish"
              ],
              [
                "CID",
                "bagaaieraqeiesbwbkdgq5wzdcdxdqn6jgnbltptfsuufeq6wn5kuiikujkda"
              ]
            ],
            "conten": "hello", // THis line was changed
            "pubkey": "a582c706dad3a703d6c0211dc25e6bb2cbc9081ced7c2adbab91150b905645a7",
            "id": "56d628eb967aa0b6a87455a54d00daa6dbdfcbead2dcb440f47d205ed4693bdc",
            "sig": "3cb1d21914a69b44955faf9fbfeb093436ac3cfc696a76ba4a6aaffc08496c04358bc169eb9f2bab354963ff2336429056a542fa5e3d0fe4d6b7973dd92a331e"
          }
          let nostr_json_test = NostrJSONSchemaValidate(nostr_event)
          assert.equal(nostr_json_test.status, "error")
    })
})