/*
Inputs
  * NSEC
  * NPUB
  * NOSTR_RELAYS
*/
import 'dotenv/config'
import fetchNostrConvoAndDecrypt from "./lib/fetchNostrConvoAndDecrypt.js";
import LLMConvo from './llmStuff/LLMConvo.js';
import { nostrGet } from "./lib/nostrGet.js";
import { finalizeEvent, getPublicKey, nip04, nip19 } from "nostr-tools";
import { SimplePool } from "nostr-tools/pool";
import { Relay } from 'nostr-tools/relay'
import NDK from "@nostr-dev-kit/ndk";
import { bytesToHex, hexToBytes } from '@noble/hashes/utils'
import { RetriveThread } from './lib/RetriveThread.js';
import { RemoveNIP19FromContent } from './lib/RemoveNIP19FromContent.js'

let nsec = process.env.NSEC;
if (nsec == "" || nsec == undefined) {
    console.log(
        `You did not set the NSEC environment variable with your nostr key`,
    );
    process.exit();
} else {
    console.log(`\nYour nsec is ${nsec}`);
    console.log(`Your npub is ${nip19.npubEncode(getPublicKey(nip19.decode(nsec).data))}`);
}

let relays = process.env.NOSTR_RELAYS;
if (relays == "" || relays == undefined) {
    console.log(
        `You did not set the NOSTR_RELAYS environment variable, use commas to separate relays from one another, for example`,
    );
    console.log(
        `export NOSTR_RELAYS='wss://relay.newatlantis.top/,wss://nos.lol/' `,
    );
    process.exit();
} else {
    relays = relays.split(",");
    console.log(`\nYour relay list is`);
    console.log(relays);
}

let nip_65_relays = process.env.NIP_65_NOSTR_RELAYS
if (nip_65_relays == "" || nip_65_relays == undefined) {
    console.log(
        `You did not set the NIP_65_NOSTR_RELAYS environment variable a list of nostr relay websocket URL's with commas to separate them`
    );
    process.exit();
} else {
    nip_65_relays = nip_65_relays.split(",")
    console.log(`\nYour nip_65_relays is ${nip_65_relays}`);
}

let relays_to_store_dms = process.env.RELAYS_TO_STORE_DMS
if (relays_to_store_dms == "" || relays_to_store_dms == undefined) {
    console.log(
        `You did not set the RELAYS_TO_STORE_DMS environment variable a list of nostr relay websocket URL's with commas to separate them`,
    );
    process.exit();
} else {
    relays_to_store_dms = relays_to_store_dms.split(",")
    console.log(`\nYour nip_65_relays is ${relays_to_store_dms}`);
}

async function check_NIP65_published(nip_65_relays, nsec, relays_to_store_dms) {
    let nostr_filter = {
        kinds: [10002],
        authors: [getPublicKey(nip19.decode(nsec).data)], // Yea I know this is dangerous
    };
    let events = await nostrGet(nip_65_relays, nostr_filter);
    if (events.length == 0) {
        let relay_event_tags = []
        for (const relay_url of relays_to_store_dms) {
            relay_event_tags.push(["r", relay_url])
        }
        const signedEvent = finalizeEvent({
            kind: 10002,
            created_at: Math.floor(Date.now() / 1000),
            tags: relay_event_tags,
            content: "",
        }, nip19.decode(nsec).data)
        for (const relay_url of relays) {
            try {
                const relay = await Relay.connect(relay_url)
                await relay.publish(signedEvent);
                console.log(`Published Event to ${relay_url} success`);
            } catch (error) {
                console.log(`Published Event to ${relay_url} failure`);
                console.log(`    ${error}`)
            }
        }
    } else {
        console
        console.log(`We found your npub= ${nip19.npubEncode(getPublicKey(nip19.decode(process.env.NSEC).data))} already published on some of the relays you listed`)
    }
}

async function respond_to_thread(relays, nsec, nip_65_relays, event_id) {
    let convo = await RetriveThread(relays, event_id)
    for(let convo_item of convo){
        convo_item.decrypted_content = RemoveNIP19FromContent(convo_item.content)
    }
    console.log(convo)
    let llm_response = await LLMConvo(convo, nsec)

    // Get the users's NIP65 relays we need to send the response to
    // let nostr_filter = {
    //     kinds: [10002],
    //     authors: [nip19.decode(npub).data],
    // };
    // let events = await nostrGet(nip_65_relays, nostr_filter)
    // console.log(events)
    // let user_nip65_relays = []
    // if (events.length == 0) {
    //     console.log("\nThis filter returned nothing")
    //     console.log(JSON.stringify(nostr_filter, null, 2))
    //     console.log("")
    //     return
    // }
    // for (const tag of events[0].tags) {
    //     console.log("tag")
    //     console.log(tag)
    //     if (tag[0] == "r" && tag[1] != undefined) {
    //         user_nip65_relays.push(tag[1])
    //     }
    // }
    // if (user_nip65_relays.length == 0) {
    //     user_nip65_relays = nip_65_relays
    // }


    // We need to generate all the tags
    // We need the root tag

    // We need the response tag


    // Create a new message with the response
    const myPool = new SimplePool()
    // We need to get all the e and p tags
    var signedEvent = finalizeEvent({
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
            ["p", convo[0].pubkey],
            ["e", convo[0].id, "", "root"],
            ["e", convo[convo.length - 1].id, "", "reply"]
        ],
        content: llm_response,
    }, nip19.decode(nsec).data);
    // console.log("user_nip65_relays")
    // console.log(user_nip65_relays)
    console.log("signed_event")
    console.log(signedEvent)

    // Send message to the users relays
    // user_nip65_relays should be used below #TODO
    await myPool.publish(relays, signedEvent);

    console.log("We should have replied")
}


const ndk = new NDK({
    explicitRelayUrls: relays_to_store_dms,
});

await ndk.connect();

let unix_time = Math.floor((new Date()).getTime() / 1000);
let filter = {
    "kinds": [1],
    "#p": getPublicKey(nip19.decode(nsec).data),
    "since": unix_time - 10
}
console.log(JSON.stringify(filter, null, 2))
let sub = await ndk.subscribe(filter);
sub.on("event", async (event) => {
    console.log("Recieved and event")
    console.log(`content           = ${event.content}`)
    console.log(`tags              = ${event.tags}`)
    console.log(`id                = ${event.id}`)
    console.log(`kind              = ${event.kind}`)
    console.log(`created_at        = ${event.created_at}`)
    console.log(`pubkey            = ${event.pubkey}`)
    let raw_event = {
        content: event.content,
        tags: event.tags,
        id: event.id,
        kind: event.king,
        created_at: event.created_at,
        pubkey: event.pubkey
    }
    console.log(JSON.stringify(raw_event, null, 2))
    console.log("")
    console.log("PAUL_WAS_HERE")
    console.log(getPublicKey(nip19.decode(nsec).data))
    console.log(event.pubkey)
    if( getPublicKey(nip19.decode(nsec).data) != event.pubkey) {
        respond_to_thread(relays, nsec, nip_65_relays, raw_event.id)
    }
})
