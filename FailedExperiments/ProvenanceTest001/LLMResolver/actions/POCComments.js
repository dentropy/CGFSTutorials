import { Command } from "commander";
import fs from "fs";
import LevelSchemaProvenance from "../../LevelSchemaProvenance.js";
import { Level } from "level";
import * as nip19 from "nostr-tools/nip19";
import Ajv from "ajv";
import { generateSecretKey, getPublicKey } from "nostr-tools/pure";
import { SimplePool } from "nostr-tools/pool";
import * as nip04 from "nostr-tools/nip04";
import { finalizeEvent, verifyEvent } from "nostr-tools";
import { Relay } from "nostr-tools";

// https://medium.com/@brysontang/creating-a-nostr-client-in-typescript-a0ce023a0bfc
const relays = ["ws://localhost:7007"];
export const nostrGet = async (params) => {
  //   const relayObject = await window.nostr.getRelays();
  //   const relays = Object.keys(relayObject);

  const pool = new SimplePool();

  const events = await pool.get(relays, params);
  console.log("events");
  console.log(events);
  return events;
};

// Setup CLI and parse arguments from CLI
const program = new Command();
program
  .name("CGFS AddAdmin")
  .description("CLI tool to interface with CGFS App")
  .version("0.0.1");
program
  .option("-i, --input <file_path>", "filepath of JSON used for this command")
  .option("-r, --raw <raw_json>", "input raw JSON");
program.parse(process.argv);
const options = program.opts();
if (options.input === undefined && options.raw === undefined) {
  const error_response = {
    description:
      "Please provide an input using --input <file_path> or --r <raw_json>",
  };
  console.log(JSON.stringify(error_response, null, 2));
  process.exit();
}
if (options.input != undefined && options.raw != undefined) {
  const error_response = {
    description:
      "Both -i file_path and -r raw_json flags were used, please only use one",
  };
  console.log(JSON.stringify(error_response, null, 2));
  process.exit();
}
let raw_json = {};
let input_data = {};
if (options.input != undefined) {
  try {
    raw_json = await fs.readFileSync(options.input, "utf8");
    console.log(raw_json);
    input_data = JSON.parse(raw_json);
  } catch (error) {
    const error_response = {
      description:
        `The -i input path provided ${options.input} could not be read and parsed as JSON due to error below`,
      error: String(error),
    };
    console.log(error);
    console.log(JSON.stringify(error_response, null, 2));
    process.exit();
  }
}
if (options.raw != undefined) {
  try {
    input_data = JSON.parse(options.raw);
  } catch (error) {
    const error_response = {
      description:
        `The -r raw data could not be read and parsed as JSON due to error below`,
      raw_data: options.raw,
      error: error,
    };
    console.log(JSON.stringify(error_response, null, 2));
    process.exit();
  }
}

// Validate Input from CLI
let input_validation_schema_raw = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Generated schema for Root",
  "type": "object",
  "properties": {
    "nostr_nsec_private_key": {
      "type": "string",
    },
    "app_dir": {
      "type": "string",
    },
    "level_dir": {
      "type": "string",
    },
    "LLM_URL": {
      "type": "string",
    },
  },
  "required": [
    "nostr_nsec_private_key",
    "app_dir",
    "level_dir",
    "LLM_URL",
  ],
};
const ajv = new Ajv();
const input_validation_schema = ajv.compile(input_validation_schema_raw);
try {
  if (input_validation_schema(input_data)) {
    const error_response = {
      status: "success",
    };
    console.log(error_response);
  } else {
    const error_response = {
      status: "error",
      description:
        "That JSON does not match the expected output of the JSONSchema listed in this error",
      JSONSchema: input_validation_schema_raw,
    };
    console.log(error_response);
  }
} catch (error) {
  const error_response = {
    status: "error",
    error: error,
    description:
      "That JSON does not match the expected output of the JSONSchema listed in this error",
    JSONSchema: input_validation_schema_raw,
  };
  console.log(error_response);
}

// Validate nostr_public_key
let nsec = null;
let public_key = null;
try {
  nsec = await nip19.decode(input_data.nostr_nsec_private_key);
  public_key = getPublicKey(nsec.data);
} catch (error) {
  const error_response = {
    status: "error",
    error: error,
    description:
      "nostr_public_key is supposed to be in npub format search 'nostr nip19'",
  };
  console.log(error_response);
}
console.log(`nip19 app key ${nip19.npubEncode(public_key)}`);

async function process_nostr_event(relay, event, public_key) {
  console.log("Running process_nostr_event");

  // Send response to the user saying we recieved the response
  let response_to_user = {
    "status": "success",
    "description": "Running your query on the LLM now",
  };
  let signedEvent = finalizeEvent({
    kind: 1,
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ["e", `${event.id}`],
    ],
    content: JSON.stringify(response_to_user, null, 2),
  }, nsec.data);
  let isGood = verifyEvent(signedEvent);
  console.log("isGood_001");
  console.log(isGood);
  let relay_response = await relay.publish(signedEvent);
  console.log("relay_response_2");
  console.log(relay_response);

  console.log("PAUL_WAS_HERE_123");
  console.log(event.tags);
  console.log(event.tags.length);
  let eventReplyChain = [event];
  let currentEvent = event;
  for (var countEvents = 0; countEvents < 10; countEvents++) {
    console.log(`countEvents=${countEvents}`);
    let endReplySearch = true;
    for (var i = 0; i < currentEvent.tags.length; i++) {
      console.log(i);
      console.log(currentEvent.id)
      console.log(currentEvent.tags[i]);
      if (currentEvent.tags[i][0] == "e") {
        endReplySearch = false;
        console.log("TIME_TO_FETCH_REPLY");
        let eventFilter = { "ids": [currentEvent.tags[i][1]] };
        console.log(eventFilter);
        let fetched_nostr_event = await nostrGet(eventFilter);
        console.log("fetched_nostr_event");
        console.log(fetched_nostr_event);
        currentEvent = fetched_nostr_event;
        eventReplyChain.unshift(fetched_nostr_event);
      }
    }
    if (endReplySearch) {
      countEvents = 10;
    }
  }

  let formatted_api_messages = []
  for(var i = 0; i < eventReplyChain.length; i++){
    formatted_api_messages.push(
        {
            "role": "user",
            "content": eventReplyChain[i].content.replace(
              `nostr:${nip19.npubEncode(public_key)}`,
              "",
            )
        }
    )
  }
  let ollama_JSON = {
    "model": "llama3:8b",
    "stream": false,
    "messages": formatted_api_messages,
  }

  console.log("ollama_JSON")
  console.log(JSON.stringify(ollama_JSON, null, 2))

  // Send the response to the LLM
  let post_data = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ollama_JSON),
  };
  console.log("post_data");
  console.log(post_data);
  const llm_fetch = await fetch(
    input_data.LLM_URL,
    post_data,
  );
  const llm_response = await llm_fetch.json(); // HTML string
  console.log('llm_response')
  console.log(llm_response)
  // TODO check if response if valid respond with error

  // Send response to the user
  // ciphertext = await nip04.encrypt(nsec.data, event.pubkey, llm_response.message.content)
  signedEvent = finalizeEvent({
    kind: 1,
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ["e", `${event.id}`],
    ],
    content: llm_response.message.content,
  }, nsec.data);
  console.log("signedEvent");
  console.log(signedEvent);
  isGood = verifyEvent(signedEvent);
  let final_publish = await relay.publish(signedEvent);
  console.log("relay_response_3");
  console.log(final_publish);
}

// Subscribe to a specific relay
const relay = await Relay.connect(relays[0]);
console.log("public_key");
console.log(public_key);
const sub = relay.subscribe([
  {
    kinds: [1],
    since: Math.floor(new Date() / 1000) - 2000,
    ["#p"]: [public_key],
  },
], {
  onevent(event) {
    console.log("PAUL_WAS_HERE");
    console.log("we got the event we wanted:", event);
    process_nostr_event(relay, event, public_key);
  },
});
