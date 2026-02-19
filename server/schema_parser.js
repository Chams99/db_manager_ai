const mysql = require('mysql2/promise');

class SchemaParser {
  constructor(config) {
    this.config = config;
    this.connection = null;
  }

  async connect() {
    this.connection = await mysql.createConnection(this.config);
  }

  async parseSchema() {
    if (!this.connection) {
      throw new Error('Database connection not established. Call connect() first.');
    }

    const [tables] = await this.connection.query("SHOW TABLES");
    const schema = {};

    for (const tableRow of tables) {
      const tableName = Object.values(tableRow)[0];
      const [columns] = await this.connection.query(`SHOW COLUMNS FROM \\\`${tableName}\\\``);
      schema[tableName] = columns.map(column => ({
        name: column.Field,
        type: column.Type,
      }));
    }

    return schema;
  }

  async close() {
    if (this.connection) {
      await this.connection.end();
    }
  }
}

module.exports = SchemaParser;