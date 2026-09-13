/**
 * Serviço de Criptografia e Anonimização — AcompanhaBrasil
 * 
 * Implementa:
 * 1. Anonimização irreversível de voluntário (HMAC-SHA256)
 * 2. Hash de integridade de imagens e arquivos (SHA-256)
 * 3. Encriptação simétrica de payload (AES-256-GCM)
 * 4. Geração e validação de tokens JWT de sessão
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, HMAC_SALT, JWT_EXPIRES_IN } = require('../config/security');

/**
 * Gera hash criptográfico pseudo-anônimo para o voluntário a partir de CPF e Data de Nascimento.
 * Este hash impede duplicidade de submissões fraudulentas sem jamais salvar o CPF.
 * 
 * @param {string} cpf - CPF sanitizado (apenas dígitos)
 * @param {string} dataNascimento - Data no formato YYYY-MM-DD
 * @returns {string} Hash SHA-256 hexadecimal
 */
function generateVolunteerHash(cpf, dataNascimento) {
  if (!cpf || !dataNascimento) {
    throw new Error('CPF e Data de Nascimento são obrigatórios para gerar o hash do voluntário.');
  }
  const cleanCpf = cpf.toString().replace(/\D/g, '');
  const cleanDate = dataNascimento.toString().trim();
  const input = `${cleanCpf}:${cleanDate}`;
  
  return crypto.createHmac('sha256', HMAC_SALT).update(input).digest('hex');
}

/**
 * Calcula o hash SHA-256 de um buffer (imagem) ou string para garantir imutabilidade.
 * 
 * @param {Buffer|string} data - Conteúdo a ser hasheado
 * @returns {string} Hash SHA-256 hexadecimal
 */
function calculateSha256(data) {
  if (!data) return '';
  const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Emite token JWT de sessão efêmera assinado digitalmente.
 * 
 * @param {object} payload - Dados da sessão (zona, secao, volunteer_hash)
 * @returns {string} Token JWT
 */
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verifica e decodifica um token JWT.
 * 
 * @param {string} token - Token JWT recebido no Header Authorization
 * @returns {object} Payload decodificado
 */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/**
 * Criptografa texto usando AES-256-GCM (Criptografia autenticada).
 * 
 * @param {string} text - Texto plano
 * @param {string} secretKeyHex - Chave de 32 bytes em hex ou buffer
 * @returns {string} Formato iv:authTag:encryptedHex
 */
function encryptAes256(text, secretKeyHex = null) {
  const key = secretKeyHex 
    ? Buffer.from(secretKeyHex, 'hex') 
    : crypto.createHash('sha256').update(JWT_SECRET).digest();
  
  const iv = crypto.randomBytes(12); // 96 bits para GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  
  return `${iv.toString('hex')}:${tag}:${encrypted}`;
}

/**
 * Descriptografa texto cifrado via AES-256-GCM.
 * 
 * @param {string} cipherString - Formato iv:authTag:encryptedHex
 * @param {string} secretKeyHex - Chave de 32 bytes
 * @returns {string} Texto original decifrado
 */
function decryptAes256(cipherString, secretKeyHex = null) {
  const parts = cipherString.split(':');
  if (parts.length !== 3) {
    throw new Error('Formato cifrado inválido para AES-256-GCM');
  }
  
  const [ivHex, tagHex, encryptedHex] = parts;
  const key = secretKeyHex 
    ? Buffer.from(secretKeyHex, 'hex') 
    : crypto.createHash('sha256').update(JWT_SECRET).digest();
  
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

module.exports = {
  generateVolunteerHash,
  calculateSha256,
  signToken,
  verifyToken,
  encryptAes256,
  decryptAes256
};
