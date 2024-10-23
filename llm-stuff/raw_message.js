const user_message = `Tomorrow at 4:30 PM`

const now = new Date();
const system_prompt_001 = `
The current_datetime is ${now.toISOString()}
`

const response = await fetch("http://192.168.7.209:11434/api/chat", {
    method: "POST",
    body: JSON.stringify({
        "model": "llama3.2",
        "messages": [
            {
                "role": "system",
                "content": system_prompt_001
            },
            {
                "role": "user",
                "content": `The current_datetime is ${now.toISOString()}
            Below is the users's message, convert it to a contab string,
            ${user_message}`
            }
        ],
        "stream": false,
        "tools": [
            {
                "type": "function",
                "function": {
                    "name": "string_datetime_to_cron_datetime",
                    "description": "Convert this datetime description to crontab string",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "cron_datetime": {
                                "type": "string",
                                "description": "contab string"
                            }
                        },
                        "required": ["cron_datetime"]
                    }
                }
            }
        ]
    }),
    headers: { "Content-Type": "application/json" },
});


const body = await response.json();

console.log(JSON.stringify(body, null, 2))