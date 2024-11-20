import NDK from "@nostr-dev-kit/ndk";
import { nip19 } from 'nostr-tools'
// Create a new NDK instance with explicit relays
const ndk = new NDK({
    explicitRelayUrls: ["ws://localhost:7007", "wss://relay.newatlantis.top"],
});

await ndk.connect();

let unix_time = Math.floor((new Date()).getTime() / 1000);
let filter = {
    kinds: [4],
    "#p": nip19.decode(process.env.NPUB).data,
    // "since": String(unix_time - 5000)
  }

let sub = await ndk.subscribe(filter);
sub.on("event", (event) => {
    console.log(Object.keys(event))
    console.log(event.content)
})
