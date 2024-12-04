# Getting Started with Nostr

#### Clients

- [Primal](https://primal.net/home)
- [noStrudel](https://nostrudel.ninja/)
- [Feeds](https://coracle.social/notes)
- [Nostr Apps](https://nostrapps.com/)
- [Article on Nostr Apps](https://nostrudel.ninja/#/articles/naddr1qvzqqqr4gupzq3svyhng9ld8sv44950j957j9vchdktj7cxumsep9mvvjthc2pjuqy88wumn8ghj7mn0wvhxcmmv9uq3wamnwvaz7tmkd96x7u3wdehhxarjxyhxxmmd9uqq6vfhxgurgwpcxumnjd34xv4h36kx)

#### Tooling

- [Filter Console](https://nostrudel.ninja/#/tools/console)
- [Nostr Profile and Relay Manager](https://metadata.nostr.com/)
- [NIP19 Nostr Army Knife](https://nak.nostr.com/)


- [Get NIP-05 verified](https://nostr-how.vercel.app/en/guides/get-verified)
- [Nostr Connect - Chrome Web Store](https://chromewebstore.google.com/detail/nostr-connect/ampjiinddmggbhpebhaegmjkbbeofoaj?hl=en%2C)
- [Nostr Profile Manager](https://metadata.nostr.com/#)
- [CodyTseng/nostr-relay-tray: a nostr relay for desktop](https://github.com/CodyTseng/nostr-relay-tray)
- [awesome-nostr | nostr.net - awesome-nostr is a collection of projects and resources built on nostr to help developers and users find new things](https://nostr.net/)

#### Example Events

* [Example Event](https://coracle.social/notes/nevent1qy2hwumn8ghj7un9d3shjtnyv9kh2uewd9hj7qg3waehxw309ahx7um5wgh8w6twv5hsz9nhwden5te0wfjkccte9ekk7um5wgh8qatz9uqsuamnwvaz7tmwdaejumr0dshsz9mhwden5te0wfjkccte9ec8y6tdv9kzumn9wshsqgpxcvgj7qs5lqxknnnq2jg7qxqkgfswh22qsxk2ansstrltm2rf7uj0yfrd)
* [Article on Nostr Apps](https://nostrudel.ninja/#/articles/naddr1qvzqqqr4gupzq3svyhng9ld8sv44950j957j9vchdktj7cxumsep9mvvjthc2pjuqy88wumn8ghj7mn0wvhxcmmv9uq3wamnwvaz7tmkd96x7u3wdehhxarjxyhxxmmd9uqq6vfhxgurgwpcxumnjd34xv4h36kx)

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

Now check out [nosdump sql queries](./docs/nodsump.md)

#### send-event

``` bash

source <(deno -A cli.js generate-accounts-env -m 'soap vault ahead turkey runway erosion february snow modify copy nephew rude')

export RELAYS='ws://127.0.0.1:7007'
export RELAYS='wss://relay.newatlantis.top'
echo $RELAYS

deno -A cli.js send-event -nsec $NSEC0 -f './event-data.json' --relays $RELAYS

```

#### get-encrypted-convo

**Generate an Encrypted Conversation**
``` bash

source <(deno -A cli.js generate-accounts-env -m 'soap vault ahead turkey runway erosion february snow modify copy nephew rude')

echo $NSEC0
echo $NSEC1

export RELAYS='ws://127.0.0.1:7007'
export RELAYS='wss://relay.newatlantis.top'
echo $RELAYS

deno -A cli.js gen-fake-dm-convo -from $NSEC0 -to $NSEC1 --relays $RELAYS

```

**Decrypt the Conversation**
``` bash

source <(deno -A cli.js generate-accounts-env -m 'soap vault ahead turkey runway erosion february snow modify copy nephew rude')

echo $NSEC0
echo $NSEC1

export RELAYS='ws://127.0.0.1:7007'
export RELAYS='wss://relay.newatlantis.top'
echo $RELAYS

deno -A cli.js get-encrypted-convo -from $NSEC1 -to $NPUB0 --relays $RELAYS

```

#### send-event

``` bash


```

#### fake-thread

``` bash

source <(deno -A cli.js generate-accounts-env -m 'soap vault ahead turkey runway erosion february snow modify copy nephew rude')

echo $NSEC0
echo $NSEC1

export RELAYS='ws://127.0.0.1:7007'
export RELAYS='wss://relay.newatlantis.top'
echo $RELAYS

deno -A cli.js fake-thread -nsec0 $NSEC0 -nsec1 $NSEC1 -nsec2 $NPUB0 --relays $RELAYS


```
#### get-thread-events

**NOT IMPLIMENTED YET**
``` bash

export EVENT_ID='ee54d3d5ed8f9b02c1fc210a6244f7a17f72c443a582e75cd229eed2ed89a09b'
export RELAYS='ws://127.0.0.1:7007'

export RELAYS='wss://relay.damus.io/,wss://nos.lol/,wss://nostr.wine,relay.primal.net'

deno -A cli.js get-thread-events --event_id $EVENT_ID --relays "$RELAYS"



nosdump $RELAYS
nosdump -e '04429d6207af389fba1f0da8ebcaabc963a157a3d77a871ef1b17891185ecb23' $RELAYS


cd NostrTutorials
cd lib
deno repl --allow-all --eval-file='./retriveThread.js' 


```

``` js

let thread = await RetriveThread(process.env.RELAYS.split(','), process.env.EVENT_ID)

Object.keys(thread)
Object.keys(thread.events_by_id)
Object.keys(thread.root_event)
console.log(thread.root_event.replies)
Object.keys(thread.root_event.replies)

for(const event_id of Object.keys(thread.events_by_id)){
    console.log(thread.events_by_id[event_id].event_data.id)
    console.log(thread.events_by_id[event_id].depth_index)
}

thread.events_by_id['ee54d3d5ed8f9b02c1fc210a6244f7a17f72c443a582e75cd229eed2ed89a09b']
thread.events_by_id['61d36ac51a3f32d6c2dba9937a37a6bb7dfc9733c264c106e6606c3980dd9f72']
thread.events_by_id['36b7afd5a9dabefe16ca509728d3c70f99d38c24bef7ee8d36ae454e13cb71f3']
thread.events_by_id['ead28b10273eab94bc4e39f87a730f3c6efcfd24c77f0fe3ae337ba9842bc223']

```