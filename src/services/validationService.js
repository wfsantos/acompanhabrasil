/**
 * Serviço de Validação Matemática e Detecção de Divergências — AcompanhaBrasil
 * 
 * Executa as equações de integridade eleitoral e auditoria cruzada de envios.
 */

/**
 * Valida a consistência matemática dos dados do Boletim de Urna.
 * 
 * Regras:
 * 1. Comparecimento + Faltosos == Aptos (se informados)
 * 2. Soma de todos os votos (Nominais + Legenda + Brancos + Nulos) == Comparecimento
 * 3. Valores não podem ser negativos
 * 
 * @param {object} buData - Objeto contendo os dados do BU
 * @returns {object} { valido: boolean, erros: string[], avisos: string[] }
 */
function validateBuMath(buData) {
  const erros = [];
  const avisos = [];

  const aptos = parseInt(buData.aptos, 10) || 0;
  const comparecimento = parseInt(buData.comparecimento, 10) || 0;
  const faltosos = parseInt(buData.faltosos, 10) || 0;
  const brancos = parseInt(buData.brancos, 10) || 0;
  const nulos = parseInt(buData.nulos, 10) || 0;

  // Verificação de valores negativos
  if (aptos < 0 || comparecimento < 0 || faltosos < 0 || brancos < 0 || nulos < 0) {
    erros.push('Nenhum campo de contagem eleitoral pode possuir valor negativo.');
  }

  // Verificação básica de comparecimento
  if (comparecimento > aptos && aptos > 0) {
    erros.push(`Comparecimento (${comparecimento}) não pode ser maior que o total de eleitores aptos (${aptos}).`);
  }

  // Verificação Aptos = Comparecimento + Faltosos
  if (aptos > 0 && comparecimento + faltosos !== aptos) {
    erros.push(`Inconsistência na soma de eleitores: Comparecimento (${comparecimento}) + Faltosos (${faltosos}) = ${comparecimento + faltosos}, mas Aptos é ${aptos}.`);
  }

  // Verificação por Cargo e Votos Detalhados
  if (Array.isArray(buData.votosDetalhe) && buData.votosDetalhe.length > 0) {
    // Agrupa votos por cargo
    const votosPorCargo = {};
    for (const voto of buData.votosDetalhe) {
      const cargo = voto.cargo || 'PRESIDENTE';
      if (!votosPorCargo[cargo]) {
        votosPorCargo[cargo] = 0;
      }
      votosPorCargo[cargo] += parseInt(voto.quantidadeVotos, 10) || 0;
    }

    for (const [cargo, totalVotosCargo] of Object.entries(votosPorCargo)) {
      if (comparecimento > 0 && totalVotosCargo !== comparecimento) {
        erros.push(`Inconsistência no cargo ${cargo}: Total de votos apurados (${totalVotosCargo}) difere do comparecimento total da seção (${comparecimento}).`);
      }
    }
  }

  return {
    valido: erros.length === 0,
    erros,
    avisos
  };
}

/**
 * Compara dois Boletins de Urna submetidos para a mesma seção eleitoral
 * para verificar se há divergências nos votos registrados.
 * 
 * @param {object} buA - Primeiro Boletim
 * @param {object} buB - Segundo Boletim
 * @returns {object} { divergente: boolean, diferencas: object[] }
 */
function compareBoletins(buA, buB) {
  const diferencas = [];

  // Compara métricas gerais
  if (buA.comparecimento !== buB.comparecimento) {
    diferencas.push({
      campo: 'comparecimento',
      valorA: buA.comparecimento,
      valorB: buB.comparecimento,
      descricao: `Divergência de comparecimento: ${buA.comparecimento} vs ${buB.comparecimento}`
    });
  }

  if (buA.brancos !== buB.brancos) {
    diferencas.push({
      campo: 'brancos',
      valorA: buA.brancos,
      valorB: buB.brancos,
      descricao: `Divergência de votos em branco: ${buA.brancos} vs ${buB.brancos}`
    });
  }

  if (buA.nulos !== buB.nulos) {
    diferencas.push({
      campo: 'nulos',
      valorA: buA.nulos,
      valorB: buB.nulos,
      descricao: `Divergência de votos nulos: ${buA.nulos} vs ${buB.nulos}`
    });
  }

  // Compara votos de candidatos
  const mapVotosA = {};
  for (const v of (buA.votosDetalhe || [])) {
    const key = `${v.cargo}:${v.numeroCandidato}`;
    mapVotosA[key] = (mapVotosA[key] || 0) + v.quantidadeVotos;
  }

  const mapVotosB = {};
  for (const v of (buB.votosDetalhe || [])) {
    const key = `${v.cargo}:${v.numeroCandidato}`;
    mapVotosB[key] = (mapVotosB[key] || 0) + v.quantidadeVotos;
  }

  const allKeys = new Set([...Object.keys(mapVotosA), ...Object.keys(mapVotosB)]);
  for (const key of allKeys) {
    const qtdA = mapVotosA[key] || 0;
    const qtdB = mapVotosB[key] || 0;
    if (qtdA !== qtdB) {
      diferencas.push({
        campo: `voto_${key}`,
        valorA: qtdA,
        valorB: qtdB,
        descricao: `Divergência no candidato/voto ${key}: ${qtdA} votos vs ${qtdB} votos`
      });
    }
  }

  return {
    divergente: diferencas.length > 0,
    totalDiferencas: diferencas.length,
    diferencas
  };
}

module.exports = {
  validateBuMath,
  compareBoletins
};
