/**
 * Configurações de Segurança e Constantes Criptográficas — AcompanhaBrasil
 */

require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'chave_padrao_dev_minimo_32_caracteres_seguros_2026';
const HMAC_SALT = process.env.HMAC_SALT || 'salt_padrao_dev_para_anonimizacao_cidada_2026';
const JWT_EXPIRES_IN = '30m'; // 30 minutos de sessão efêmera
const MAX_FILE_SIZE_BYTES = parseInt(process.env.MAX_FILE_SIZE_BYTES || '10485760', 10); // 10MB

module.exports = {
  JWT_SECRET,
  HMAC_SALT,
  JWT_EXPIRES_IN,
  MAX_FILE_SIZE_BYTES
};
