
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

#### Profile Queries

``` SQL

select * from events;

drop table profile_events ;

CREATE TABLE IF NOT EXISTS profile_events (
    event_id TEXT PRIMARY KEY,
    profile_json JSONB
);


select event_id, profile_json from (
select event_id, profile_json::jsonb as profile_json from (
	SELECT event_id, (event -> 'content') as profile_json
	FROM events
	WHERE kind = 0
) as events_table
) as events_json_table;

SELECT event_id, pg_typeof(event) as profile_json
FROM events
WHERE kind = 0;

SELECT event_id, pg_typeof((event -> 'content')::text::JSONB) as profile_json
FROM events
WHERE kind = 0;

SELECT event_id, json_extract_path_text(event::JSON, 'content')::JSON as profile_json
FROM events
WHERE kind = 0;


SELECT event_id, (event -> 'content') as profile_json
FROM events
WHERE kind = 0;

SELECT ('"{\"key\":\"value\"}"'::jsonb)->>'key' AS extracted_key;

INSERT into profile_events
SELECT event_id, event -> 'content' as profile_json
FROM events
WHERE kind = 0;

select * from profile_events;

select event_id, profile_json -> 'name' from profile_events;


SELECT keys ->> 'i'
FROM (
  SELECT json_agg(keys) AS keys FROM (
    SELECT array_agg(DISTINCT key) AS keys
    FROM jsonb_array_elements_text(jsonb_column_name)
  ) AS subquery
) t;

```