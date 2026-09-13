/**
 * Testes Unitários de Criptografia e Anonimização — AcompanhaBrasil
 */

const test = require('node:test');
const assert = require('node:assert');
const {
  generateVolunteerHash,
  calculateSha256,
  signToken,
  verifyToken,
  encryptAes256,
  decryptAes256
} = require('../src/services/cryptoService');

test('Criptografia: generateVolunteerHash gera hash determinístico de 64 chars', () => {
  const hash1 = generateVolunteerHash('12345678909', '1990-01-01');
  const hash2 = generateVolunteerHash('123.456.789-09', '1990-01-01');

  assert.strictEqual(hash1.length, 64, 'O hash HMAC-SHA256 deve ter 64 caracteres');
  assert.strictEqual(hash1, hash2, 'CPFs formatados ou sem pontuação devem gerar exatamente o mesmo hash');
});

test('Criptografia: calculateSha256 calcula integridade de imagem/buffer', () => {
  const buf = Buffer.from('TESTE_IMAGEM_BU_2026');
  const hash = calculateSha256(buf);

  assert.strictEqual(hash.length, 64);
  assert.strictEqual(hash, calculateSha256('TESTE_IMAGEM_BU_2026'));
});

test('Criptografia: JWT sign e verify decodificam payload com integridade', () => {
  const payload = { uf: 'SP', zona: 1, secao: 123, volunteerHash: 'abc123hash' };
  const token = signToken(payload);

  assert.ok(typeof token === 'string' && token.length > 20);

  const decoded = verifyToken(token);
  assert.strictEqual(decoded.uf, 'SP');
  assert.strictEqual(decoded.zona, 1);
  assert.strictEqual(decoded.secao, 123);
  assert.strictEqual(decoded.volunteerHash, 'abc123hash');
});

test('Criptografia: AES-256-GCM encripta e decripta com integridade autenticada', () => {
  const textoOriginal = 'Votos confidenciais da seção 10';
  const cifrado = encryptAes256(textoOriginal);

  assert.notStrictEqual(cifrado, textoOriginal);
  assert.ok(cifrado.includes(':'), 'Deve conter iv:tag:cifrado');

  const decifrado = decryptAes256(cifrado);
  assert.strictEqual(decifrado, textoOriginal);
});
