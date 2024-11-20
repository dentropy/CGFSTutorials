// Set ollama_url so everything works
const ollama_url = process.env.OLLAMA_URL || "http://192.168.7.209:11434"

// Test User Message
const test_user_message = `Ask me at 9am tomorrow what I ate for breakfast`

// Variables we will extract at end
let user_question = null
let string_date_specified = null
let iso_date_specified = null
let date_specified = null
let time_specified = null
let cron_string = null

// Describe bot instructions that are relayed to user when they ask what bot do?
const bot_instructions = "You can ask this bot to ask you a specific question at a specific time and it will message you via Nostr"

// Inital Tools to tell if user wants to know what bot does or actually tries using the bot
const tool_help_or_bot_activate = [
    {
        "type": "function",
        "function": {
            "name": "bot_activate",
            "description": "If the user asks for a question to be asked a specific time use this tool",
            "parameters": {
                "type": "object",
                "properties": {
                    "bot_activate": {
                        "type": "string",
                        "description": "respond true"
                    }
                },
                "required": ["bot_activate"]
            }
        }
    },
    {
        "function": {
            "name": "provide_user_bot_instructions",
            "description": "When user asks for help or what do you do",
            "parameters": {
                "properties": {
                    "bot_instructions": {
                        "type": "string",
                        "description": "Respond with true when user asks for help or instructions or what do"
                    }
                },
                "required": ["bot_instructions"]
            }
        }
    }
]

const tool_extract_question = [
    {
        "function": {
            "name": "extract_question",
            "description": "Extract the question the user wants to be asked",
            "parameters": {
                "properties": {
                    "user_question": {
                        "type": "string",
                        "description": "The question the user wants to be asked"
                    }
                },
                "required": ["user_question"]
            }
        }
    }
]

const tool_extract_time = [
    {
        "function": {
            "name": "extract time",
            "description": "Extract time time of day as a ISO string",
            "parameters": {
                "properties": {
                    "time": {
                        "type": "string",
                        "description": "Time as ISO string"
                    }
                },
                "required": ["time"]
            }
        }
    }
]

const tool_extract_date = [
    {
        "function": {
            "name": "extract_date",
            "description": "Extract the date described and convert to ISO format",
            "parameters": {
                "properties": {
                    "date": {
                        "type": "string",
                        "description": "The date described in ISO format"
                    }
                },
                "required": ["date"]
            }
        }
    }
]

const extract_date_and_time = [{
    "type": "function",
    "function": {
        "name": "extract_date_and_time",
        "description": "Extract date and time separately",
        "parameters": {
            "type": "object",
            "properties": {
                "date": {
                    "type": "string",
                    "description": "date in ISO format"
                },
                "time": {
                    "type": "string",
                    "description": "time in ISO format"
                }
            },
            "required": ["date", "time"]
        }
    }
}]

const convert_string_date_to_iso_date = [{
    "type": "function",
    "function": {
        "name": "convert_string_date_to_iso_date",
        "description": "Describe time in ISO format",
        "parameters": {
            "type": "object",
            "properties": {
                "date": {
                    "type": "string",
                    "description": "date in ISO format"
                }
            },
            "required": ["date", "time"]
        }
    }
}]

// Example of user asking for Help to learn what bot does
console.log("\n\nSTEP: Ask bot for help")
const response_001 = await fetch(`${ollama_url}/api/chat`, {
    method: "POST",
    body: JSON.stringify({
        "model": "llama3.2",
        "messages": [
            {
                "role": "user",
                "content": "What do you do?"
                // "content": "Ask me at 9am tomorrow what I ate for breakfast"
            }
        ],
        "stream": false,
        "tools": tool_help_or_bot_activate
    }),
    headers: { "Content-Type": "application/json" },
});
const response_001_body = await response_001.json();
// console.log(JSON.stringify(response_001_body, null, 2))
// #TODO do better testing and validation of tool function call
if (response_001_body.message.tool_calls[0].function.name == "provide_user_bot_instructions") {
    console.log("bot_instructions activated correctly")
    console.log(bot_instructions)
} else {
    console.error("ERROR, provide_user_bot_instructions is supposed to activate here")
}

// User describes question and datetime they want to be asked said question
console.log("\n\nSTEP: Activate Langchain")
const response_002 = await fetch(`${ollama_url}/api/chat`, {
    method: "POST",
    body: JSON.stringify({
        "model": "llama3.2",
        "messages": [
            {
                "role": "user",
                "content": test_user_message
            }
        ],
        "stream": false,
        "tools": tool_help_or_bot_activate
    }),
    headers: { "Content-Type": "application/json" },
});
const response_002_body = await response_002.json();
// console.log(JSON.stringify(response_002_body, null, 2))
if (response_002_body.message.tool_calls[0].function.name == "bot_activate") {
    console.log("bot_activate activated correctly")
    console.log(response_002_body.message.tool_calls[0].function)
} else {
    console.log()
}


// Extract Question
console.log("\n\nSTEP: Extract Question")
const response_003 = await fetch(`${ollama_url}/api/chat`, {
    method: "POST",
    body: JSON.stringify({
        "model": "llama3.2",
        "messages": [
            {
                "role": "user",
                "content": test_user_message
            }
        ],
        "stream": false,
        "tools": tool_extract_question
    }),
    headers: { "Content-Type": "application/json" },
});
const response_003_body = await response_003.json();
// console.log(JSON.stringify(response_002_body, null, 2))
if (response_003_body.message.tool_calls[0].function.name == "extract_question") {
    console.log("extract_question activated correctly")
    user_question = response_003_body.message.tool_calls[0].function.arguments.user_question
    console.log(`user_question="${user_question}"`)
} else {
    console.log()
}

// Extract date and time
console.log("\n\nSTEP: Extract Date and Time")
const response_004 = await fetch(`${ollama_url}/api/chat`, {
    method: "POST",
    body: JSON.stringify({
        "model": "llama3.2",
        "messages": [
            {
                "role": "user",
                "content": test_user_message
            }
        ],
        "stream": false,
        "tools": extract_date_and_time
    }),
    headers: { "Content-Type": "application/json" },
});
const response_004_body = await response_004.json();
// console.log(JSON.stringify(response_004_body, null, 2))
if (response_004_body.message.tool_calls[0].function.name == "extract_date_and_time") {
    console.log("extract_question activated correctly")
    time_specified = response_004_body.message.tool_calls[0].function.arguments.time
    string_date_specified = response_004_body.message.tool_calls[0].function.arguments.date
    console.log(`time_specified=${time_specified}`)
    console.log(`string_date_specified=${string_date_specified}`)
} else {
    console.log()
}

// Convert string_date to iso_date
console.log("\n\nSTEP: Convert date to ISO format")
const response_004_1 = await fetch(`${ollama_url}/api/chat`, {
    method: "POST",
    body: JSON.stringify({
        "model": "llama3.2",
        "messages": [
            {
                "role": "system",
                "content": "Take the system date and User Described date and describe the date in ISO format"
            },
            {
                "role": "user",
                "content": `Current System Datetime: ${new Date().toDateString()}\nUser Described Time: ${string_date_specified}`
            }
        ],
        "stream": false,
        "tools": convert_string_date_to_iso_date
    }),
    headers: { "Content-Type": "application/json" },
});
const response_004_1_body = await response_004_1.json();
// console.log(JSON.stringify(response_004_body, null, 2))
if (response_004_1_body.message.tool_calls[0].function.name == "convert_string_date_to_iso_date") {
    console.log("extract_question activated correctly")
    iso_date_specified = response_004_1_body.message.tool_calls[0].function.arguments.date
    console.log(`iso_date_specified=${iso_date_specified}`)
} else {
    console.log()
}

// Generate cron from datetime
let system_prompt = `You are a system that takes in three inputs and produces one output, the inputs you take Current System Datetime, User Provided Time, and User Provided Date. It is your job to produce a valid crontab given these inputs and produce a crontab string`

const now = new Date();
console.log(new Date().toISOString())
const response_005 = await fetch(`${ollama_url}/api/chat`, {
    method: "POST",
    body: JSON.stringify({
        "model": "llama3.2",
        "messages": [
          {
            "role" : "system",
            "content": system_prompt
          },
          {
            "role": "user",
            "content": `Current System Datetime: ${new Date().toISOString()}\nUser Provided Time(ISO Format): ${time_specified}\nUser Provided Date(ISO Format): ${string_date_specified}`
          }
        ],
        "stream": false,
        "tools": [
          {
            "type": "function",
            "function": {
              "name": "date_and_time_to_cron",
              "description": "Take provided time and provided date and generate crontab string",
              "parameters": {
                "type": "object",
                "properties": {
                  "crontab": {
                    "type": "string",
                    "description": "Crontab string"
                  }
                },
                "required": ["crontab"]
              }
            }
          }
        ]
      }),
    headers: { "Content-Type": "application/json" },
  });
const response_005_body = await response_005.json();
console.log(JSON.stringify(response_005_body, null, 2))
if (response_005_body.message.tool_calls[0].function.name == "date_and_time_to_cron") {
    console.log("extract_question activated correctly")
    cron_string = response_005_body.message.tool_calls[0].function.arguments.crontab
    console.log(`cron_string=${cron_string}`)
} else {
    console.log()
}

// Create cronjob with nostr script or something like that

console.log({
    user_question: user_question,
    string_date_specified: string_date_specified,
    time_specified: time_specified,
    iso_date_specified: iso_date_specified,
    cron_string: cron_string
})