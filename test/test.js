const { Pool } = require('better-sqlite3');
const pool = new Pool({
  filename: 'example.db',
});

// Create table
async function createTable() {
  await pool.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE
    );
  `);
}

createTable();

// Insert data
async function insertUser(name, email) {
  const query = `
    INSERT INTO users (name, email)
    VALUES (?, ?);
  `;
  await pool.run(query, [name, email]);
}

// Read data
async function readUsers() {
  const query = 'SELECT * FROM users';
  const rows = await pool.all(query);
  return rows;
}

// Update data
async function updateUser(id, name, email) {
  const query = `
    UPDATE users SET name = ?, email = ?
    WHERE id = ?;
  `;
  await pool.run(query, [name, email, id]);
}

// Delete data
async function deleteUser(id) {
  const query = `
    DELETE FROM users WHERE id = ?;
  `;
  await pool.run(query, [id]);
}

module.exports = { pool, insertUser, readUsers, updateUser, deleteUser };