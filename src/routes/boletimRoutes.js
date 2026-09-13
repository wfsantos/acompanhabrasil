/**
 * Rotas de Recepção e Processamento de Boletins de Urna — AcompanhaBrasil
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const boletimController = require('../controllers/boletimController');
const { verifyToken } = require('../services/cryptoService');
const { MAX_FILE_SIZE_BYTES } = require('../config/security');

// Configuração do Multer para upload de imagens
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `bu-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Apenas imagens no formato JPG, PNG ou WEBP são permitidas.'));
  }
});

// Middleware de Autenticação JWT para rotas protegidas de submissão
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      sucesso: false,
      erro: 'Token de autenticação não fornecido. Realize a validação inicial do voluntário.'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      sucesso: false,
      erro: 'Token inválido ou expirado. Por favor, reinicie a validação da seção.'
    });
  }
}

// POST /api/boletins/parse-qr (Rota pública para teste e auxílio ao cliente)
router.post('/parse-qr', boletimController.parseQr);

// POST /api/boletins (Rota protegida para envio oficial do BU)
router.post('/', authMiddleware, upload.single('imagem'), boletimController.submitBoletim);

module.exports = router;
