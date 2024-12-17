#### Testing LLM Connection

``` bash
export BASE_URL='https://ai.newatlantis.top'
export OPENAI_API_KEY="sk-ENTROPY"

curl -H "Authorization: Bearer $OPENAI_API_KEY" $BASE_URL/api/models

curl -X POST $BASE_URL/api/chat/completions \
-H "Authorization: Bearer $OPENAI_API_KEY" \
-H "Content-Type: application/json" \
-d '{
      "model": "llama3.2",
      "messages": [
        {
          "role": "user",
          "content": "Why is the sky blue?"
        }
      ]
}' | jq

```

#### llm-dm-bot

``` bash

deno -A cli.js help llm-dm-bot

source <(deno -A cli.js generate-accounts-env -m 'soap vault ahead turkey runway erosion february snow modify copy nephew rude')

export NIP_65_RELAYS='ws://127.0.0.1:7007'
export RELAYS='ws://127.0.0.1:7007,wss://relay.newatlantis.top'


export BASE_URL='https://ai.newatlantis.top/api'
export OPENAI_API_KEY="sk-ENTROPY"
export BASE_URL='http://127.0.0.1:11434'

deno -A cli.js llm-dm-bot --nsec $NSEC0 --nip_65_relays $NIP_65_RELAYS -rdm $RELAYS --BASE_URL $BASE_URL --OPENAI_API_KEY $OPENAI_API_KEY

```

#### llm-thread-bot

``` bash

deno -A cli.js help llm-dm-bot

source <(deno -A cli.js generate-accounts-env -m 'soap vault ahead turkey runway erosion february snow modify copy nephew rude')

export NIP_65_RELAYS='ws://127.0.0.1:7007'
export RELAYS='ws://127.0.0.1:7007,wss://relay.newatlantis.top'


export BASE_URL='https://ai.newatlantis.top/api'
export OPENAI_API_KEY="sk-ENTROPY"
export BASE_URL='http://127.0.0.1:11434'

deno -A cli.js llm-thread-bot --nsec $NSEC0 -r $RELAYS --BASE_URL $BASE_URL --OPENAI_API_KEY $OPENAI_API_KEY

```