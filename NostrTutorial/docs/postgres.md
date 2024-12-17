
#### Setup and Run
``` bash

docker compose -f pgvector.docker-compose.yml up -d

```

#### Troubleshooting

``` bash
# Stop Running postgres on local machine
sudo systemctl stop postgresql
sudo systemctl disable postgresql

```

#### Test pgvector connection

``` bash
# If you have a psql client installed
psql postgresql://postgres:postgres@localhost:5432/postgres


# -U is username
# -d is name of database
docker exec -it pgvector psql -U postgres -d postgres

# Use \d to see tables
\d

# Use \d $TABLE_NAME for table schema
\d events
\d tags

# Use \qto quit
\q

```

#### Run script to load Nostr Events into Database

``` bash


deno -A cli.js load-nosdump-into-postgres -db postgresql://postgres:postgres@localhost:5432/postgres -f ScrapedData/event0.jsonl


```


#### Queries

``` sql

SELECT COUNT(*) from events;
SELECT COUNT(*) from tags;

```