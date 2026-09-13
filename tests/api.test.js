/**
 * Testes de Integração de API — AcompanhaBrasil
 */

const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../src/server');

test('API /health: Retorna 200 OK com metadados do projeto', async () => {
  const res = await request(app).get('/health');
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.status, 'OK');
  assert.strictEqual(res.body.projeto, 'AcompanhaBrasil');
});

test('API /api/auth/validar-voluntario: Rejeita CPF inválido com status 422', async () => {
  const res = await request(app)
    .post('/api/auth/validar-voluntario')
    .send({ cpf: '111.111.111-11', dataNascimento: '1990-01-01' });

  assert.strictEqual(res.statusCode, 422);
  assert.strictEqual(res.body.sucesso, false);
});

test('API /api/auth/validar-voluntario: Valida CPF correto e retorna token JWT sem expor CPF', async () => {
  // CPF válido de teste gerado
  const res = await request(app)
    .post('/api/auth/validar-voluntario')
    .send({ cpf: '52998224725', dataNascimento: '1990-05-15' });

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.sucesso, true);
  assert.ok(res.body.token, 'Deve retornar token JWT');
  assert.ok(res.body.secaoInfo.zona, 'Deve retornar Zona Eleitoral');
  assert.strictEqual(res.body.cpf, undefined, 'CPF NUNCA deve ser retornado na resposta');
});

test('API /api/auth/validar-voluntario: Aplica com assertividade total os dados de seção informados pelo voluntário', async () => {
  const res = await request(app)
    .post('/api/auth/validar-voluntario')
    .send({
      cpf: '52998224725',
      dataNascimento: '1990-05-15',
      uf: 'SP',
      municipio: 'Campinas',
      zona: 275,
      secao: 142
    });

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.sucesso, true);
  assert.strictEqual(res.body.secaoInfo.uf, 'SP');
  assert.strictEqual(res.body.secaoInfo.municipio, 'Campinas');
  assert.strictEqual(res.body.secaoInfo.zona, 275);
  assert.strictEqual(res.body.secaoInfo.secao, 142);
  assert.strictEqual(res.body.secaoInfo.origem, 'CONFIRMADO_PELO_ELEITOR');
});

test('API /api/audit/secoes: Lista seções públicas com sucesso', async () => {
  const res = await request(app).get('/api/audit/secoes');
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.sucesso, true);
  assert.ok(Array.isArray(res.body.secoes));
});

test('API /api/audit/estatisticas: Retorna métricas consolidadas', async () => {
  const res = await request(app).get('/api/audit/estatisticas');
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.sucesso, true);
  assert.ok('totalSecoes' in res.body.estatisticas);
});
