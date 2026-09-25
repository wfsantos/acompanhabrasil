/**
 * Controller de Boletins de Urna (BUs) — AcompanhaBrasil
 * 
 * Gerencia o parsing, recepção, validação criptográfica e persistência de BUs.
 */

const fs = require('fs');
const path = require('path');
const db = require('../models/database');
const { parseQrBu } = require('../services/qrBuParserService');
const { validateBuMath, compareBoletins } = require('../services/validationService');
const { calculateSha256 } = require('../services/cryptoService');
const logger = require('../utils/logger');

/**
 * Endpoint para decodificar texto de QR Code e retornar os dados estruturados e validação
 */
async function parseQr(req, res) {
  try {
    const { qrText } = req.body;
    if (!qrText) {
      return res.status(400).json({
        sucesso: false,
        erro: 'Texto do QR Code não informado.'
      });
    }

    const buData = parseQrBu(qrText);
    const validacao = validateBuMath(buData);

    return res.status(200).json({
      sucesso: true,
      buData,
      validacao
    });
  } catch (err) {
    logger.error('Erro no parsing do QR Code:', { error: err.message });
    return res.status(422).json({
      sucesso: false,
      erro: err.message || 'Falha ao processar dados do QR Code do Boletim de Urna.'
    });
  }
}

/**
 * Submete e registra um novo Boletim de Urna
 */
async function submitBoletim(req, res) {
  try {
    const userSession = req.user; // Injetado pelo middleware JWT
    if (!userSession || !userSession.volunteerHash) {
      return res.status(401).json({
        sucesso: false,
        erro: 'Sessão inválida ou expirada. Realize a validação inicial novamente.'
      });
    }

    let {
      uf,
      municipio,
      codigoMunicipioTse,
      zona,
      secao,
      dataEleicao,
      turno,
      aptos,
      comparecimento,
      faltosos,
      brancos,
      nulos,
      qrConteudoBruto,
      qrHashAssinatura,
      votosDetalhe,
      imagemBase64
    } = req.body;

    // Se votosDetalhe vier como string JSON via multipart/form-data
    if (typeof votosDetalhe === 'string') {
      try {
        votosDetalhe = JSON.parse(votosDetalhe);
      } catch (e) {
        votosDetalhe = [];
      }
    }

    // Normaliza valores numéricos
    zona = parseInt(zona || userSession.zona, 10);
    secao = parseInt(secao || userSession.secao, 10);
    uf = (uf || userSession.uf || 'BR').toUpperCase();
    municipio = municipio || userSession.municipio || 'Município Desconhecido';
    codigoMunicipioTse = codigoMunicipioTse || userSession.codigoMunicipioTse || '';
    aptos = parseInt(aptos, 10) || 0;
    comparecimento = parseInt(comparecimento, 10) || 0;
    faltosos = parseInt(faltosos, 10) || 0;
    brancos = parseInt(brancos, 10) || 0;
    nulos = parseInt(nulos, 10) || 0;
    turno = parseInt(turno, 10) || 1;
    dataEleicao = dataEleicao || new Date().toISOString().split('T')[0];

    // Processamento da imagem
    let imagemUrl = '';
    let imagemSha256 = '';

    if (req.file) {
      imagemUrl = `/uploads/${req.file.filename}`;
      const fileBuffer = fs.readFileSync(req.file.path);
      imagemSha256 = calculateSha256(fileBuffer);
    } else if (imagemBase64) {
      const matches = imagemBase64.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
      const buffer = matches ? Buffer.from(matches[2], 'base64') : Buffer.from(imagemBase64, 'base64');
      
      const uploadsDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const fileName = `bu_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
      const filePath = path.join(uploadsDir, fileName);
      fs.writeFileSync(filePath, buffer);

      imagemUrl = `/uploads/${fileName}`;
      imagemSha256 = calculateSha256(buffer);
    }

    if (!imagemUrl) {
      return res.status(400).json({
        sucesso: false,
        erro: 'É obrigatório enviar a fotografia do Boletim de Urna para fins de auditoria pública.'
      });
    }

    if (!Array.isArray(votosDetalhe) || votosDetalhe.length === 0 || comparecimento <= 0) {
      return res.status(422).json({
        sucesso: false,
        erro: 'Submissão rejeitada: O Boletim de Urna deve conter dados de votação apurados e comparecimento maior que zero.'
      });
    }

    // Executa Validação Matemática
    const buParaValidar = {
      aptos,
      comparecimento,
      faltosos,
      brancos,
      nulos,
      votosDetalhe
    };
    const validacao = validateBuMath(buParaValidar);
    const statusValidacao = validacao.valido ? 'VALIDO' : 'INCONSISTENTE_MATEMATICO';

    // 1. Busca ou cria a seção eleitoral
    let secaoRow = await db.get(
      'SELECT id, status_auditoria, total_envios FROM secoes_eleitorais WHERE uf = ? AND municipio = ? AND zona = ? AND secao = ?',
      [uf, municipio, zona, secao]
    );

    let secaoId;
    if (!secaoRow) {
      const insertSecao = await db.run(
        `INSERT INTO secoes_eleitorais (uf, municipio, codigo_municipio_tse, zona, secao, status_auditoria, total_envios)
         VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [uf, municipio, codigoMunicipioTse, zona, secao, statusValidacao]
      );
      secaoId = insertSecao.lastID;
    } else {
      secaoId = secaoRow.id;
      await db.run(
        'UPDATE secoes_eleitorais SET total_envios = total_envios + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [secaoId]
      );
    }

    // 2. Insere o Boletim de Urna
    const insertBu = await db.run(
      `INSERT INTO boletins (
        secao_id, codigo_municipio_tse, uf, municipio, zona, secao, data_eleicao, turno,
        aptos, comparecimento, faltosos, brancos, nulos,
        qr_conteudo_bruto, qr_hash_assinatura, imagem_url, imagem_sha256,
        volunteer_hash, status_validacao
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        secaoId, codigoMunicipioTse, uf, municipio, zona, secao, dataEleicao, turno,
        aptos, comparecimento, faltosos, brancos, nulos,
        qrConteudoBruto || '', qrHashAssinatura || '', imagemUrl, imagemSha256,
        userSession.volunteerHash, statusValidacao
      ]
    );

    const boletimId = insertBu.lastID;

    // 3. Insere detalhamento dos votos
    if (Array.isArray(votosDetalhe) && votosDetalhe.length > 0) {
      for (const voto of votosDetalhe) {
        await db.run(
          `INSERT INTO votos_detalhe (
            boletim_id, cargo, numero_candidato, nome_candidato, partido, tipo_voto, quantidade_votos
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            boletimId,
            voto.cargo || 'PRESIDENTE',
            voto.numeroCandidato || '00',
            voto.nomeCandidato || '',
            voto.partido || '',
            voto.tipoVoto || 'NOMINAL',
            parseInt(voto.quantidadeVotos, 10) || 0
          ]
        );
      }
    }

    // 4. Executa verificação cruzada de divergências com outros BUs da mesma seção
    const boletinsAnteriores = await db.all(
      'SELECT * FROM boletins WHERE secao_id = ? AND id != ?',
      [secaoId, boletimId]
    );

    let temDivergencia = false;
    let detalhesDivergencia = null;

    if (boletinsAnteriores.length > 0) {
      for (const buAntigo of boletinsAnteriores) {
        const votosAntigos = await db.all(
          'SELECT cargo, numero_candidato as numeroCandidato, quantidade_votos as quantidadeVotos FROM votos_detalhe WHERE boletim_id = ?',
          [buAntigo.id]
        );
        const compResult = compareBoletins(
          { ...buParaValidar, votosDetalhe },
          { ...buAntigo, votosDetalhe: votosAntigos }
        );

        if (compResult.divergente) {
          temDivergencia = true;
          detalhesDivergencia = compResult;
          break;
        }
      }

      if (temDivergencia) {
        await db.run(
          "UPDATE secoes_eleitorais SET status_auditoria = 'DIVERGENTE' WHERE id = ?",
          [secaoId]
        );
        await db.run(
          "UPDATE boletins SET status_validacao = 'DIVERGENTE' WHERE id = ?",
          [boletimId]
        );
      } else {
        await db.run(
          "UPDATE secoes_eleitorais SET status_auditoria = 'VALIDADO' WHERE id = ?",
          [secaoId]
        );
      }
    } else if (validacao.valido) {
      await db.run(
        "UPDATE secoes_eleitorais SET status_auditoria = 'VALIDADO' WHERE id = ?",
        [secaoId]
      );
    }

    logger.info('Boletim de Urna registrado com sucesso', {
      boletimId,
      secaoId,
      uf,
      zona,
      secao,
      status: temDivergencia ? 'DIVERGENTE' : statusValidacao
    });

    return res.status(201).json({
      sucesso: true,
      mensagem: 'Boletim de Urna recebido e auditado com sucesso!',
      registro: {
        boletimId,
        secaoId,
        uf,
        municipio,
        zona,
        secao,
        imagemSha256,
        statusAuditoria: temDivergencia ? 'DIVERGENTE' : statusValidacao,
        validacaoMatematica: validacao,
        divergenciaDetectada: temDivergencia,
        detalhesDivergencia
      }
    });

  } catch (err) {
    logger.error('Erro ao submeter Boletim de Urna:', { error: err.message });
    return res.status(500).json({
      sucesso: false,
      erro: err.message || 'Falha interna ao registrar Boletim de Urna.'
    });
  }
}

module.exports = {
  parseQr,
  submitBoletim
};
