import Database from 'libsql';
import fs from 'node:fs'

let populate_data = `
CREATE TABLE IF NOT EXISTS events (
    event_id TEXT PRIMARY KEY,
    event TEXT
);
`

const db = new Database("./db.sqlite");
await db.exec(populate_data);


let file_contents = await fs.readFileSync('./event0.jsonnl', 'utf-8')
file_contents = file_contents.split("\n")
for( const line of file_contents){
    try {
        const event = JSON.parse(line)
        let query = `INSERT INTO events(event_id, event) VALUES ('${event.id}', '${line}');`
        console.log(query)
        await db.exec(query);
        console.log("Added Event")
    } catch (error) {
        console.log(error)
    }
}


let query  = await db.prepare(`SELECT * FROM events;`).all();
console.log(query)