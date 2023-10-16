const fs = require('fs');
const express = require('express');
const app = express();
const PORT = 8809;
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Store uploaded files in the 'uploads' directory
const cors = require('cors');
const sqlite3 = require('sqlite3');

app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  // this will set it dynamically to the current URL's origin: 
  res.setHeader('Access-Control-Allow-Origin', origin);
  next();
});


app.post('/upload', upload.single('sqlFile'), async (req, res) => {
  try {
    if (!req.file) {
      throw new Error('Request does not contain a file.');
    }
    const dbFilePath = req.file.path;

    // Process the SQL file and generate the Mermaid diagram
    const md = await generateMermaidDiagram(dbFilePath);
    console.log(md + ' generated');

    // returns the diagram as a ...?
    res.status(200).send(md);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const generateMermaidDiagram = async (dbFilePath) => {
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

  const getForeignKeyColumns = (tableName) => {
    return new Promise((resolve, reject) => {
      db.all(`PRAGMA foreign_key_list(${tableName});`, (err, fks) => {
        if (err) reject(err);
        else {
          const foreignKeyColumns = fks.map((fk) => ({
            table: fk.table,
            from: fk.from,
            to: fk.to,
          }));
          resolve(foreignKeyColumns);
        }
      });
    });
  };

  const getPrimaryKeyColumns = (tableName) => {
    return new Promise((resolve, reject) => {
      db.all(`PRAGMA table_info(${tableName});`, (err, columns) => {
        if (err) reject(err);
        else {
          const primaryKeys = columns
            .filter((column) => column.pk === 1)
            .map((column) => column.name);
          resolve(primaryKeys);
        }
      });
    });
  };

  await enableForeignKeySupport();

  const tables = await getTableNames();
  let mermaidDiagram = 'erDiagram\n';

  for (const table of tables) {
    mermaidDiagram += `    ${table.table_name} {\n`;

    const schema = await getTableSchema(table.table_name);
    if (schema) {
      const columns = await getColumnInformation(table.table_name);
      const primaryKeys = await getPrimaryKeyColumns(table.table_name);
      const foreignKeyColumns = await getForeignKeyColumns(table.table_name);

      columns.forEach((column) => {
        const { name, type } = column;
        let dataType = type.replace(/,/g, '-') || "UNDEFINED";

        const isPrimaryKey = primaryKeys.includes(name);
        const isForeignKey = foreignKeyColumns.find((fk) => fk.from === name);
        mermaidDiagram += `        ${name} ${dataType}`;
        if (isPrimaryKey) {
          mermaidDiagram += '-[PK]';
        }
        if (isForeignKey) {
          mermaidDiagram += '-[FK]';
        }
        mermaidDiagram += '\n';
        dataType = null;
      });
    }

    mermaidDiagram += '    }\n';
  }

  for (const table of tables) {
    const foreignKeyColumns = await getForeignKeyColumns(table.table_name);
    for (const foreignKey of foreignKeyColumns) {
      mermaidDiagram += `    ${table.table_name} ||--o{ ${foreignKey.table} : FK\n`;
    }
  }

  db.close(() => {
    fs.writeFileSync('./out/er_diagram.mermaid', mermaidDiagram);
    //delete temporary db file
    fs.unlink(dbFilePath, (err) => { if (err) throw err; });
  });
  return mermaidDiagram;
}
