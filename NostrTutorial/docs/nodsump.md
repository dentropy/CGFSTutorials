#### SQL Queries

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

select * from profile_events;

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

SELECT event_id, json_extract(profile_json, '$.area') as special_tag, profile_json
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

#### SQLITE CLI Settings

``` bash

sqlite3 db.sqlite

```

``` sql

.mode column
.headers on


.tables
.schema $TABLE_NAME

```