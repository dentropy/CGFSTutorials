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