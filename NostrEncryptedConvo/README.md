# Nostr Encrypted Convo Tutorial

``` bash

bun AccountsLoad.js > .env

source <(bun AccountsLoad.js)

echo $NSEC1
echo $NPUB1
echo $NOSTR_RELAYS
echo $MNEMONIC

# Optioanl
export NOSTR_RELAYS='wss://relay.newatlantis.top'

bun run GetAndDecryptMessages.js

bun run FakeConvo.js

bun run GetAndDecryptMessages.js

```

#### Nip 65 Stuff

``` bash

bun NIP65Get.js

bun NIP65Publish.js

```

#### LLM Ai Conversations via DM

``` bash

bun DMLLMResponse.js

```


#### Relay to add in Nostrudel

``` bash

wss://relay.newatlantis.top

```


#### LLM Bot Env Variables


``` bash
# Make sure you generated the .env file using `bun AccountsLoad.js > .env`
source .env # THIS IS IMPORTANT REMEMBER TO RUN IT

# For OpenAI 
export BASE_URL='https://api.openai.com/'
export OPENAI_API_KEY='sk-ENTROPY'

# For Ollama running locally
export BASE_URL='http://localhost:11434/'
export OPENAI_API_KEY='sk-ENTROPY'


export NIP_65_NOSTR_RELAYS='wss://relay.newatlantis.top/,wss://nos.lol/,wss://nostr.land/,wss://nostr.wine/,wss://purplerelay.com/,wss://relay.damus.io/,wss://relay.snort.social/'
export RELAYS_TO_STORE_DMS='wss://relay.newatlantis.top/'
export NSEC=$NSEC0

```

#### Sending a Message

``` bash

source .env
export NSEC=$NSEC9
export NOSTR_MESSAGE="Hello World"
export NPUB=npub1jvuhj7fheaf9fu05x99d3t8l3tcqlxxzwkraqa6szh4tt66w9t8q7guhu4
export NOSTR_RELAYS='wss://relay.newatlantis.top/'

bun run SendEncryptedMessage.js

```