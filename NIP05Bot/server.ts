import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";
const env = await load();

import { NSecSigner, NPool, NRelay1 } from "@nostrify/nostrify";
import { verifyEvent, nip19, getPublicKey } from "@nostr/tools";
import { NSchema as n } from "@nostrify/nostrify";

export const my_pool = new NPool({
  open: (url) => new NRelay1(url),
  reqRouter: async (filters) => new Map([]),
  eventRouter: async (
    event,
  ) => [],
})

let npub = nip19.npubEncode(getPublicKey(nip19.decode(env.NSEC).data))
console.log(`Server npub = ${npub}`)


const signer = new NSecSigner(nip19.decode(env.NSEC).data);

async function main() {
  const unix_time:number = Math.floor((new Date()).getTime() / 1000)
  const filter:object = {
      kinds: [3036],
      since: unix_time - 10,
      "#L": ["nip05.domain"],
      "#l": [env.DOMAIN_NAME, 'nip05.domain']
    };
  console.log("\nFilter:")
  console.log(filter)
  for await (const msg of my_pool.req([filter], {relays: env.RELAY_URLS.split(",")})) {
    if (msg[0] === "EVENT") {
      const event = n.event().refine(verifyEvent).parse(msg[2]);
      if( verifyKind3036(event) ) {
        produceKind30360(event)
      }
    }
    // if (msg[0] === "EOSE") break; // Sends a `CLOSE` message to the relay.
  }
}

main();

function countOccurrences(list:[string], str:string) {
  const count = list.reduce((acc, item) => acc + (item === str ? 1 : 0), 0);
  return count > 1;
}
function getFirstItemsWithMatch(listOfLists:[string], searchStr:string) {
  for (const item of listOfLists) {
    if(item[0] == searchStr) {
      return item
    }
  }
}
async function verifyKind3036(event) {
  
  // Check for Duplicate and Required Tags
  const firstItems = event.tags.map(sublist => sublist[0])
  const requiredTags = [ "L", "p", "d", "l" ]
  for (const eventTag of requiredTags){
    if (!firstItems.includes(eventTag)) {
      console.error(`event_id=${event.id} is missing tag=${eventTag}`)
      return false
    }
  }
  if(countOccurrences(firstItems, "L")){
    console.error(`event_id=${event.id} has duplicate "L" tags`)
    return false
  }
  if(countOccurrences(firstItems, "l")){
    console.error(`event_id=${event.id} has duplicate "l" tags`)
    return false
  }
  if(countOccurrences(firstItems, "d")){
    console.error(`event_id=${event.id} has duplicate "d" tags`)
    return false
  }
  // We only accept one p tag because they get assigned the nip05 identifier
  if(countOccurrences(firstItems, "p")){
    console.error(`event_id=${event.id} has duplicate "p" tags`)
    return false
  }

  // Check for required length of tags
  // We don't need to check tag L because it is in the filter
  // We don't need to check the l tag because it is in the filter
  if(getFirstItemsWithMatch(event.tags, "p").length < 1) {
    console.error(`event_id=${event.id} tag p requires length of two`)
    return false
  }
  if(getFirstItemsWithMatch(event.tags, "d").length < 1) {
    console.error(`event_id=${event.id} tag d requires length of two`)
    return false
  }

  // Check the domain name maches
  if(getFirstItemsWithMatch(event.tags, "l")[1] != env.DOMAIN_NAME) {
    console.error(`event_id=${event.id} "l" tag has invalid domain name=${getFirstItemsWithMatch(event.tags, "l")[1]}, domain name should be ${env.DOMAIN_NAME}`)
    return false
  }

  // Check if the p tag is a nostr public key
  if(getFirstItemsWithMatch(event.tags, "p")[1].length != 64) {
    console.error(`event_id=${event.id} "p" tag has pubkey, length should be 64`)
    return false
  }

  // Check the d tag, username,  is lowercase
  const username = getFirstItemsWithMatch(event.tags, "d")[1]
  if(!/^[a-z0-9_.-]*$/.test(username)) {
    console.error(`event_id=${event.id} Invalid username=${username} it must be be lowercase with numbers`)
    return false
  }
  
  // Check if username is already claimed
  const username_filter = {
    kinds: [30360],
    "#L": ["nip05.domain"],
    "#l": [env.DOMAIN_NAME, 'nip05.domain'],
    "#d": [username]
  }
  console.log("username_filter")
  console.log(username_filter)
  let found_username = false
  for await (const msg of my_pool.req([username_filter], {relays: env.RELAY_URLS.split(",")})) {
    console.log("MSG")
    console.log(msg)
    if (msg[0] === "EVENT") {
      console.log("WE_SHOULD_HAVE_ERROR")
      console.log(msg[2])
      console.error(`event_id=${event.id} Found Username claimed via ${msg[2].id}`)
      found_username = true
      return false
    }
    if (msg[0] === "EOSE") break; // Sends a `CLOSE` message to the relay.
  }
  if(found_username) {
    return true
  }

  // Check if pubkey is already being used
  const pubkey_filter = {
    kinds: [30360],
    "#L": ["nip05.domain"],
    "#l": [env.DOMAIN_NAME, 'nip05.domain'],
    "#d": [username],
    "#p": [event.pubkey]
  }
  let found_pubkey = false
  for await (const msg of my_pool.req([pubkey_filter], {relays: env.RELAY_URLS.split(",")})) {
    if (msg[0] === "EVENT") {
      console.error(`event_id=${event.id} Found pubkey already claimed nip05 via ${msg[2].id}`)
      console.log(event)
      console.log(msg[2])
      found_pubkey = true
    }
    if (msg[0] === "EOSE") break; // Sends a `CLOSE` message to the relay.
  }
  if(!found_pubkey) {
    return false
  }

  // Return true because all checks passed
  console.log(`event_id=${event.id} passed the verifyKind3036 check`)
  return true
}

async function produceKind30360(event) {
  const unix_time:number = Math.floor((new Date()).getTime() / 1000)
  let event_data = {
    created_at: unix_time,
    content: "",
    kind: 30360,
    tags: [
      ["L", "nip05.domain"],
      ["p", getFirstItemsWithMatch(event.tags, "p")[1] ], // pubkey
      ["l", getFirstItemsWithMatch(event.tags, "l")[1] ], // domain_name
      ["d", getFirstItemsWithMatch(event.tags, "d")[1] ], // username
      ["e", event.id]
    ]
  }
  if (  countOccurrences(event.tags, "r")  ) {
    event_data.tags.push( getFirstItemsWithMatch(event.tags, "r") )
  }
  const auth_event = await signer.signEvent(event_data)
  console.log("auth_event")
  console.log(auth_event)
  my_pool.event(auth_event, {relays: env.RELAY_URLS.split(",")})
}