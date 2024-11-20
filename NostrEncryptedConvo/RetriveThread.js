let event_id = "39a79926550fe85b9b4f97743138ea7ebd1fee0e60e9d74d7dbb94f467109470"
import { SimplePool } from "nostr-tools/pool";
import { nostrGet } from "./lib/nostrGet.js";

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
    console.log(relays)
}


let firstEvent = await nostrGet(
    relays,
    {
        "ids": [event_id]
    }
)


// Loop getting reply events
async function get_replies(events, relays) {
    // Check if event is reply or root
    let the_event = events[events.length - 1]
    let reply_to_event = ""
    for (const tag of the_event.tags) {
        if (tag[0] == "e" && tag[3] == "replied") {
            reply_to_event = tag[1]
            let response_event = await nostrGet(
                relays,
                {
                    "ids": [tag[1]]
                }
            )            
            events.push(response_event[0])
        }
    }
    if( reply_to_event == ""){
        for (const tag of the_event.tags) {
            if (tag[0] == "e" && tag[3] == "root") {
                reply_to_event = tag[1]
                let response_event = await nostrGet(
                    relays,
                    {
                        "ids": [tag[1]]
                    }
                )
                events.push(response_event[0])
            }
        }
    }
    if( reply_to_event == ""){
        return events.reverse()
    } else {
        return await get_replies(events, relays)
    }
}
let thread = await get_replies([firstEvent[0]], relays)

console.log("\n\n\n\nThread")
console.log(thread)
process.exit()