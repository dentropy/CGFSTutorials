import { NPostgres } from '@nostrify/db';
import { Kysely } from 'npm:kysely';
import { PGlite } from '@electric-sql/pglite';
import { PgliteDialect } from '@soapbox/kysely-pglite';

const db = new Kysely({
  dialect: new PgliteDialect({
    database: new PGlite('./pgdata'),
  }),
});

// https://grok.com/share/bGVnYWN5_70472648-d91c-4b5f-8e03-b143a410ac97
// Define the table structure
async function createTable() {
  await db.schema
    .createTable('nip05s')
    .addColumn('relays', 'JSONB', (col) => col.primaryKey())
    .addColumn('npub', 'varchar(100)', (col) => col.unique().notNull())
    .addColumn('created_at', 'timestamp', (col) => 
      col.defaultTo(db.fn.now()).notNull()
    )
    .execute()
}

// Main execution
async function main() {
  try {
    // Create table
    await createTable()
    console.log('Table created successfully')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await db.destroy()
  }
}

main()