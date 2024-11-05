

``` bash

curl http://192.168.7.209:11434/api/chat -d '{
  "model": "llama3.2",
  "messages": [
    {
      "role": "user",
      "content": "What is the weather today in Paris?"
    }
  ],
  "stream": false,
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "get_current_weather",
        "description": "Get the current weather for a location",
        "parameters": {
          "type": "object",
          "properties": {
            "location": {
              "type": "string",
              "description": "The location to get the weather for, e.g. San Francisco, CA"
            },
            "format": {
              "type": "string",
              "description": "The format to return the weather in, e.g. 'celsius' or 'fahrenheit'",
              "enum": ["celsius", "fahrenheit"]
            }
          },
          "required": ["location", "format"]
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
      "role": "user",
      "content": "Can you ask me at 9am tomorrow, What did you eat for breakfast?"
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
        "name": "get_current_weather",
        "description": "Get the current weather for a location",
        "parameters": {
          "type": "object",
          "properties": {
            "location": {
              "type": "string",
              "description": "The location to get the weather for, e.g. San Francisco, CA"
            },
            "format": {
              "type": "string",
              "description": "The format to return the weather in, e.g. 'celsius' or 'fahrenheit'",
              "enum": [
                "celsius",
                "fahrenheit"
              ]
            }
          },
          "required": [
            "location",
            "format"
          ]
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
      "role": "user",
      "content": "How hot is it in Toronto in fahrenheit?"
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
        "name": "get_current_weather",
        "description": "Get the current weather for a location",
        "parameters": {
          "type": "object",
          "properties": {
            "location": {
              "type": "string",
              "description": "The location to get the weather for, e.g. San Francisco, CA"
            },
            "format": {
              "type": "string",
              "description": "The format to return the weather in, e.g. 'celsius' or 'fahrenheit' ",
              "enum": [
                "celsius",
                "fahrenheit"
              ]
            }
          },
          "required": [
            "location",
            "format"
          ]
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
      "role": "user",
      "content": "Help"
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
        "description": "When user asks for help or bot description",
        "parameters": {
          "type": "object"
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
      "role": "user",
      "content": "What do you do?"
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
        "parameters": {}
      }
    }
  ]
}' | jq


```