import Database from 'libsql';
import fs from 'node:fs'

let populate_data = `
CREATE TABLE IF NOT EXISTS profile_events (
    event_id TEXT PRIMARY KEY,
    profile_json TEXT
);

INSERT into profile_events
SELECT event_id, json_extract(event, '$.content') as profile_json
FROM events;
`

const db = new Database("./db.sqlite");
await db.exec(populate_data);
