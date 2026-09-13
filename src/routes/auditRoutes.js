/**
 * Rotas do Painel Público de Auditoria e Transparência — AcompanhaBrasil
 */

const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');

// GET /api/audit/secoes - Lista seções com filtros e status
router.get('/secoes', auditController.listSecoes);

// GET /api/audit/secoes/:id - Detalhes completos e histórico de envios da seção
router.get('/secoes/:id', auditController.getSecaoDetails);

// GET /api/audit/estatisticas - Métricas consolidadas e apuração popular
router.get('/estatisticas', auditController.getEstatisticasGerais);

// GET /api/audit/exportar - Download de dados abertos em JSON
router.get('/exportar', auditController.exportData);

module.exports = router;
