



``` bash

curl http://192.168.7.209:11434/api/chat -d '{
  "model": "llama3.2",
  "messages": [
    {
      "role": "user",
      "content": "Can you ask me\nWhat did you eat?\nAt 9am tomorrow"
    }
  ],
  "stream": false,
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "ai_taskmaster_timed_prompt",
        "description": "Get question and datetime user wants to be asked",
        "parameters": {
          "type": "object",
          "properties": {
            "datetime": {
              "type": "string",
              "description": "The time the time and date the user mentioned in their message"
            },
            "question": {
              "type": "string",
              "description": "The question the user wants to be asked"
            }
          },
          "required": ["datetime", "question"]
        }
      }
    },
    {
        "function": {
        "name": "provide_user_bot_instructions",
        "description": "When user asks for help or what do you do",
        "parameters": {
        "description": "The question the user wants to be asked"}
      }
    }
  ]
}' | jq


```




``` bash
curl http://192.168.7.209:11434/api/chat -d '{
  "model": "llama3.2",
  "messages": [
    {
      "role": "user",
      "content": "Please read the following message and rewrite is in cron format"
    },
    {
      "role": "user",
      "content": "tomorrow at 9am"
    }
  ],
  "stream": false
}' | jq
```


``` bash

curl http://192.168.7.209:11434/api/chat -d '{
  "model": "llama3.2",
  "messages": [
    {
      "role": "user",
      "content": "The current_datetime is $BLANK, please take the following message and within the context of current_datetime please generate a cron job"
    },
    {
      "role": "user",
      "content": "tomorrow at 9am"
    }
  ],
  "stream": false,
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "string_datetime_to_cron_datetime",
        "description": "Convert this datetime description to cron format, please validate it should work",
        "parameters": {
          "type": "object",
          "properties": {
            "cron_datetime": {
              "type": "string",
              "description": "Extract the cron datetime to be put into crontab, please validate it should work"
            }
          },
          "required": ["cron_datetime"]
        }
      }
    }
  ]
}' | jq


```


``` bash


curl http://192.168.7.209:11434/api/chat -d '{
  "model": "llama3.2",
  "messages": [
    {
      "role": "system",
      "content": ""    
    }
    {
      "role": "user",
      "content": "The current_datetime is Wed Oct 23 02:52:26 AM EDT 2024\nplease take the following message and within the context of current_datetime please generate a cron job\nREMINDER a cron job consists of numbers and asterisks (*) representing any valid time\nREMINDER there are only 5 numbers and asterisks in a crontab"
    },
    {
      "role": "user",
      "content": "tomorrow at 9am"
    }
  ],
  "stream": false,
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "string_datetime_to_cron_datetime",
        "description": "Convert this datetime description to cron format, please validate it should work",
        "parameters": {
          "type": "object",
          "properties": {
            "cron_datetime": {
              "type": "string",
              "description": "Extract the cron datetime to be put into crontab, please validate it should work"
            }
          },
          "required": ["cron_datetime"]
        }
      }
    }
  ]
}' | jq

```