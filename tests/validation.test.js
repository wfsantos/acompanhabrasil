/**
 * Testes Unitários de Validação Matemática e Detecção de Divergências — AcompanhaBrasil
 */

const test = require('node:test');
const assert = require('node:assert');
const { validateBuMath, compareBoletins } = require('../src/services/validationService');

test('Validação Matemática: Aprova BU com consistência perfeita', () => {
  const buConsistente = {
    aptos: 400,
    comparecimento: 350,
    faltosos: 50,
    brancos: 10,
    nulos: 15,
    votosDetalhe: [
      { cargo: 'PRESIDENTE', numeroCandidato: '13', quantidadeVotos: 165 },
      { cargo: 'PRESIDENTE', numeroCandidato: '22', quantidadeVotos: 160 },
      { cargo: 'PRESIDENTE', numeroCandidato: 'BRANCO', quantidadeVotos: 10 },
      { cargo: 'PRESIDENTE', numeroCandidato: 'NULO', quantidadeVotos: 15 }
    ]
  };

  const resultado = validateBuMath(buConsistente);
  assert.strictEqual(resultado.valido, true, 'Deve ser válido');
  assert.strictEqual(resultado.erros.length, 0);
});

test('Validação Matemática: Reprova BU onde soma de votos não bate com comparecimento', () => {
  const buInconsistente = {
    aptos: 400,
    comparecimento: 350,
    faltosos: 50,
    brancos: 10,
    nulos: 15,
    votosDetalhe: [
      { cargo: 'PRESIDENTE', numeroCandidato: '13', quantidadeVotos: 200 }, // Total = 385 != 350
      { cargo: 'PRESIDENTE', numeroCandidato: '22', quantidadeVotos: 160 },
      { cargo: 'PRESIDENTE', numeroCandidato: 'BRANCO', quantidadeVotos: 10 },
      { cargo: 'PRESIDENTE', numeroCandidato: 'NULO', quantidadeVotos: 15 }
    ]
  };

  const resultado = validateBuMath(buInconsistente);
  assert.strictEqual(resultado.valido, false, 'Deve ser inválido');
  assert.ok(resultado.erros.some(e => e.includes('difere do comparecimento')));
});

test('Detecção de Divergência: Detecta quando dois BUs da mesma seção têm contagens diferentes', () => {
  const buA = {
    comparecimento: 350,
    brancos: 10,
    nulos: 15,
    votosDetalhe: [
      { cargo: 'PRESIDENTE', numeroCandidato: '13', quantidadeVotos: 165 },
      { cargo: 'PRESIDENTE', numeroCandidato: '22', quantidadeVotos: 160 }
    ]
  };

  const buB = {
    comparecimento: 350,
    brancos: 10,
    nulos: 15,
    votosDetalhe: [
      { cargo: 'PRESIDENTE', numeroCandidato: '13', quantidadeVotos: 175 }, // Divergente
      { cargo: 'PRESIDENTE', numeroCandidato: '22', quantidadeVotos: 150 }
    ]
  };

  const comparacao = compareBoletins(buA, buB);
  assert.strictEqual(comparacao.divergente, true);
  assert.ok(comparacao.diferencas.length > 0);
});
