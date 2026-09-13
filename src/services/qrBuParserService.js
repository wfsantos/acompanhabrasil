/**
 * Serviço de Parsing de QR Code do Boletim de Urna (QRBU) — AcompanhaBrasil
 * 
 * Implementa a decodificação do padrão de dados contido nos QR Codes impressos
 * no rodapé/início dos Boletins de Urna pelas urnas eletrônicas da Justiça Eleitoral (TSE).
 */

const logger = require('../utils/logger');

// Mapeamento dos códigos numéricos oficiais de cargos no TSE
const CODIGOS_CARGOS = {
  '1': 'PRESIDENTE',
  '3': 'GOVERNADOR',
  '5': 'SENADOR',
  '6': 'DEPUTADO_FEDERAL',
  '7': 'DEPUTADO_ESTADUAL',
  '8': 'DEPUTADO_DISTRITAL',
  '11': 'PREFEITO',
  '13': 'VEREADOR'
};

/**
 * Faz o parse da string decodificada de um QR Code de Boletim de Urna.
 * Suporta formatos oficiais TSE (separados por espaço, ponto-e-vírgula ou quebras de linha)
 * e formato JSON estruturado.
 * 
 * @param {string} rawQrText - Texto bruto do QR Code
 * @returns {object} Dados estruturados do Boletim de Urna
 */
function parseQrBu(rawQrText) {
  if (!rawQrText || typeof rawQrText !== 'string') {
    throw new Error('Texto do QR Code inválido ou vazio.');
  }

  const cleanText = rawQrText.trim();

  // Caso 1: Se já for um JSON válido
  if (cleanText.startsWith('{') && cleanText.endsWith('}')) {
    try {
      const parsedJson = JSON.parse(cleanText);
      return normalizeStructuredBu(parsedJson, cleanText);
    } catch (e) {
      // Segue para parse manual caso falhe
    }
  }

  // Caso 2: Formato Padrão QRBU TSE
  // Exemplo de formato comum:
  // "QRBU:1.0 UF:SP MUNI:71072 ZONA:1 SECA:123 APTO:380 COMP:320 FALT:60 CARG:1 13:150 22:140 95:10 96:20 HASH:A1B2C3D4"
  // Ou com quebras de linha: "VRQR:01.00\nUF:SP\nMUNI:71072\nZONA:1\nSECA:123..."
  
  const lines = cleanText.split(/[\r\n\s]+/).filter(Boolean);
  const data = {
    versaoQr: '1.0',
    uf: 'BR',
    municipioCodigo: '',
    municipioNome: '',
    zona: 0,
    secao: 0,
    dataEleicao: new Date().toISOString().split('T')[0],
    turno: 1,
    aptos: 0,
    comparecimento: 0,
    faltosos: 0,
    brancos: 0,
    nulos: 0,
    assinaturaUrna: '',
    cargos: {},
    votosDetalhe: []
  };

  let cargoAtual = 'PRESIDENTE';

  for (const token of lines) {
    const [key, value] = token.split(':');
    
    if (key && value !== undefined) {
      const upperKey = key.toUpperCase();
      switch (upperKey) {
        case 'QRBU':
        case 'VRQR':
          data.versaoQr = value;
          break;
        case 'UF':
        case 'UNFE':
          data.uf = value.toUpperCase();
          break;
        case 'MUNI':
        case 'CDMU':
          data.municipioCodigo = value;
          break;
        case 'NOMEMUNI':
        case 'NMMU':
          data.municipioNome = decodeURIComponent(value).replace(/_/g, ' ');
          break;
        case 'ZONA':
        case 'NRZO':
          data.zona = parseInt(value, 10) || 0;
          break;
        case 'SECA':
        case 'SECAO':
        case 'NRSE':
          data.secao = parseInt(value, 10) || 0;
          break;
        case 'APTO':
        case 'QTAP':
          data.aptos = parseInt(value, 10) || 0;
          break;
        case 'COMP':
        case 'QTCP':
          data.comparecimento = parseInt(value, 10) || 0;
          break;
        case 'FALT':
        case 'QTFA':
          data.faltosos = parseInt(value, 10) || 0;
          break;
        case 'TURNO':
        case 'NRTR':
          data.turno = parseInt(value, 10) || 1;
          break;
        case 'DATA':
        case 'DTEL':
          data.dataEleicao = value;
          break;
        case 'HASH':
        case 'ASSI':
        case 'CDAS':
          data.assinaturaUrna = value;
          break;
        case 'CARG':
        case 'CDCG':
          cargoAtual = CODIGOS_CARGOS[value] || value.toUpperCase();
          if (!data.cargos[cargoAtual]) {
            data.cargos[cargoAtual] = { nominais: [], brancos: 0, nulos: 0, total: 0 };
          }
          break;
        default:
          // Trata pares número_candidato:quantidade_votos
          if (/^\d+$/.test(key) && /^\d+$/.test(value)) {
            const numero = key;
            const qtd = parseInt(value, 10);
            
            if (!data.cargos[cargoAtual]) {
              data.cargos[cargoAtual] = { nominais: [], brancos: 0, nulos: 0, total: 0 };
            }

            // Códigos especiais de brancos (95/995) e nulos (96/996)
            if (numero === '95' || numero === '995' || upperKey === 'BRANCO') {
              data.cargos[cargoAtual].brancos += qtd;
              data.brancos += qtd;
              data.votosDetalhe.push({
                cargo: cargoAtual,
                numeroCandidato: 'BRANCO',
                nomeCandidato: 'VOTO EM BRANCO',
                partido: 'N/A',
                tipoVoto: 'BRANCO',
                quantidadeVotos: qtd
              });
            } else if (numero === '96' || numero === '996' || upperKey === 'NULO') {
              data.cargos[cargoAtual].nulos += qtd;
              data.nulos += qtd;
              data.votosDetalhe.push({
                cargo: cargoAtual,
                numeroCandidato: 'NULO',
                nomeCandidato: 'VOTO NULO',
                partido: 'N/A',
                tipoVoto: 'NULO',
                quantidadeVotos: qtd
              });
            } else {
              data.cargos[cargoAtual].nominais.push({ numero, quantidade: qtd });
              data.votosDetalhe.push({
                cargo: cargoAtual,
                numeroCandidato: numero,
                nomeCandidato: `CANDIDATO ${numero}`,
                partido: `PARTIDO ${numero.slice(0, 2)}`,
                tipoVoto: 'NOMINAL',
                quantidadeVotos: qtd
              });
            }
            data.cargos[cargoAtual].total += qtd;
          }
          break;
      }
    }
  }

  // Se o faltosos não veio explícito, calcula: aptos - comparecimento
  if (data.faltosos === 0 && data.aptos > data.comparecimento) {
    data.faltosos = data.aptos - data.comparecimento;
  }

  return normalizeStructuredBu(data, cleanText);
}

/**
 * Normaliza e consolida o objeto de BU
 */
function normalizeStructuredBu(buData, rawText = '') {
  const result = {
    versaoQr: buData.versaoQr || '1.0',
    uf: (buData.uf || 'BR').toUpperCase(),
    municipioCodigo: buData.municipioCodigo || '00000',
    municipioNome: buData.municipioNome || 'Município Eleitoral',
    zona: parseInt(buData.zona, 10) || 0,
    secao: parseInt(buData.secao, 10) || 0,
    dataEleicao: buData.dataEleicao || new Date().toISOString().split('T')[0],
    turno: parseInt(buData.turno, 10) || 1,
    aptos: parseInt(buData.aptos, 10) || 0,
    comparecimento: parseInt(buData.comparecimento, 10) || 0,
    faltosos: parseInt(buData.faltosos, 10) || 0,
    brancos: parseInt(buData.brancos, 10) || 0,
    nulos: parseInt(buData.nulos, 10) || 0,
    assinaturaUrna: buData.assinaturaUrna || 'HASH-TSE-SIMULADO',
    qrConteudoBruto: rawText || JSON.stringify(buData),
    votosDetalhe: Array.isArray(buData.votosDetalhe) ? buData.votosDetalhe : []
  };

  return result;
}

module.exports = {
  parseQrBu,
  CODIGOS_CARGOS
};
