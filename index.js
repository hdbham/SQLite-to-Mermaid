
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const dbFilePath = './db/chinook.db';

async function main() {
  const db = new sqlite3.Database(dbFilePath);

  const enableForeignKeySupport = () => {
    return new Promise((resolve, reject) => {
      db.exec('PRAGMA foreign_keys = ON;', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  const getTableNames = () => {
    return new Promise((resolve, reject) => {
      db.all("SELECT name AS table_name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%';", (err, tables) => {
        if (err) reject(err);
        else resolve(tables);
      });
    });
  };

  const getTableSchema = (tableName) => {
    return new Promise((resolve, reject) => {
      db.get(`SELECT name AS table_name, sql AS table_schema FROM sqlite_master WHERE type = 'table' AND name = ?;`, tableName, (err, schema) => {
        if (err) reject(err);
        else resolve(schema);
      });
    });
  };

  const getColumnInformation = (tableName) => {
    return new Promise((resolve, reject) => {
      db.all(`PRAGMA table_info(${tableName});`, (err, columns) => {
        if (err) reject(err);
        else resolve(columns);
      });
    });
  };

  await enableForeignKeySupport();

  const tables = await getTableNames();
  let mermaidDiagram = 'erDiagram\n';

  for (const table of tables) {
    mermaidDiagram += `  ${table.table_name} {\n`;

    const schema = await getTableSchema(table.table_name);
    if (schema) {
      const columns = await getColumnInformation(table.table_name);
      columns.forEach((column) => {
        mermaidDiagram += `    ${column.name} ${column.type}\n`;
      });
    }

    mermaidDiagram += '  }\n';
  }

  db.close(() => {
    fs.writeFileSync('er_diagram.mermaid', mermaidDiagram);
  });
}

main().catch((err) => {
  console.error(err);
});
