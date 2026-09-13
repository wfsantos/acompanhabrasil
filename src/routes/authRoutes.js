/**
 * Rotas de Autenticação e Validação Cidadã — AcompanhaBrasil
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/validar-voluntario
router.post('/validar-voluntario', authController.validateVolunteer);

module.exports = router;
