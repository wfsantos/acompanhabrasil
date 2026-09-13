/**
 * Controller de Auditoria e Painel Público — AcompanhaBrasil
 * 
 * Fornece endpoints públicos de consulta, estatísticas agregadas,
 * detecção de divergências e exportação aberta de dados.
 */

const db = require('../models/database');
const logger = require('../utils/logger');

/**
 * Lista seções eleitorais auditadas com filtros
 */
async function listSecoes(req, res) {
  try {
    const { uf, municipio, zona, secao, status, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT 
        s.id, s.uf, s.municipio, s.codigo_municipio_tse, s.zona, s.secao, 
        s.local_votacao, s.status_auditoria, s.total_envios, s.updated_at,
        (SELECT comparecimento FROM boletins WHERE secao_id = s.id ORDER BY id DESC LIMIT 1) as comparecimento_ultimo,
        (SELECT aptos FROM boletins WHERE secao_id = s.id ORDER BY id DESC LIMIT 1) as aptos_ultimo
      FROM secoes_eleitorais s
      WHERE 1=1
    `;
    const params = [];

    if (uf) {
      query += ' AND s.uf = ?';
      params.push(uf.toUpperCase());
    }

    if (municipio) {
      query += ' AND s.municipio LIKE ?';
      params.push(`%${municipio}%`);
    }

    if (zona) {
      query += ' AND s.zona = ?';
      params.push(parseInt(zona, 10));
    }

    if (secao) {
      query += ' AND s.secao = ?';
      params.push(parseInt(secao, 10));
    }

    if (status) {
      query += ' AND s.status_auditoria = ?';
      params.push(status.toUpperCase());
    }

    query += ' ORDER BY s.status_auditoria = "DIVERGENTE" DESC, s.updated_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const secoes = await db.all(query, params);

    // Contagem total para paginação
    let countQuery = 'SELECT COUNT(*) as total FROM secoes_eleitorais s WHERE 1=1';
    const countParams = params.slice(0, params.length - 2);
    if (uf) countQuery += ' AND s.uf = ?';
    if (municipio) countQuery += ' AND s.municipio LIKE ?';
    if (zona) countQuery += ' AND s.zona = ?';
    if (secao) countQuery += ' AND s.secao = ?';
    if (status) countQuery += ' AND s.status_auditoria = ?';

    const countRow = await db.get(countQuery, countParams);

    return res.status(200).json({
      sucesso: true,
      total: countRow ? countRow.total : secoes.length,
      secoes
    });
  } catch (err) {
    logger.error('Erro ao listar seções:', { error: err.message });
    return res.status(500).json({
      sucesso: false,
      erro: 'Falha ao buscar dados de seções eleitorais.'
    });
  }
}

/**
 * Retorna detalhes completos e histórico de envios de uma seção específica
 */
async function getSecaoDetails(req, res) {
  try {
    const { id } = req.params;

    const secao = await db.get('SELECT * FROM secoes_eleitorais WHERE id = ?', [id]);
    if (!secao) {
      return res.status(404).json({
        sucesso: false,
        erro: 'Seção eleitoral não encontrada.'
      });
    }

    // Busca todos os BUs submetidos para esta seção
    const boletins = await db.all(
      'SELECT id, codigo_municipio_tse, data_eleicao, turno, aptos, comparecimento, faltosos, brancos, nulos, imagem_url, imagem_sha256, qr_hash_assinatura, status_validacao, created_at FROM boletins WHERE secao_id = ? ORDER BY created_at ASC',
      [id]
    );

    // Para cada boletim, busca os votos detalhados
    for (const b of boletins) {
      b.votos = await db.all(
        'SELECT cargo, numero_candidato, nome_candidato, partido, tipo_voto, quantidade_votos FROM votos_detalhe WHERE boletim_id = ? ORDER BY cargo, quantidade_votos DESC',
        [b.id]
      );
    }

    return res.status(200).json({
      sucesso: true,
      secao,
      boletins
    });
  } catch (err) {
    logger.error('Erro ao buscar detalhes da seção:', { error: err.message });
    return res.status(500).json({
      sucesso: false,
      erro: 'Falha ao buscar detalhes da seção eleitoral.'
    });
  }
}

/**
 * Retorna estatísticas gerais e consolidadas da auditoria
 */
async function getEstatisticasGerais(req, res) {
  try {
    const totalSecoesRow = await db.get('SELECT COUNT(*) as total FROM secoes_eleitorais');
    const totalDivergentesRow = await db.get("SELECT COUNT(*) as total FROM secoes_eleitorais WHERE status_auditoria = 'DIVERGENTE'");
    const totalValidadosRow = await db.get("SELECT COUNT(*) as total FROM secoes_eleitorais WHERE status_auditoria = 'VALIDADO'");
    const totalBoletinsRow = await db.get('SELECT COUNT(*) as total, SUM(comparecimento) as totalComparecimento FROM boletins');

    // Total de votos por cargo consolidado
    const consolidacaoVotos = await db.all(`
      SELECT 
        vd.cargo,
        vd.numero_candidato,
        vd.nome_candidato,
        vd.partido,
        vd.tipo_voto,
        SUM(vd.quantidade_votos) as total_votos
      FROM votos_detalhe vd
      JOIN boletins b ON vd.boletim_id = b.id
      GROUP BY vd.cargo, vd.numero_candidato, vd.nome_candidato, vd.partido, vd.tipo_voto
      ORDER BY vd.cargo, total_votos DESC
    `);

    return res.status(200).json({
      sucesso: true,
      estatisticas: {
        totalSecoes: totalSecoesRow ? totalSecoesRow.total : 0,
        totalValidadas: totalValidadosRow ? totalValidadosRow.total : 0,
        totalDivergentes: totalDivergentesRow ? totalDivergentesRow.total : 0,
        totalBoletinsEnviados: totalBoletinsRow ? totalBoletinsRow.total : 0,
        totalVotosAuditados: (totalBoletinsRow && totalBoletinsRow.totalComparecimento) ? totalBoletinsRow.totalComparecimento : 0,
        consolidacaoVotos
      }
    });
  } catch (err) {
    logger.error('Erro ao buscar estatísticas gerais:', { error: err.message });
    return res.status(500).json({
      sucesso: false,
      erro: 'Falha ao consolidar estatísticas da auditoria.'
    });
  }
}

/**
 * Exporta os dados públicos abertos em formato JSON estruturado
 */
async function exportData(req, res) {
  try {
    const secoes = await db.all('SELECT * FROM secoes_eleitorais ORDER BY uf, municipio, zona, secao');
    const boletins = await db.all('SELECT id, secao_id, uf, municipio, zona, secao, aptos, comparecimento, faltosos, brancos, nulos, imagem_sha256, qr_hash_assinatura, status_validacao, created_at FROM boletins');
    const votos = await db.all('SELECT boletim_id, cargo, numero_candidato, nome_candidato, partido, tipo_voto, quantidade_votos FROM votos_detalhe');

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="acompanhabrasil_dados_abertos.json"');

    return res.status(200).json({
      metadata: {
        projeto: 'AcompanhaBrasil — Auditoria Cidadã',
        versao: '1.0',
        licenca: 'MIT',
        dataExtracao: new Date().toISOString()
      },
      secoes,
      boletins,
      votos
    });
  } catch (err) {
    logger.error('Erro ao exportar dados:', { error: err.message });
    return res.status(500).json({
      sucesso: false,
      erro: 'Falha ao exportar dados públicos.'
    });
  }
}

module.exports = {
  listSecoes,
  getSecaoDetails,
  getEstatisticasGerais,
  exportData
};
