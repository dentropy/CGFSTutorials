import { NPostgres } from '@nostrify/db';
import { Kysely } from 'kysely';
import { PGlite } from '@electric-sql/pglite';
import { PgliteDialect } from '@soapbox/kysely-pglite';

const db = new Kysely({
  dialect: new PgliteDialect({
    database: new PGlite('./outbox'),
  }),
});

// From [grok.com/share/bGVnYWN5\_499cc620-4998-49b4-854e-e5722b39caf5](https://grok.com/share/bGVnYWN5_499cc620-4998-49b4-854e-e5722b39caf5)

async function generateCreateTableStatements() {
  const tables = await db.introspection.getTables();

  const sqlStatements = tables.map(table => {
    const columns = table.columns
      .map(col => {
        let columnDef = `${col.name} ${col.dataType.toUpperCase()}`;
        if (!col.isNullable) columnDef += ' NOT NULL';
        if (col.isAutoIncrementing) columnDef += ' AUTO_INCREMENT';
        if (col.hasDefaultValue) columnDef += ' DEFAULT';
        return columnDef;
      })
      .join(',\n  ');

    return `CREATE TABLE ${table.schema ? `${table.schema}.` : ''}${table.name} (\n  ${columns}\n);`;
  });

  return sqlStatements.join('\n\n');
}

generateCreateTableStatements().then(sql => {
  console.log(sql);
  db.destroy();
});