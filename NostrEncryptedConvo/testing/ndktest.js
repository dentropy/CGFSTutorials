import NDK from "@nostr-dev-kit/ndk";

// Create a new NDK instance with explicit relays
const ndk = new NDK({
    explicitRelayUrls: ["ws://localhost:7007", "wss://relay.newatlantis.top"],
});

await ndk.connect();

let unix_time = Math.floor((new Date()).getTime() / 1000);
let filter = {
    kinds: [4],
    "#p": "a582c706dad3a703d6c0211dc25e6bb2cbc9081ced7c2adbab91150b905645a7",
    "since": String(unix_time - 5000)
  }

let sub = await ndk.subscribe(filter);
sub.on("event", (event) => {
    console.log(Object.keys(event))
    console.log(event.content)
})
