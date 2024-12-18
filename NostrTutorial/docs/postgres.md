
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

select event_id, profile_json::JSON->'name' from
(
SELECT event_id, json_extract_path_text(event::JSON, 'content') as profile_json
FROM events
WHERE kind = 0
) as events_as_json_t

select event_id, profile_json::JSON from
(
SELECT event_id, json_extract_path_text(event::JSON, 'content') as profile_json
FROM events
WHERE kind = 0
) as events_as_json_t

select event_id, profile_json FROM
(
SELECT event_id, json_extract_path_text(event::JSON, 'content')::JSON as profile_json
FROM events
WHERE kind = 0
) as event_content_t;

select event_id, profile_json::jsonb from (
SELECT 
	event_id, json_extract_path_text(event::JSON, 'content') as profile_json
FROM events
WHERE kind = 0
limit 1000000
) as profile_event_json
where  is_valid_json(profile_json) = true;

select '{"HELLO":"WORLD}"'::TEXT;
select pg_typeof('{"HELLO":"WORLD"}'::TEXT);
select '{"HELLO":"WORLD"}'::TEXT::JSON;
select pg_typeof('{"HELLO":"WORLD"}'::TEXT::JSON);

create or replace function is_valid_json(p_json text)
  returns boolean
as
$$
begin
  return (p_json::json is not null);
exception 
  when others then
     return false;  
end;
$$
language plpgsql
immutable;

SELECT (event->'content')::text
from events
limit 10000;

SELECT jsonb_typeof((event->'content')::jsonb)
from events;

WHERE jsonb_typeof(event::jsonb) IS NOT NULL;

INSERT into profile_events
select event_id, profile_json::jsonb from (
SELECT
	event_id, json_extract_path_text(event::JSON, 'content') as profile_json
FROM events
WHERE kind = 0
limit 1000000
) as profile_event_json
where  is_valid_json(profile_json) = true
ON CONFLICT (event_id)
DO NOTHING;

```