/**
 * Camada de Acesso a Dados (DAO) — AcompanhaBrasil
 * 
 * Suporte nativo e otimizado a MySQL (com pool de conexões) e fallback SQLite.
 * Fornece interface unificada baseada em Promises: all(), get(), run(), exec(), initDatabase().
 */

const fs = require('fs');
const path = require('path');
const {
  DB_TYPE,
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DATABASE_URL,
  DB_FILE
} = require('../config/database');
const logger = require('../utils/logger');

let mysqlPool = null;
let sqliteInstance = null;

// Determina se o driver ativo é MySQL
const isMysql = DB_TYPE === 'mysql';

/**
 * Obtém ou inicializa o pool de conexões MySQL
 */
function getMysqlPool() {
  if (!mysqlPool) {
    const mysql = require('mysql2/promise');
    
    if (DATABASE_URL) {
      mysqlPool = mysql.createPool({
        uri: DATABASE_URL,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        multipleStatements: true
      });
    } else {
      mysqlPool = mysql.createPool({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        multipleStatements: true,
        charset: 'utf8mb4'
      });
    }
    logger.info(`Pool de conexões MySQL inicializado com sucesso [${DB_HOST}:${DB_PORT}/${DB_NAME}].`);
  }
  return mysqlPool;
}

/**
 * Obtém ou inicializa a instância SQLite (Fallback / Testes locais)
 */
function getSqliteDb() {
  if (!sqliteInstance) {
    const sqlite3 = require('sqlite3').verbose();
    sqliteInstance = new sqlite3.Database(DB_FILE, (err) => {
      if (err) {
        logger.error('Erro ao conectar ao banco SQLite:', { error: err.message });
      } else {
        logger.info(`Conectado ao banco SQLite local: ${DB_FILE}`);
      }
    });
  }
  return sqliteInstance;
}

/**
 * Executa uma consulta que retorna múltiplas linhas (SELECT)
 */
async function all(sql, params = []) {
  if (isMysql) {
    const pool = getMysqlPool();
    const [rows] = await pool.execute(sql, params);
    return rows;
  } else {
    const db = getSqliteDb();
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

/**
 * Executa uma consulta que retorna uma única linha
 */
async function get(sql, params = []) {
  if (isMysql) {
    const pool = getMysqlPool();
    const [rows] = await pool.execute(sql, params);
    return rows && rows.length > 0 ? rows[0] : null;
  } else {
    const db = getSqliteDb();
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
  }
}

/**
 * Executa uma instrução de mutação (INSERT, UPDATE, DELETE)
 * Retorna { lastID, changes }
 */
async function run(sql, params = []) {
  if (isMysql) {
    const pool = getMysqlPool();
    const [result] = await pool.execute(sql, params);
    return {
      lastID: result.insertId,
      changes: result.affectedRows
    };
  } else {
    const db = getSqliteDb();
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }
}

/**
 * Executa um script SQL em lote (múltiplos statements)
 */
async function exec(sql) {
  if (isMysql) {
    const pool = getMysqlPool();
    await pool.query(sql);
  } else {
    const db = getSqliteDb();
    return new Promise((resolve, reject) => {
      db.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

/**
 * Inicializa as tabelas e views do banco de dados a partir do schema.sql
 */
async function initDatabase() {
  try {
    if (isMysql) {
      const schemaPath = path.join(__dirname, 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        try {
          const pool = getMysqlPool();
          await pool.query(schemaSql);
          logger.info('Schema MySQL inicializado com sucesso.');
        } catch (mysqlErr) {
          logger.warn(`Aviso de inicialização MySQL: ${mysqlErr.message}. Certifique-se de que o servidor MySQL está ativo.`);
        }
      }
    } else {
      const sqliteSchemaPath = path.join(__dirname, 'schema_sqlite.sql');
      if (fs.existsSync(sqliteSchemaPath)) {
        const schemaSql = fs.readFileSync(sqliteSchemaPath, 'utf8');
        await exec(schemaSql);
        logger.info('Schema SQLite inicializado com sucesso.');
      }
    }
  } catch (err) {
    logger.error('Erro ao inicializar schema do banco:', { error: err.message });
  }
}

module.exports = {
  isMysql,
  all,
  get,
  run,
  exec,
  initDatabase
};
