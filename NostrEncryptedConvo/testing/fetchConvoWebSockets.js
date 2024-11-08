import { getPublicKey, nip19, nip04 } from 'nostr-tools'
import { validateWords, privateKeyFromSeedWords } from 'nostr-tools/nip06'
import { SimplePool } from "nostr-tools/pool";
import { bytesToHex } from '@noble/hashes/utils'
import { finalizeEvent, verifyEvent } from 'nostr-tools'

import { LoremIpsum } from "lorem-ipsum";
const lorem = new LoremIpsum({
    sentencesPerParagraph: {
        max: 8,
        min: 4
    },
    wordsPerSentence: {
        max: 16,
        min: 4
    }
});


const mnemonic = "curve foster stay broccoli equal icon bamboo champion casino impact will damp";
let mnemonic_validation = validateWords(mnemonic)
if (!mnemonic_validation) {
    console.log("Invalid Mnemonic")
    process.exit(0);
}
let accounts = []
for (var i = 0; i < 10; i++) {
    let secret_key = privateKeyFromSeedWords(mnemonic, "", i)
    let public_key = getPublicKey(secret_key)
    let uint8_secret_key = new Buffer.from(secret_key, "hex")
    let nsec = nip19.nsecEncode(uint8_secret_key)
    let npub = nip19.npubEncode(public_key)
    accounts.push({
        secret_key: secret_key,
        public_key: public_key,
        nsec: nsec,
        npub: npub
    })
}


let mySettings = {
    relays: [
        "ws://localhost:7007",
        "ws://localhost:7000",
        // "wss://relay.newatlantis.top",
        // "wss://relay.damus.io/"
    ],
    accounts: accounts,
    OPENAI_API_URL: "http://192.168.7.209:11434",
    OPENAI_API_KEY: "NONE"
}

export const nostrGet = async (relays, filter) => {
    const pool = new SimplePool();
    const events = await pool.querySync(relays, filter);
    pool.publi
    console.log("events");
    console.log(events);
    return events;
}

export default async function fetchConvo(settings, myEvent) {
    // Get the account this event was sent to
    let sent_to = ""
    for (var nostr_tag_index = 0; nostr_tag_index < myEvent.tags.length; nostr_tag_index++) {
        if (myEvent.tags[nostr_tag_index][0] == "p") {
            // console.log("SHOULD SET")
            // console.log(myEvent.tags[nostr_tag_index][1])
            sent_to = myEvent.tags[nostr_tag_index][1]
        }
    }
    if (sent_to == "") {
        console.log("Can't find p tag")
        process.error()
    }
    // Find matching account
    let account_sent_to = ""
    for (let account of accounts) {
        if (account.public_key == sent_to) {
            account_sent_to = account
        }
    }



    console.log("account_sent_to")
    console.log(account_sent_to)
    // Setup the filters and get the messages of this conversation


    let filter_from_bot = {
        authors: [account_sent_to.public_key],
        kinds: [4],
        "#p": myEvent.pubkey
    }
    let events_from_bot = await nostrGet(settings.relays, filter_from_bot);

    let filter_from_user = {
        authors: [myEvent.pubkey],
        kinds: [4],
        "#p": account_sent_to.public_key
    }
    let events_from_user = await nostrGet(settings.relays, filter_from_user);
    let all_events = events_from_bot.concat(events_from_user)

    console.log("all_events")
    console.log(all_events.length)
    let decrypted_events = []
    for (let convoEvent of all_events) {
        try {
            // console.log("account_sent_to.secret_key")
            // console.log(account_sent_to.secret_key)
            let decrypted_content = await nip04.decrypt(bytesToHex(account_sent_to.secret_key), convoEvent.pubkey, convoEvent.content)
            convoEvent.decrypted_content = decrypted_content
            decrypted_events.push(convoEvent)
            // console.log("decrypted_content")
            // console.log(decrypted_content)
        } catch (error) {
            convoEvent.decrypted_content = "FAILED"
            decrypted_events.push(convoEvent)
            // console.log("FAILED")
            // console.log()
        }
    }
    decrypted_events.sort((a, b) => a.created_at - b.created_at)
    return decrypted_events
}

async function processEvent(event, settings){
    console.log("Got Event")
    console.log(JSON.stringify(event, null, 2))
    // Get the account this event was sent to
    let sent_to = ""
    for (var nostr_tag_index = 0; nostr_tag_index < event.tags.length; nostr_tag_index++) {
        if (event.tags[nostr_tag_index][0] == "p") {
            // console.log("SHOULD SET")
            // console.log(myEvent.tags[nostr_tag_index][1])
            sent_to = event.tags[nostr_tag_index][1]
        }
    }
    if (sent_to == "") {
        console.log("Can't find p tag")
        // process.error()
    }
    // Find matching account
    let account_sent_to = ""
    for (let account of accounts) {
        if (account.public_key == sent_to) {
            account_sent_to = account
        }
    }
    let convo = await fetchConvo(settings, event)
    console.log("convo")
    console.log(JSON.stringify(convo.slice(-3), null, 2))
    // Respond
    const random_text = lorem.generateParagraphs(3)
    const encrypted_text = await nip04.encrypt(
        bytesToHex(account_sent_to.secret_key),
        event.pubkey,
        "Hello World"
    )
    const myPool = new SimplePool();
    console.log("event.pubkey")
    console.log(event.pubkey)
    const signedEvent = finalizeEvent({
        kind: 4,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
            ["p", event.pubkey]
        ],
        content: encrypted_text,
    }, account_sent_to.secret_key)
    console.log("signedEvent")
    console.log(signedEvent)
    let published_event = await myPool.publish(settings.relays, signedEvent)
    // await new Promise(res => setTimeout(res, 1000));
    console.log(published_event)
    console.log("EVENT_SHOULD_BE_PUBLISHED")
}







export async function runBot(settings) {
    // const pool = new SimplePool()
    // let message_listen_filters = []
    let unix_time = Math.floor((new Date()).getTime() / 1000);
    // for (let account of settings.accounts) {
    //     message_listen_filters.push({
    //         since: unix_time - 60,
    //         kinds: [4],
    //         "#p": account.public_key
    //     })
    // }
    // console.log(message_listen_filters)
    // try {
    //     let h = pool.subscribeMany(
    //         settings.relays,
    //         message_listen_filters,
    //         {
    //             async onevent(event) {
    //                 processEvent(event, settings)
    //             },
    //             // oneose() {
    //             //     h.close()
    //             // }
    //         }
    //     )
    // } catch (error) {
    //     console.log("subscribeMany error")
    //     console.log(error)
    // }

    var ws = new WebSocket("ws://localhost:7007");
    // send a subscription request for text notes from authors with my pubkey
    ws.addEventListener('open', function (event) {
        ws.send('["REQ", "my-sub", {"kinds":[4],"#p":"a582c706dad3a703d6c0211dc25e6bb2cbc9081ced7c2adbab91150b905645a7","since":' + unix_time +'}]');
    });
    // print out all the returned notes
    ws.addEventListener('message', function (event) {
        if (JSON.parse(event.data)[2] != null) {
            let parsed_event = JSON.parse(event.data)[2]
            console.log('Note: ', parsed_event)
            processEvent(parsed_event, settings)
        }
    });
}

console.log(JSON.stringify(accounts, null, 2))
runBot(mySettings)
