var ws = new WebSocket("ws://localhost:7007");
// send a subscription request for text notes from authors with my pubkey
ws.addEventListener('open', function (event) {
    ws.send('["REQ", "my-sub", {"kinds":[4],"#p":"a582c706dad3a703d6c0211dc25e6bb2cbc9081ced7c2adbab91150b905645a7"}]');
});
// print out all the returned notes
ws.addEventListener('message', function (event) {
    if (JSON.parse(event.data)[2] != null)
        console.log('Note: ', JSON.parse(event.data)[2]);
});