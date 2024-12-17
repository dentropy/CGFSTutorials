/*
Inputs
  * NSEC
  * NPUB
  * NOSTR_RELAYS
*/
import 'dotenv/config'
import { getNostrConvoAndDecrypt } from "./getNostrConvoAndDecrypt.js";
import LLMConvo from './llmStuff/LLMConvo.js';
import { nostrGet } from "./nostrGet.js";
import { finalizeEvent, getPublicKey, nip04, nip19 } from "nostr-tools";
import { SimplePool } from "nostr-tools/pool";
import { Relay } from 'nostr-tools/relay'
import NDK from "@nostr-dev-kit/ndk";
import { bytesToHex, hexToBytes } from '@noble/hashes/utils'
import { RetriveThread } from './RetriveThread.js';
import { RemoveNIP19FromContent } from './RemoveNIP19FromContent.js'

export async function llm_respond_to_thread(relays, nsec, event_id, BASE_URL, OPENAI_API_KEY) {
    let convo = await RetriveThread(relays, event_id)
    for(let convo_item of convo){
        convo_item.decrypted_content = RemoveNIP19FromContent(convo_item.content)
    }
    console.log(convo)
    let llm_response = await LLMConvo(BASE_URL, OPENAI_API_KEY, convo, nsec)

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


// const ndk = new NDK({
//     explicitRelayUrls: relays,
// });

// await ndk.connect();

// let unix_time = Math.floor((new Date()).getTime() / 1000);
// let filter = {
//     "kinds": [1],
//     "#p": getPublicKey(nip19.decode(nsec).data),
//     "since": unix_time - 10
// }
// console.log(JSON.stringify(filter, null, 2))
// let sub = await ndk.subscribe(filter);
// sub.on("event", async (event) => {
//     console.log("Recieved and event")
//     console.log(`content           = ${event.content}`)
//     console.log(`tags              = ${event.tags}`)
//     console.log(`id                = ${event.id}`)
//     console.log(`kind              = ${event.kind}`)
//     console.log(`created_at        = ${event.created_at}`)
//     console.log(`pubkey            = ${event.pubkey}`)
//     let raw_event = {
//         content: event.content,
//         tags: event.tags,
//         id: event.id,
//         kind: event.king,
//         created_at: event.created_at,
//         pubkey: event.pubkey
//     }
//     console.log(JSON.stringify(raw_event, null, 2))
//     console.log("")
//     console.log("PAUL_WAS_HERE")
//     console.log(getPublicKey(nip19.decode(nsec).data))
//     console.log(event.pubkey)
//     if( getPublicKey(nip19.decode(nsec).data) != event.pubkey) {
//         respond_to_thread(relays, nsec, nip_65_relays, raw_event.id)
//     }
// })
