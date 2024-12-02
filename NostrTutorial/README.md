

#### Accounts Commands

``` bash

deno -A cli.js generate-mnemonic

export MNEMONIC=$(deno -A cli.js generate-mnemonic)
echo $MNEMONIC

deno -A cli.js generate-accounts-json

deno -A cli.js generate-accounts-json -m 'soap vault ahead turkey runway erosion february snow modify copy nephew rude'

deno -A cli.js generate-accounts-env

deno -A cli.js generate-accounts-env -m 'soap vault ahead turkey runway erosion february snow modify copy nephew rude'

# Reminder of how ENV variables work
export MNEMONIC='soap vault ahead turkey runway erosion february snow modify copy nephew rude'
echo $MNEMONIC
source <(deno -A cli.js generate-accounts-env)

source <(deno -A cli.js generate-accounts-env -m 'soap vault ahead turkey runway erosion february snow modify copy nephew rude')

echo $MNEMONIC
echo $NSEC10
echo $NPUB10

```

#### Nosdump SQL Example

``` bash

nosdump -k 0 wss://relay.damus.io > event0.jsonl

# Look inside the file
head event0.jsonl
tail event0.jsonl

# Could number of lines
wc -l event0.jsonl

deno -A cli.js load-nosdump-into-sqlite -f event0.jsonl -db ./db.sqlite

deno -A cli.js sql-query -db ./db.sqlite -sql 'SELECT COUNT(*) FROM events;'

```

#### get-encrypted-convo

``` bash

export EVENT_ID='26c3112f0214f80d69ce605491e018164260eba94081acaece1058febda869f7'
export RELAYS='wss://relay.damus.io/,wss://nos.lol/,wss://nostr.wine,relay.primal.net'

deno -A cli.js get-thread-events --event_id $EVENT_ID --relays $RELAYS

```