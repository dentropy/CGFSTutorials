#### SQL Queries

## Loading into SQLite

``` bash

# Profiles
nosdump -k 0 wss://relay.damus.io > event0.jsonl
# Microblogging/Tweets
nosdump -k 1 wss://relay.damus.io > event1.jsonl

# Look inside the file
head event0.jsonl
tail event0.jsonl

# Could number of lines
wc -l event0.jsonl

deno -A cli.js load-nosdump-into-sqlite -db ./db.sqlite -f event0.jsonl

deno -A cli.js sql-query -db ./db.sqlite -sql 'SELECT COUNT(*) FROM events;'

```
## Profile Queries

#### Get all the profile JSON data into a separate table

``` sql

.mode column
.headers on

SELECT event_id, json_extract(event, '$.content') as profile_json
FROM events
WHERE json_valid(profile_json) = 1;

CREATE TABLE IF NOT EXISTS profile_events (
    event_id TEXT PRIMARY KEY,
    profile_json TEXT
);

INSERT into profile_events
SELECT event_id, json_extract(event, '$.content') as profile_json
FROM events
WHERE json_valid(profile_json) = 1;

select profile_json from profile_events limit 1;

```

#### Get a list of all tags via SQL

``` SQL

.mode column
.headers on

SELECT distinct j.key
FROM profile_events t, json_each(profile_json) j;

```

#### Get all matching tags via SQL

``` SQL

.mode column
.headers on

SELECT event_id, json_extract(profile_json, '$.name')
FROM profile_events;

SELECT event_id, json_extract(profile_json, '$.about') as special_tag, profile_json
FROM profile_events where special_tag is not null;


```

#### Calculate percentages
``` sql

.mode column
.headers on

SELECT j.key, count(j.key) as key_count
  FROM profile_events t, json_each(profile_json) j
  GROUP by key
  order by key_count desc;

```

## Reaction Queries 

``` bash

# Emoji Reactions
nosdump -k 7 wss://relay.damus.io > event7.jsonl

wc -l event7.jsonl

deno -A cli.js load-nosdump-into-sqlite -db ./db.sqlite -f event7.jsonl

```

``` sql

-- Get a list of distinct reactions (emoji)
SELECT distinct json_extract(event, '$.content') as reaction
FROM events where kind = 7;

-- Take a look at the tags of the reactions
SELECT event_id, json_extract(event, '$.tags') as reaction
FROM events where kind = 7;

-- Get most popular reactions
SELECT count(*) as count, json_extract(event, '$.content') as reaction
FROM events where kind = 7
group by reaction
order by count desc;

-- Get most reaction to post
-- TODO we need to get the tags extracted separately

```

#### Get wiki articles

* kind 30818
* [nips/54.md](https://github.com/nostr-protocol/nips/blob/master/54.md)

``` bash

nosdump -k 30818 wss://relay.damus.io > event30818.jsonl
nosdump -k 30818 wss://nos.lol > event30818.jsonl

wc -l event30818.jsonl

deno -A cli.js load-nosdump-into-sqlite -db ./db.sqlite -f event30818.jsonl

```

``` SQL

SELECT * FROM events where kind=30818;

SELECT json_extract(event, '$.tags') as tags
FROM events where kind = 30818;
```

#### Query by Tag

``` SQL
select * from 
(
  SELECT
    event_id,
    json_extract(event, '$.tags') as tags
  FROM events
) as tags_t,
json_each(tags_t.tags)

select event_id, key as key_L1, value as value_L1, fullkey as fullkey_L1 from 
(
  SELECT
    event_id,
    json_extract(event, '$.tags') as tags
  FROM events
) as tags_t,
json_each(tags_t.tags)


select * from (
select event_id, key as key_L1, value as value_L1, fullkey as fullkey_L1 from 
(
  SELECT
    event_id,
    json_extract(event, '$.tags') as tags
  FROM events
) as tags_t,
json_each(tags_t.tags)
) as individual_tags_t,
json_each(individual_tags_t.value_L1)


select 
  event_id,
  key_L1,
  value_L1,
  fullkey_L1,
  key as key_L2,
  value as value_L2,
   fullkey as fullkey_L2 
from 
(
  select event_id, key as key_L1, value as value_L1, fullkey as fullkey_L1 from 
  (
    SELECT
      event_id,
      json_extract(event, '$.tags') as tags
    FROM events
  ) as tags_t,
  json_each(tags_t.tags)
) as individual_tags_t,
json_each(individual_tags_t.value_L1)

```
## SQLITE CLI Settings

``` bash

sqlite3 db.sqlite

```

``` sql

.mode column
.headers on


.tables
.schema $TABLE_NAME

```