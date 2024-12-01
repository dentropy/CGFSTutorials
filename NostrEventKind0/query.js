import Database from 'libsql';
const db = new Database("./db.sqlite");
const results = db.prepare(`SELECT * FROM events;`).all(1);
console.log(results)