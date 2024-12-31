# Query Relay Using Filter

``` bash

export RELAYS='wss://relay.newatlantis.top'

deno -A cli.js filter-query --filter_file_path ./ScrapedData/filter.json -r $RELAYS

```