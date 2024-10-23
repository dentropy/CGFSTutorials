const user_message = `Tomorrow at 4:30 PM`

const now = new Date();
console.log(now.toISOString())
const response = await fetch("http://192.168.7.209:11434/api/chat", {
    method: "POST",
    body: JSON.stringify({
        "model": "llama3.2",
        "messages": [
          {
            "role": "system",
            "content": `The Current Date is ${now.toISOString()}`
          },
          {
            "role": "user",
            "content": user_message
          }
        ],
        "stream": false,
        "tools": [
          {
            "type": "function",
            "function": {
              "name": "string_datetime_to_cron_datetime",
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
          }
        ]
      }),
    headers: { "Content-Type": "application/json" },
  });


const body = await response.json();
  
console.log(JSON.stringify(body, null, 2))