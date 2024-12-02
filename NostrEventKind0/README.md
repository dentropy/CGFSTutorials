# nostreventkind0

To install dependencies:

```bash

deno install -g -A "jsr:@jiftechnify/nosdump@0.7.1"

nosdump -k 0 wss://relay.damus.io > event0.jsonl
```

#### SQL Queries

* Get all the profile JSON data into a separate table
``` sql
SELECT event_id, json_extract(event, '$.content') as profile_json
FROM events;

CREATE TABLE IF NOT EXISTS profile_events (
    event_id TEXT PRIMARY KEY,
    profile_json TEXT
);

INSERT into profile_events
SELECT event_id, json_extract(event, '$.content') as profile_json
FROM events;

select * from profile_events;
```

* Get a list of all tags via SQL
``` SQL

  SELECT distinct j.key
  FROM profile_events t, json_each(profile_json) j
```
* Get all matching tags via SQL
``` SQL
SELECT event_id, json_extract(profile_json, '$.name')
FROM profile_events;

SELECT event_id, json_extract(profile_json, '$.area') as special_tag, profile_json
FROM profile_events where special_tag is not null;


```
* Calculate percentages
``` sql

SELECT j.key, count(j.key) as key_count
  FROM profile_events t, json_each(profile_json) j
  GROUP by key
  order by key_count desc
```

