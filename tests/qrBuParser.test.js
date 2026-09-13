/**
 * Testes Unitários de Decodificação e Parsing de QR Code de BU — AcompanhaBrasil
 */

const test = require('node:test');
const assert = require('node:assert');
const { parseQrBu } = require('../src/services/qrBuParserService');

test('QRBU Parser: Decodifica string oficial de QRBU com formato de tokens', () => {
  const mockQr = 'QRBU:1.0 UF:SP MUNI:71072 ZONA:1 SECA:123 APTO:400 COMP:350 FALT:50 CARG:1 13:170 22:160 95:8 96:12 HASH:A1B2C3D4';
  const result = parseQrBu(mockQr);

  assert.strictEqual(result.uf, 'SP');
  assert.strictEqual(result.municipioCodigo, '71072');
  assert.strictEqual(result.zona, 1);
  assert.strictEqual(result.secao, 123);
  assert.strictEqual(result.aptos, 400);
  assert.strictEqual(result.comparecimento, 350);
  assert.strictEqual(result.faltosos, 50);
  assert.strictEqual(result.brancos, 8);
  assert.strictEqual(result.nulos, 12);
  assert.strictEqual(result.assinaturaUrna, 'A1B2C3D4');

  assert.ok(Array.isArray(result.votosDetalhe));
  assert.strictEqual(result.votosDetalhe.length, 4);

  const voto13 = result.votosDetalhe.find(v => v.numeroCandidato === '13');
  assert.ok(voto13);
  assert.strictEqual(voto13.quantidadeVotos, 170);
});

test('QRBU Parser: Decodifica payload em formato JSON estruturado', () => {
  const jsonQr = JSON.stringify({
    uf: 'RJ',
    municipioCodigo: '60011',
    municipioNome: 'Rio de Janeiro',
    zona: 15,
    secao: 80,
    aptos: 300,
    comparecimento: 250,
    faltosos: 50,
    brancos: 5,
    nulos: 10,
    votosDetalhe: [
      { cargo: 'PRESIDENTE', numeroCandidato: '10', quantidadeVotos: 120 },
      { cargo: 'PRESIDENTE', numeroCandidato: '20', quantidadeVotos: 115 },
      { cargo: 'PRESIDENTE', numeroCandidato: 'BRANCO', quantidadeVotos: 5 },
      { cargo: 'PRESIDENTE', numeroCandidato: 'NULO', quantidadeVotos: 10 }
    ]
  });

  const result = parseQrBu(jsonQr);
  assert.strictEqual(result.uf, 'RJ');
  assert.strictEqual(result.zona, 15);
  assert.strictEqual(result.secao, 80);
  assert.strictEqual(result.comparecimento, 250);
  assert.strictEqual(result.votosDetalhe.length, 4);
});
