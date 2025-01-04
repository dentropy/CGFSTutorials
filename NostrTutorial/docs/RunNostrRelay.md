# Run the Ditto Nostr Relay

**Install Deno**
[Deno Docs](https://deno.com/)
``` bash

curl -fsSL https://deno.land/install.sh | sh

```


**Get the source code**
``` bash
# Please Run one Line at a time
git clone https://github.com/soapbox-pub/ditto.git
cd ditto
deno task nsec
```

**Set the config file**
``` config
# file .env
DITTO_NSEC=nsec*****
```

**Run the Relay**
``` bash
deno run -A --env-file --watch src/server.ts
```