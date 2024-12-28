import NDK from "@nostr-dev-kit/ndk";
import { Relay, nip19, nip04, finalizeEvent, verifyEvent, getPublicKey } from 'nostr-tools'
import { llm_dm_chatbot_response } from "../LLMDMChatbot.js";
import { check_NIP65_published } from "../LLMDMChatbot.js";
import { llm_respond_to_thread } from "../LLMThreadChatbot.js";

export async function LLMThreadBot(args, options) {
    // Configure nip65 (Relay Metadata)
        // Configure Profile
        // Test LLM Connection
        console.log(args)
        let npub = nip19.npubEncode(getPublicKey(nip19.decode(args.nsec).data))
        console.log(`${npub}`)
        const ndk = new NDK({
          explicitRelayUrls: args.relays.split(','),
        });
        
        await ndk.connect();
        
        let unix_time = Math.floor((new Date()).getTime() / 1000);
        let filter = {
          "kinds": [1],
          "#p": getPublicKey(nip19.decode(args.nsec).data),
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
            console.log(getPublicKey(nip19.decode(args.nsec).data))
            console.log(event.pubkey)
            if( getPublicKey(nip19.decode(args.nsec).data) != event.pubkey) {
                llm_respond_to_thread(
                    args.relays.split(','),
                    args.nsec,
                    raw_event.id,
                    args.BASE_URL,
                    args.OPENAI_API_KEY
                )
            }
        })
}