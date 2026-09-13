/**
 * Camada de Acesso a Dados (DAO) — AcompanhaBrasil
 * 
 * Implementa driver SQLite com suporte a Promises e inicialização automática
 * de tabelas e índices.
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const { DB_FILE } = require('../config/database');
const logger = require('../utils/logger');

let dbInstance = null;

function getDatabase() {
  if (!dbInstance) {
    dbInstance = new sqlite3.Database(DB_FILE, (err) => {
      if (err) {
        logger.error('Erro ao conectar ao banco de dados SQLite:', { error: err.message });
      } else {
        logger.info(`Conectado com sucesso ao SQLite: ${DB_FILE}`);
      }
    });
  }
  return dbInstance;
}

/**
 * Executa uma consulta que retorna múltiplas linhas (SELECT)
 */
function all(sql, params = []) {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

/**
 * Executa uma consulta que retorna uma única linha
 */
function get(sql, params = []) {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

/**
 * Executa uma instrução de mutação (INSERT, UPDATE, DELETE)
 */
function run(sql, params = []) {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

/**
 * Executa um script SQL em lote (múltiplos statements)
 */
function exec(sql) {
  const db = getDatabase();
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

/**
 * Inicializa o banco de dados aplicando o schema.sql
 */
async function initDatabase() {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await exec(schemaSql);
    logger.info('Schema do banco de dados inicializado com sucesso.');
  } catch (err) {
    logger.error('Erro ao inicializar schema do banco:', { error: err.message });
    throw err;
  }
}

module.exports = {
  getDatabase,
  all,
  get,
  run,
  exec,
  initDatabase
};
