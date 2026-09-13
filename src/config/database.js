/**
 * Configuração de Conexão com Banco de Dados — AcompanhaBrasil
 */

const path = require('path');
require('dotenv').config();

const DB_TYPE = process.env.DB_TYPE || 'sqlite';
const DB_FILE = process.env.DB_FILE || path.join(__dirname, '../../database.sqlite');
const DATABASE_URL = process.env.DATABASE_URL;

module.exports = {
  DB_TYPE,
  DB_FILE,
  DATABASE_URL
};
