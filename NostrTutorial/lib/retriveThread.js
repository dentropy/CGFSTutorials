import { nostrGet } from "./nostrGet.js";
export async function RetriveThread(relays, event_id){
    let thread = {
        events_by_id: {}
    }
    function findMatchingFirstStringOfTag(event, firstTagString){
        let resultTags = []
        for (const tag of event.tags){
            if(tag[0] == firstTagString){
                resultTags.push(tag)
            }
        }
        return resultTags
    }
    function isRootEvent(event){
        // Returns true or returns the id of the rootEvent
        let eTags = findMatchingFirstStringOfTag(event, 'e')
        for (const tag of eTags){
            if (tag[3] == "root"){
                return tag[1]
            }
        }
        return true
    }
    function getRelyEvents(){}


    let firstEvent = await nostrGet(event_id)
    thread.events_by_id[event_id] = {
        event_data: firstEvent,
        replies: [],
        reply_to: [],
        depth_index: []
    }
    if (isRootEvent(firstEvent)){
        thread.root_event = thread[event_id]
    } else {
        const rootEvent = nostrGet(isRootEvent(event_id))
        thread.events_by_id[event_id] = {
            event_data: rootEvent,
            replies: [],
            reply_to: [],
            depth_index: []
        }
        thread.root_event = thread[event_id]
    }
}


export async function RetriveThreadOld(relays, event_id){

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
        console.log("events.length")
        console.log(events.length)
        console.log(events)


        // let reply_to_event = ""
        // for (const tag of the_event.tags) {
        //     if (tag[0] == "e" && tag[3] == "reply") {
        //         reply_to_event = tag[1]
        //         let response_event = await nostrGet(
        //             relays,
        //             {
        //                 "ids": [tag[1]]
        //             }
        //         )            
        //         if(response_event[0] != undefined){
        //             events.push(response_event[0])
        //             reply_to_event = ""
        //         }
        //     }
        // }
        // if( reply_to_event == ""){
        //     for (const tag of the_event.tags) {
        //         if (tag[0] == "e" && tag[3] == "root") {
        //             reply_to_event = tag[1]
        //             let response_event = await nostrGet(
        //                 relays,
        //                 {
        //                     "ids": [tag[1]]
        //                 }
        //             )
        //             if(response_event[0] != undefined){
        //                 events.push(response_event[0])
        //                 reply_to_event = ""
        //             }
        //         }
        //     }
        // }
        // if( reply_to_event == ""){
        //     return events.reverse()
        // } else {
        //     return await get_replies(events, relays)
        // }

        let reply_event = ""
        let root_event = ""
        for (const tag of the_event.tags) {
            if (tag[0] == "e" && tag[3] == "reply") {
                reply_event = tag[1]       
            }
            if (tag[0] == "e" && tag[3] == "root") {
                root_event = tag[1]
            }
        }
        console.log("reply_event")
        console.log(`reply_event=${reply_event} root_event=${root_event}`)
        console.log("\n\n\n")

        if(reply_event == root_event || reply_event == undefined || reply_event == ""){
            let response_event = await nostrGet(
                relays,
                {
                    "ids": [root_event]
                }
            )            
            if(response_event[0] != undefined){
                events.push(response_event[0])
            }
            return events.reverse()
        } else {
            let response_event = await nostrGet(
                relays,
                {
                    "ids": [reply_event]
                }
            )            
            if(response_event[0] != undefined){
                events.push(response_event[0])
            }
            return await get_replies(events, relays)
        }

    }
    return await get_replies([firstEvent[0]], relays)
}
