/**
 * Configuração de Conexão com Banco de Dados MySQL / SQLite — AcompanhaBrasil
 */

const path = require('path');
require('dotenv').config();

const DB_TYPE = (process.env.DB_TYPE || 'mysql').toLowerCase();

// Configurações do MySQL (Produção / Homologação)
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'acompanhabrasil';
const DATABASE_URL = process.env.DATABASE_URL;

// Configuração SQLite (Fallback / Testes locais autônomos)
const DB_FILE = process.env.DB_FILE || path.join(__dirname, '../../database.sqlite');

module.exports = {
  DB_TYPE,
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DATABASE_URL,
  DB_FILE
};
