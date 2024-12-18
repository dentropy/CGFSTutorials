# Getting Started with Nostr

#### Getting Started Links

- [Nostr Connect - Chrome Web Store](https://chromewebstore.google.com/detail/nostr-connect/ampjiinddmggbhpebhaegmjkbbeofoaj?hl=en%2C)
- [Nostr Connect – Get this Extension for 🦊 Firefox (en-US)](https://addons.mozilla.org/en-US/firefox/addon/nostr-connect/)
- [Nostr Profile Manager](https://metadata.nostr.com/#)

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
- [CodyTseng/nostr-relay-tray: a nostr relay for desktop](https://github.com/CodyTseng/nostr-relay-tray)
- [awesome-nostr](https://nostr.net/)

#### Example Events

* [Example Event](https://coracle.social/notes/nevent1qy2hwumn8ghj7un9d3shjtnyv9kh2uewd9hj7qg3waehxw309ahx7um5wgh8w6twv5hsz9nhwden5te0wfjkccte9ekk7um5wgh8qatz9uqsuamnwvaz7tmwdaejumr0dshsz9mhwden5te0wfjkccte9ec8y6tdv9kzumn9wshsqgpxcvgj7qs5lqxknnnq2jg7qxqkgfswh22qsxk2ansstrltm2rf7uj0yfrd)
* [Article on Nostr Apps](https://nostrudel.ninja/#/articles/naddr1qvzqqqr4gupzq3svyhng9ld8sv44950j957j9vchdktj7cxumsep9mvvjthc2pjuqy88wumn8ghj7mn0wvhxcmmv9uq3wamnwvaz7tmkd96x7u3wdehhxarjxyhxxmmd9uqq6vfhxgurgwpcxumnjd34xv4h36kx)

#### Sections

* [Generate Accounts](./docs/GenerateAccounts.md)
* [Scrape Nostr Using Nosdump](./docs/nodsump.md)
  * [Index using postgres](./docs/postgres.md)
  * [Index using sqlite](./docs/sqlite.md)
* [Encrypted Direct Messages](./docs/EncryptedDirectMessages.md)
* [Thead Functions](./docs/ThreadFunctions.md)
* [Publish wiki from dentropys-obsidian-publisher](./docs/PublishWiki.md)
* [Bots on Nostr](./docs/Bots.md)

## Basics

#### send-event

``` bash

source <(deno -A cli.js generate-accounts-env -m 'soap vault ahead turkey runway erosion february snow modify copy nephew rude')

export RELAYS='ws://127.0.0.1:7007'
export RELAYS='wss://relay.newatlantis.top'
echo $RELAYS

deno -A cli.js send-event -nsec $NSEC0 -f './event-data.json' --relays $RELAYS

```
