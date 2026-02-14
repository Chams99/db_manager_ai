const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
// Server should always use port 5000 (React client uses 3000)
const PORT = process.env.PORT || 5000;

// --- Security middleware (same idea as pdf-converter-backend) ---
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));

const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({
  origin: corsOrigin === '*' ? '*' : corsOrigin.split(',').map(s => s.trim()),
  credentials: true,
  optionsSuccessStatus: 200,
}));

// Rate limiting: prevent abuse (e.g. 100 req / 15 min per IP)
const rateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
const rateLimitMax = Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;
app.use(rateLimit({
  windowMs: rateLimitWindowMs,
  max: rateLimitMax,
  message: { success: false, error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.ip === '127.0.0.1' || req.ip === '::1',
}));

// Body size limit (protect against large payloads)
const bodyLimit = process.env.BODY_LIMIT || '1mb';
app.use(express.json({ limit: bodyLimit }));

// Health check for Docker/Traefik
app.get('/', (_, res) => {
  res.status(200).json({
    status: 'success',
    message: 'DB Manager AI Server',
    timestamp: new Date().toISOString(),
  });
});

// OpenRouter configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
// Default to a cheap, modern model. Options: 
// - openai/gpt-4o-mini (newest, cheap, recommended)
// - openai/gpt-3.5-turbo (older but still good)
// - anthropic/claude-3-haiku (alternative)
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL; // Newest cheap model

// Database connection pool
const dbConnections = new Map();

// Supported database types
const DB_TYPES = {
  SQLITE: 'sqlite',
  POSTGRES: 'postgres',
  MYSQL: 'mysql'
};

// Helper function to create database connection
async function createConnection(type, config) {
  switch (type) {
    case DB_TYPES.SQLITE:
      const dbPath = config.path || path.join(__dirname, 'database.db');
      // Create directory if it doesn't exist
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath, (err) => {
          if (err) reject(err);
          else resolve(db);
        });
      });
    
    case DB_TYPES.POSTGRES:
      const pgPool = new Pool({
        host: config.host || 'localhost',
        port: config.port || 5432,
        database: config.database,
        user: config.username,
        password: config.password,
      });
      // Test connection
      await pgPool.query('SELECT NOW()');
      return pgPool;
    
    case DB_TYPES.MYSQL:
      const mysqlConn = await mysql.createConnection({
        host: config.host || 'localhost',
        port: config.port || 3306,
        database: config.database,
        user: config.username,
        password: config.password,
      });
      return mysqlConn;
    
    default:
      throw new Error(`Unsupported database type: ${type}`);
  }
}

// Helper function to execute query
async function executeQuery(connection, type, query) {
  const startTime = Date.now();
  
  try {
    switch (type) {
      case DB_TYPES.SQLITE:
        return new Promise((resolve, reject) => {
          const trimmedQuery = query.trim();
          const trimmedUpper = trimmedQuery.toUpperCase();
          const isSelect = trimmedUpper.startsWith('SELECT');
          // Multiple statements: split by semicolon, ignore empty and trailing
          const statements = trimmedQuery.split(';').map(s => s.trim()).filter(Boolean);
          const isMultiStatement = statements.length > 1;
          const allSelects = statements.length > 0 && statements.every(s => s.toUpperCase().trim().startsWith('SELECT'));

          if (isSelect && isMultiStatement && allSelects) {
            // Multiple SELECTs: run each and collect all result sets
            const resultSets = [];
            let index = 0;
            function runNext() {
              if (index >= statements.length) {
                const executionTime = Date.now() - startTime;
                resolve({ resultSets, executionTime });
                return;
              }
              const stmt = statements[index++] + ';';
              connection.all(stmt, (err, rows) => {
                if (err) {
                  reject(err);
                  return;
                }
                const rawRows = Array.isArray(rows) ? rows : [];
                const columns = rawRows.length > 0 ? Object.keys(rawRows[0]) : [];
                // Use column order so every result set has rows as [val1, val2, ...] matching columns
                const rowArrays = rawRows.map(row =>
                  columns.map(col => (row != null && col in row ? row[col] : null))
                );
                resultSets.push({
                  columns: [...columns],
                  rows: rowArrays,
                  rowCount: rowArrays.length
                });
                runNext();
              });
            }
            runNext();
          } else if (isSelect && !isMultiStatement) {
            // Single SELECT: use all()
            connection.all(query, (err, rows) => {
              if (err) {
                reject(err);
                return;
              }
              const executionTime = Date.now() - startTime;
              const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
              resolve({
                columns,
                rows: rows.map(row => Object.values(row)),
                rowCount: rows.length,
                executionTime
              });
            });
          } else if (!isSelect && isMultiStatement) {
            // Multiple non-SELECT statements (e.g. PRAGMA; BEGIN; CREATE; INSERT; DROP; RENAME; COMMIT): use exec()
            connection.exec(query, (err) => {
              if (err) {
                reject(err);
                return;
              }
              const executionTime = Date.now() - startTime;
              resolve({
                columns: [],
                rows: [],
                rowCount: 0,
                executionTime,
                message: 'Multiple statements executed successfully.'
              });
            });
          } else {
            // Single non-SELECT: use run()
            connection.run(query, function(err) {
              if (err) {
                reject(err);
                return;
              }
              const executionTime = Date.now() - startTime;
              resolve({
                columns: [],
                rows: [],
                rowCount: this.changes || 0,
                executionTime,
                lastInsertRowid: this.lastID || null
              });
            });
          }
        });
      
      case DB_TYPES.POSTGRES:
        const pgResult = await connection.query(query);
        const executionTime = Date.now() - startTime;
        return {
          columns: pgResult.fields?.map(f => f.name) || [],
          rows: pgResult.rows.map(row => Object.values(row)),
          rowCount: pgResult.rowCount || 0,
          executionTime
        };
      
      case DB_TYPES.MYSQL:
        const [mysqlRows, mysqlFields] = await connection.execute(query);
        const mysqlExecutionTime = Date.now() - startTime;
        return {
          columns: mysqlFields?.map(f => f.name) || [],
          rows: Array.isArray(mysqlRows[0]) ? mysqlRows : mysqlRows.map(row => Object.values(row)),
          rowCount: mysqlRows.length || 0,
          executionTime: mysqlExecutionTime
        };
      
      default:
        throw new Error(`Unsupported database type: ${type}`);
    }
  } catch (error) {
    throw error;
  }
}

// Test database connection
app.post('/api/db/connect', async (req, res) => {
  try {
    const { type, path, host, port, database, username, password } = req.body;
    
    if (!type || !Object.values(DB_TYPES).includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid database type. Supported: sqlite, postgres, mysql'
      });
    }
    
    // Validate required fields based on database type
    if (type === DB_TYPES.SQLITE) {
      // SQLite only needs a path (optional, defaults to database.db)
    } else if (type === DB_TYPES.POSTGRES || type === DB_TYPES.MYSQL) {
      if (!host || !database || !username) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: host, database, username'
        });
      }
    }
    
    const connectionId = `db_${Date.now()}`;
    const config = type === DB_TYPES.SQLITE 
      ? { path }
      : { host, port: parseInt(port) || (type === DB_TYPES.POSTGRES ? 5432 : 3306), database, username, password };
    
    // Create actual database connection
    const connection = await createConnection(type, config);
    
    // Store connection
    dbConnections.set(connectionId, {
      type,
      connection,
      config,
      connected: true
    });
    
    res.json({ 
      success: true, 
      connectionId,
      message: `Connected to ${type} database successfully`
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Execute query
app.post('/api/db/query', async (req, res) => {
  try {
    const { connectionId, query } = req.body;
    
    console.log('Query execution request:', { connectionId, query: query?.substring(0, 100) });
    
    if (!connectionId || !query) {
      return res.status(400).json({
        success: false,
        error: 'Missing connectionId or query'
      });
    }
    
    const dbInfo = dbConnections.get(connectionId);
    if (!dbInfo || !dbInfo.connected) {
      console.error('Connection not found:', connectionId, 'Available:', Array.from(dbConnections.keys()));
      return res.status(400).json({ 
        success: false, 
        error: 'Database connection not found or not connected' 
      });
    }
    
    // Check query type
    const trimmedQuery = query.trim().toUpperCase();
    const isUpdate = trimmedQuery.startsWith('UPDATE');
    const isInsert = trimmedQuery.startsWith('INSERT');
    const isDelete = trimmedQuery.startsWith('DELETE');
    const isModifyingQuery = isUpdate || isInsert || isDelete;
    
    // Execute actual query
    const results = await executeQuery(dbInfo.connection, dbInfo.type, query);
    
    // Multiple SELECT result sets (SQLite multi-statement)
    if (results.resultSets && results.resultSets.length > 0) {
      console.log('Query executed successfully (multiple result sets):', {
        resultSetCount: results.resultSets.length,
        executionTime: results.executionTime
      });
      return res.json({
        success: true,
        results: { resultSets: results.resultSets },
        executionTime: results.executionTime
      });
    }
    
    console.log('Query executed successfully:', { 
      rowCount: results.rowCount, 
      columnCount: (results.columns || []).length,
      executionTime: results.executionTime,
      isModifying: isModifyingQuery
    });
    
    // For UPDATE queries, try to fetch the affected records
    let affectedRecords = null;
    if (isUpdate && results.rowCount > 0) {
      try {
        // Extract table name and WHERE clause from UPDATE query
        const updateMatch = query.match(/UPDATE\s+(\w+)\s+SET[\s\S]+?(?:WHERE\s+(.+))?/i);
        if (updateMatch) {
          const tableName = updateMatch[1];
          const whereClause = updateMatch[2] || '1=1';
          
          // Fetch the updated records
          const selectQuery = `SELECT * FROM ${tableName} WHERE ${whereClause}`;
          const affectedResults = await executeQuery(dbInfo.connection, dbInfo.type, selectQuery);
          
          if (affectedResults.rowCount > 0 && !affectedResults.resultSets) {
            affectedRecords = {
              columns: affectedResults.columns,
              rows: affectedResults.rows,
              rowCount: affectedResults.rowCount
            };
          }
        }
      } catch (err) {
        console.error('Error fetching affected records:', err);
        // Continue without affected records
      }
    }
    
    res.json({ 
      success: true, 
      results: {
        columns: affectedRecords ? affectedRecords.columns : results.columns,
        rows: affectedRecords ? affectedRecords.rows : results.rows,
        rowCount: results.rowCount,
        isModifyingQuery: isModifyingQuery,
        message: results.message || (isModifyingQuery 
          ? `${results.rowCount} row(s) ${isUpdate ? 'updated' : isInsert ? 'inserted' : 'deleted'} successfully`
          : null),
        lastInsertRowid: results.lastInsertRowid || null
      },
      executionTime: results.executionTime
    });
  } catch (error) {
    console.error('Query execution error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Helper function to get database schema as text
async function getSchemaText(connectionId) {
  try {
    const dbInfo = dbConnections.get(connectionId);
    if (!dbInfo || !dbInfo.connected) {
      return null;
    }

    let schemaText = '';
    
    if (dbInfo.type === DB_TYPES.SQLITE) {
      // Get all tables
      const tables = await new Promise((resolve, reject) => {
        dbInfo.connection.all(
          "SELECT name FROM sqlite_master WHERE type='table'",
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          }
        );
      });
      
      for (const table of tables) {
        const columns = await new Promise((resolve, reject) => {
          dbInfo.connection.all(
            `PRAGMA table_info(${table.name})`,
            (err, rows) => {
              if (err) reject(err);
              else resolve(rows);
            }
          );
        });
        
        schemaText += `Table: ${table.name}\n`;
        schemaText += `Columns:\n`;
        columns.forEach(col => {
          schemaText += `  - ${col.name} (${col.type})${col.pk ? ' [PRIMARY KEY]' : ''}${col.notnull ? ' [NOT NULL]' : ''}\n`;
        });
        schemaText += '\n';
      }
    } else if (dbInfo.type === DB_TYPES.POSTGRES) {
      const tablesResult = await dbInfo.connection.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      
      for (const table of tablesResult.rows) {
        const columnsResult = await dbInfo.connection.query(`
          SELECT column_name, data_type, is_nullable, 
                 CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary
          FROM information_schema.columns c
          LEFT JOIN (
            SELECT ku.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage ku
            ON tc.constraint_name = ku.constraint_name
            WHERE tc.constraint_type = 'PRIMARY KEY'
            AND ku.table_name = $1
          ) pk ON c.column_name = pk.column_name
          WHERE table_name = $1
        `, [table.table_name]);
        
        schemaText += `Table: ${table.table_name}\n`;
        schemaText += `Columns:\n`;
        columnsResult.rows.forEach(col => {
          schemaText += `  - ${col.column_name} (${col.data_type})${col.is_primary ? ' [PRIMARY KEY]' : ''}${col.is_nullable === 'YES' ? '' : ' [NOT NULL]'}\n`;
        });
        schemaText += '\n';
      }
    } else if (dbInfo.type === DB_TYPES.MYSQL) {
      const [tables] = await dbInfo.connection.execute(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = ?
      `, [dbInfo.config.database]);
      
      for (const table of tables) {
        const [columns] = await dbInfo.connection.execute(`
          SELECT column_name, data_type, is_nullable, column_key
          FROM information_schema.columns
          WHERE table_schema = ? AND table_name = ?
        `, [dbInfo.config.database, table.table_name]);
        
        schemaText += `Table: ${table.table_name}\n`;
        schemaText += `Columns:\n`;
        columns.forEach(col => {
          schemaText += `  - ${col.column_name} (${col.data_type})${col.column_key === 'PRI' ? ' [PRIMARY KEY]' : ''}${col.is_nullable === 'YES' ? '' : ' [NOT NULL]'}\n`;
        });
        schemaText += '\n';
      }
    }
    
    return schemaText;
  } catch (error) {
    console.error('Error fetching schema:', error);
    return null;
  }
}

// Get AI assistance using OpenRouter
app.post('/api/ai/assist', async (req, res) => {
  try {
    const { query, context, action, connectionId } = req.body;
    
    if (!OPENROUTER_API_KEY) {
      // Fallback response if OpenRouter is not configured
      return res.json({
        success: true,
        response: `To use AI features, please add your OPENROUTER_API_KEY to the .env file. For now, here's a basic suggestion: ${action === 'generate' ? 'Try using SELECT * FROM table_name LIMIT 10;' : 'Consider adding indexes on frequently queried columns.'}`,
        query: action === 'generate' ? 'SELECT * FROM users LIMIT 10;' : null
      });
    }
    
    // Get database schema and type if connectionId is provided
    let schemaInfo = '';
    let dbTypeForPrompt = null;
    if (connectionId) {
      const dbInfo = dbConnections.get(connectionId);
      if (dbInfo && dbInfo.connected) {
        dbTypeForPrompt = dbInfo.type;
      }
      const schema = await getSchemaText(connectionId);
      if (schema) {
        schemaInfo = `\n\nDatabase Schema:\n${schema}\n\nIMPORTANT RULES:
- Only use the tables and columns listed above. Do not reference tables or columns that don't exist in this schema.
- When user asks for roles/types (like "admin", "manager", "user"), look for columns named: role, type, status, user_type, account_type, etc.
- When user asks for a specific person's name, use the name column.
- CRITICAL: "add [role] role" or "set [role] role" means UPDATE users SET role = '[role]' WHERE..., NOT ALTER TABLE. Only use ALTER TABLE if user explicitly asks to modify table structure.
- Do NOT assume data values exist. Generate queries that would work regardless of whether the data exists.
- If asking for "admin" and there's no role/type column, you may need to inform the user or generate a query that searches the name column, but be clear this is searching by name, not role.`;
        if (dbTypeForPrompt === DB_TYPES.SQLITE) {
          schemaInfo += `

- SQLite RULES (this database is SQLite): SQLite does NOT support "ALTER TABLE table ADD CONSTRAINT name FOREIGN KEY (...) REFERENCES ...". To add foreign keys to EXISTING tables in SQLite you MUST recreate each table: (1) CREATE TABLE new_table (all columns, plus FOREIGN KEY (col) REFERENCES other_table(id) [ON DELETE CASCADE]); (2) INSERT INTO new_table SELECT * FROM old_table; (3) DROP TABLE old_table; (4) ALTER TABLE new_table RENAME TO old_table; Wrap the whole script in PRAGMA foreign_keys=off; BEGIN TRANSACTION; ... COMMIT; PRAGMA foreign_keys=on; Use the exact column names from the schema (same order and types as PRAGMA table_info). Do not use ALTER TABLE ... ADD CONSTRAINT in SQLite.`;
        }
      }
    }
    
    let prompt = '';
    
    if (action === 'generate') {
      const dbTypeNote = dbTypeForPrompt ? ` Database type: ${dbTypeForPrompt}.` : '';
      prompt = `Generate SQL for: "${query}".${dbTypeNote}${schemaInfo}

Rules:
1. Use only tables/columns from the schema above.
2. For roles (admin, manager, user), check for role/type/status columns first.
3. For person names, use the name column.
4. If user says "add [role] role" or "set [role] role", they mean UPDATE users SET role = '[role]' WHERE..., NOT ALTER TABLE. Only use ALTER TABLE if explicitly asked to add/modify table structure.
5. If the request asks to UPDATE/CHANGE data to "random names" or "random values", generate actual random names/values in the UPDATE query. Use realistic random names like 'Alex Johnson', 'Sarah Miller', 'Michael Chen', 'Emma Davis', 'James Wilson', etc. For multiple rows, use a CASE statement with different random names based on the WHERE condition or row identifier (like id). Example: UPDATE users SET name = CASE WHEN id = 1 THEN 'Alex Johnson' WHEN id = 2 THEN 'Sarah Miller' ELSE name END WHERE name LIKE 'J%';
6. If the request asks to UPDATE/CHANGE data but doesn't specify what to change it TO (and it's not "random"), you MUST ask a clarifying question. Example: "What should I change the names to? Please specify the new name or a pattern."
7. NEVER use placeholders like "...", "?", "NewName", or incomplete WHERE clauses. Either ask for clarification or generate a complete, valid SQL query.
8. If the user asks for multiple things (like "get X and change Y"), provide ALL the SQL queries needed. For "get users and change names", provide both the SELECT query AND the UPDATE query. Explain what each query does. Separate multiple queries with blank lines or clearly label them.
9. If no role column exists, return: SELECT * FROM table_name;
10. Provide a brief explanation of what the query does, then the SQL query in a code block.`;
    } else if (action === 'optimize') {
      prompt = `You are a SQL optimization expert. Optimize this SQL query: "${query}".${schemaInfo}

Consider the database schema when optimizing. Provide the optimized query and a brief explanation.`;
    } else if (action === 'explain') {
      prompt = `Explain this SQL query in simple terms: "${query}".${schemaInfo}`;
    } else {
      prompt = `Help with this database question: "${query}".${schemaInfo}`;
    }
    
    // Call OpenRouter API
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
        'X-Title': 'AI Database Assistant Manager'
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: 'system', content: 'You are a helpful database assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,  // Lower temperature for more focused responses
        max_tokens: 400  // Increased to allow for multiple queries and explanations
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenRouter API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    let aiResponse = data.choices[0].message.content;
    
    // Extract SQL queries from response, handling markdown code blocks
    let generatedQuery = null; // Primary query (for backward compatibility)
    let allGeneratedQueries = []; // All extracted queries
    if (action === 'generate') {
      // Check for incomplete queries with placeholders (only in actual SQL, not explanations)
      const hasPlaceholders = aiResponse.includes('...') || 
                             aiResponse.includes('WHERE ...') || 
                             /WHERE\s*$/i.test(aiResponse) ||
                             /WHERE\s*\.\.\./i.test(aiResponse) ||
                             /SET\s+\w+\s*=\s*['"]NewName['"]/i.test(aiResponse) ||
                             /SET\s+\w+\s*=\s*['"]NewValue['"]/i.test(aiResponse) ||
                             /SET\s+\w+\s*=\s*['"]YourValue['"]/i.test(aiResponse) ||
                             /SET\s+\w+\s*=\s*['"]Placeholder['"]/i.test(aiResponse);
      
      // ALWAYS try to extract queries from code blocks, regardless of questions in explanation
      // Questions in explanations are fine - we still want the query
      {
        // Try to extract query from markdown code blocks first (most common format)
        // Handle multiple code blocks - extract complete queries from each
        const codeBlockRegex = /```(?:sql)?\s*([\s\S]*?)```/gi;
        const codeBlocks = [];
        let match;
        while ((match = codeBlockRegex.exec(aiResponse)) !== null) {
          codeBlocks.push(match[1].trim());
        }
        
        if (codeBlocks && codeBlocks.length > 0) {
          // Process each code block - each typically contains one complete query
          let allQueries = [];
          
          codeBlocks.forEach(blockContent => {
            if (!blockContent) return;
            
            // Trim the block content
            const trimmedBlock = blockContent.trim();
            if (!trimmedBlock) return;
            
            // Check if this block starts with a SQL keyword - if so, treat entire block as one query
            const startsWithSQL = /^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|WITH)/i.test(trimmedBlock);
            
            if (startsWithSQL) {
              // Entire block is one complete query - use it as-is
              // Ensure it ends with semicolon
              allQueries.push(trimmedBlock.endsWith(';') ? trimmedBlock : trimmedBlock + ';');
            } else {
              // Block doesn't start with SQL keyword - try to find SQL statements within it
              const sqlStatementRegex = /(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|WITH)[\s\S]*?;/gi;
              const statements = trimmedBlock.match(sqlStatementRegex);
              
              if (statements && statements.length > 0) {
                allQueries.push(...statements.map(s => s.trim()));
              } else {
                // No pattern match - check if it looks like SQL anyway (might have leading comments/whitespace)
                // Try to find SQL keyword anywhere in the block
                const sqlKeywordMatch = trimmedBlock.match(/(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|WITH)[\s\S]*/i);
                if (sqlKeywordMatch) {
                  // Found SQL keyword - extract from there to the end (or to semicolon)
                  const sqlPart = sqlKeywordMatch[0];
                  const semicolonIndex = sqlPart.indexOf(';');
                  const query = semicolonIndex !== -1 ? sqlPart.substring(0, semicolonIndex + 1) : sqlPart;
                  allQueries.push(query.trim().endsWith(';') ? query.trim() : query.trim() + ';');
                } else {
                  // Use entire block as one query
                  allQueries.push(trimmedBlock.endsWith(';') ? trimmedBlock : trimmedBlock + ';');
                }
              }
            }
          });
          
          // Debug logging
          console.log('Extracted code blocks:', codeBlocks.length);
          console.log('Extracted queries:', allQueries.length);
          if (allQueries.length > 0) {
            console.log('First query preview:', allQueries[0].substring(0, 100));
          }
          
          if (allQueries.length > 0) {
            // Store all queries
            allGeneratedQueries = allQueries.map(q => {
              const cleaned = q.trim();
              return cleaned.endsWith(';') ? cleaned : cleaned + ';';
            });
            
            // Prefer SELECT queries for the primary query (backward compatibility)
            const selectQuery = allQueries.find(q => /^SELECT/i.test(q.trim()));
            generatedQuery = (selectQuery || allQueries[0]).trim();
            // Ensure it ends with semicolon
            if (!generatedQuery.endsWith(';')) {
              generatedQuery += ';';
            }
          } else {
            // Fallback: use first code block as complete query if it looks like SQL
            const fallbackQuery = codeBlocks[0];
            if (fallbackQuery && fallbackQuery.trim().length > 0) {
              const cleaned = fallbackQuery.trim();
              generatedQuery = cleaned.endsWith(';') ? cleaned : cleaned + ';';
              allGeneratedQueries = [generatedQuery];
            }
          }
        } else {
          // Fallback: try to find SQL statement (SELECT, UPDATE, INSERT, DELETE, etc.)
          // Prefer SELECT queries if multiple exist
          const allQueries = aiResponse.match(/(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)[\s\S]*?;/gi);
          if (allQueries && allQueries.length > 0) {
            // Store all queries
            allGeneratedQueries = allQueries.map(q => q.trim());
            // Prefer SELECT queries for primary
            const selectQuery = allQueries.find(q => /^SELECT/i.test(q.trim()));
            generatedQuery = (selectQuery || allQueries[0]).trim();
          } else {
            const sqlMatch = aiResponse.match(/(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)[\s\S]*?;/i);
            if (sqlMatch) {
              generatedQuery = sqlMatch[0].trim();
              allGeneratedQueries = [generatedQuery];
            } else {
              // Last resort: if the entire response looks like SQL, use it
              const trimmedResponse = aiResponse.trim();
              if (trimmedResponse.match(/^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)/i)) {
                generatedQuery = trimmedResponse.split('\n')[0].trim();
                allGeneratedQueries = [generatedQuery];
              }
            }
          }
        }
        
        // Final validation - reject queries that contain placeholders
        const hasPlaceholder = (query) => {
          if (!query) return false;
          return query.includes('...') || 
                 /WHERE\s*\.\.\./i.test(query) || 
                 /WHERE\s*$/i.test(query) ||
                 /SET\s+\w+\s*=\s*['"]NewName['"]/i.test(query) ||
                 /SET\s+\w+\s*=\s*['"]NewValue['"]/i.test(query) ||
                 /SET\s+\w+\s*=\s*['"]YourValue['"]/i.test(query) ||
                 /SET\s+\w+\s*=\s*['"]Placeholder['"]/i.test(query);
        };
        
        // Filter out queries with placeholders from allGeneratedQueries
        allGeneratedQueries = allGeneratedQueries.filter(q => !hasPlaceholder(q));
        
        // Check primary query
        if (generatedQuery && hasPlaceholder(generatedQuery)) {
          generatedQuery = null;
          // If we have other valid queries, use the first one as primary
          if (allGeneratedQueries.length > 0) {
            generatedQuery = allGeneratedQueries[0];
          } else {
            // Preserve original AI response and append a note
            aiResponse = `${aiResponse}\n\n⚠️ Note: The extracted query contains placeholders like 'NewName'. Please specify what value you want to set.`;
          }
        }
      }
    }
    
    // Clean all queries - remove any remaining markdown or extra formatting
    const cleanQuery = (query) => {
      if (!query) return null;
      let cleaned = query
        .replace(/^```sql\s*/i, '')  // Remove opening ```sql
        .replace(/^```\s*/i, '')     // Remove opening ```
        .replace(/\s*```$/i, '')     // Remove closing ```
        .replace(/^`/g, '')          // Remove any leading backticks
        .replace(/`$/g, '')          // Remove any trailing backticks
        .trim();
      
      // Remove trailing semicolon if there are multiple (should only have one)
      const semicolonCount = (cleaned.match(/;/g) || []).length;
      if (semicolonCount > 1) {
        cleaned = cleaned.replace(/;+$/, ';');
      }
      
      // Ensure it ends with semicolon
      if (cleaned && !cleaned.endsWith(';')) {
        cleaned += ';';
      }
      
      return cleaned && cleaned.length > 0 ? cleaned : null;
    };
    
    // Clean all generated queries
    allGeneratedQueries = allGeneratedQueries.map(cleanQuery).filter(q => q !== null);
    
    // Clean primary query
    if (generatedQuery) {
      generatedQuery = cleanQuery(generatedQuery);
    }
    
    // If query was generated and we have a connection, execute it to check for results
    // Only execute SELECT queries to show result counts, not UPDATE/INSERT/DELETE
    if (action === 'generate' && generatedQuery && connectionId) {
      try {
        const dbInfo = dbConnections.get(connectionId);
        if (dbInfo && dbInfo.connected) {
          const isSelectQuery = /^SELECT/i.test(generatedQuery.trim());
          
          // Only execute SELECT queries to show result counts
          if (isSelectQuery) {
            const results = await executeQuery(dbInfo.connection, dbInfo.type, generatedQuery);
            
            // Preserve the original AI response and append result information
            // Only append if the AI response doesn't already contain result info and doesn't have multiple queries
            const hasMultipleQueries = (aiResponse.match(/```sql/gi) || []).length > 1;
            const alreadyHasResultInfo = /Found|record|results?/i.test(aiResponse);
            
            if (!alreadyHasResultInfo && !hasMultipleQueries) {
              if (results.rowCount === 0) {
                // Append info about no results found, but keep original AI response
                aiResponse = `${aiResponse}\n\n⚠️ Note: This query returned 0 results.`;
              } else {
                // Append result count info, but keep original AI response
                aiResponse = `${aiResponse}\n\n Found ${results.rowCount} record(s).`;
              }
            }
          }
        }
      } catch (queryError) {
        // If query execution fails, just use the original AI response
        console.error('Error executing generated query:', queryError);
        // Keep the original AI response
      }
    }
    
    // Ensure we have at least the primary query in the array if it exists
    if (generatedQuery && allGeneratedQueries.length === 0) {
      allGeneratedQueries = [generatedQuery];
    }
    
    // Also ensure primary query exists if we have queries (use first query as primary)
    if (allGeneratedQueries.length > 0 && !generatedQuery) {
      generatedQuery = allGeneratedQueries[0];
    }
    
    // Remove duplicates from queries array (preserve order)
    const seen = new Set();
    allGeneratedQueries = allGeneratedQueries.filter(q => {
      if (!q || q.trim().length === 0) return false;
      const normalized = q.trim().toLowerCase();
      if (seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });
    
    // CRITICAL: Ensure primary query is in the array if it exists
    if (generatedQuery && !allGeneratedQueries.includes(generatedQuery)) {
      allGeneratedQueries.unshift(generatedQuery); // Add to beginning
    }
    
    // Debug logging
    console.log('Final query extraction results:');
    console.log('- Primary query:', generatedQuery ? generatedQuery.substring(0, 100) : 'null');
    console.log('- All queries count:', allGeneratedQueries.length);
    allGeneratedQueries.forEach((q, i) => {
      const queryType = q.trim().match(/^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)/i)?.[1] || 'UNKNOWN';
      console.log(`  Query ${i + 1} [${queryType}]:`, q.substring(0, 100));
    });
    
    // ALWAYS return queries array, even if empty - this ensures frontend can always check for it
    const finalQueries = allGeneratedQueries.length > 0 
      ? allGeneratedQueries 
      : (generatedQuery ? [generatedQuery] : []);
    
    res.json({
      success: true,
      response: aiResponse,
      query: generatedQuery || null, // Primary query (for backward compatibility)
      queries: finalQueries // All extracted queries - ALWAYS an array, includes ALL types (SELECT, INSERT, UPDATE, DELETE, etc.)
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get database schema
app.get('/api/db/schema/:connectionId', async (req, res) => {
  try {
    const { connectionId } = req.params;
    
    const dbInfo = dbConnections.get(connectionId);
    if (!dbInfo || !dbInfo.connected) {
      return res.status(400).json({ 
        success: false, 
        error: 'Database connection not found' 
      });
    }
    
    let schema = { tables: [] };
    
    try {
      if (dbInfo.type === DB_TYPES.SQLITE) {
        // Get all tables
        const tables = await new Promise((resolve, reject) => {
          dbInfo.connection.all(
            "SELECT name FROM sqlite_master WHERE type='table'",
            (err, rows) => {
              if (err) reject(err);
              else resolve(rows);
            }
          );
        });
        
        // Get columns for each table
        for (const table of tables) {
          const columns = await new Promise((resolve, reject) => {
            dbInfo.connection.all(
              `PRAGMA table_info(${table.name})`,
              (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
              }
            );
          });
          
          schema.tables.push({
            name: table.name,
            columns: columns.map(col => ({
              name: col.name,
              type: col.type,
              primaryKey: col.pk === 1,
              nullable: col.notnull === 0
            }))
          });
        }
      } else if (dbInfo.type === DB_TYPES.POSTGRES) {
        const tablesResult = await dbInfo.connection.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
        `);
        
        for (const table of tablesResult.rows) {
          const columnsResult = await dbInfo.connection.query(`
            SELECT column_name, data_type, is_nullable, 
                   CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary
            FROM information_schema.columns c
            LEFT JOIN (
              SELECT ku.column_name
              FROM information_schema.table_constraints tc
              JOIN information_schema.key_column_usage ku
              ON tc.constraint_name = ku.constraint_name
              WHERE tc.constraint_type = 'PRIMARY KEY'
              AND ku.table_name = $1
            ) pk ON c.column_name = pk.column_name
            WHERE table_name = $1
          `, [table.table_name]);
          
          schema.tables.push({
            name: table.table_name,
            columns: columnsResult.rows.map(col => ({
              name: col.column_name,
              type: col.data_type,
              primaryKey: col.is_primary,
              nullable: col.is_nullable === 'YES'
            }))
          });
        }
      } else if (dbInfo.type === DB_TYPES.MYSQL) {
        const [tables] = await dbInfo.connection.execute(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = ?
        `, [dbInfo.config.database]);
        
        for (const table of tables) {
          const [columns] = await dbInfo.connection.execute(`
            SELECT column_name, data_type, is_nullable, column_key
            FROM information_schema.columns
            WHERE table_schema = ? AND table_name = ?
          `, [dbInfo.config.database, table.table_name]);
          
          schema.tables.push({
            name: table.table_name,
            columns: columns.map(col => ({
              name: col.column_name,
              type: col.data_type,
              primaryKey: col.column_key === 'PRI',
              nullable: col.is_nullable === 'YES'
            }))
          });
        }
      }
    } catch (schemaError) {
      // If schema retrieval fails, return empty schema
      console.error('Schema retrieval error:', schemaError);
    }
    
    res.json({ 
      success: true, 
      schema 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Disconnect from database
app.post('/api/db/disconnect/:connectionId', async (req, res) => {
  try {
    const { connectionId } = req.params;
    const dbInfo = dbConnections.get(connectionId);
    
    if (!dbInfo) {
      return res.status(400).json({
        success: false,
        error: 'Connection not found'
      });
    }
    
    // Close connection based on type
    if (dbInfo.type === DB_TYPES.SQLITE) {
      dbInfo.connection.close((err) => {
        if (err) console.error('Error closing SQLite connection:', err);
      });
    } else if (dbInfo.type === DB_TYPES.POSTGRES) {
      await dbInfo.connection.end();
    } else if (dbInfo.type === DB_TYPES.MYSQL) {
      await dbInfo.connection.end();
    }
    
    dbConnections.delete(connectionId);
    
    res.json({
      success: true,
      message: 'Disconnected successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  if (!OPENROUTER_API_KEY) {
    console.log('⚠️  OpenRouter API key not found. AI features will be limited.');
    console.log('   Add OPENROUTER_API_KEY to .env file for full AI functionality.');
    console.log('   Get your API key at: https://openrouter.ai/keys');
  } else {
    console.log(` OpenRouter configured with model: ${OPENROUTER_MODEL}`);
  }
});
