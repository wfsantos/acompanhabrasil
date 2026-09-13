/**
 * Controller de Validação e Autenticação Cidadã — AcompanhaBrasil
 * 
 * Processa a validação inicial do voluntário sem persistir nenhum dado pessoal (LGPD).
 */

const { isValidCpf, fetchEleitorSecao } = require('../services/tseService');
const { generateVolunteerHash, signToken } = require('../services/cryptoService');
const logger = require('../utils/logger');

/**
 * Valida o voluntário a partir de CPF e Data de Nascimento,
 * permitindo confirmação ou personalização exata de UF, Município, Zona e Seção.
 */
async function validateVolunteer(req, res) {
  try {
    const { cpf, dataNascimento, uf, municipio, zona, secao, localVotacao } = req.body;

    if (!cpf || !dataNascimento) {
      return res.status(400).json({
        sucesso: false,
        erro: 'CPF e Data de Nascimento são campos obrigatórios.'
      });
    }

    const cleanCpf = cpf.toString().replace(/\D/g, '');
    if (!isValidCpf(cleanCpf)) {
      return res.status(422).json({
        sucesso: false,
        erro: 'CPF inválido. Verifique os dígitos informados.'
      });
    }

    // Consulta ou aplica dados assertivos da Seção
    const secaoInfo = await fetchEleitorSecao(cleanCpf, dataNascimento, {
      uf,
      municipio,
      zona,
      secao,
      localVotacao
    });

    // Gera Hash Irreversível de Identificação Cidadã
    const volunteerHash = generateVolunteerHash(cleanCpf, dataNascimento);

    // Gera Token JWT efêmero com os dados da seção e hash de sessão
    const token = signToken({
      volunteerHash,
      uf: secaoInfo.uf,
      municipio: secaoInfo.municipio,
      codigoMunicipioTse: secaoInfo.codigoMunicipioTse,
      zona: secaoInfo.zona,
      secao: secaoInfo.secao
    });

    logger.info('Validação cidadã concluída com sucesso', {
      uf: secaoInfo.uf,
      municipio: secaoInfo.municipio,
      zona: secaoInfo.zona,
      secao: secaoInfo.secao,
      origem: secaoInfo.origem
    });

    // Retorna dados públicos da seção e token. NENHUM CPF é retornado!
    return res.status(200).json({
      sucesso: true,
      mensagem: 'Voluntário validado com sucesso.',
      token,
      secaoInfo: {
        uf: secaoInfo.uf,
        municipio: secaoInfo.municipio,
        codigoMunicipioTse: secaoInfo.codigoMunicipioTse,
        zona: secaoInfo.zona,
        secao: secaoInfo.secao,
        localVotacao: secaoInfo.localVotacao,
        eleicao: secaoInfo.eleicao,
        turno: secaoInfo.turno,
        origem: secaoInfo.origem
      }
    });

  } catch (err) {
    logger.error('Erro na validação do voluntário:', { error: err.message });
    return res.status(500).json({
      sucesso: false,
      erro: err.message || 'Erro interno ao validar seção do voluntário.'
    });
  }
}

module.exports = {
  validateVolunteer
};
