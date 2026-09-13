/**
 * Servidor Principal da Aplicação — AcompanhaBrasil
 * 
 * Versão: 1.0.0
 * Licença: MIT
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { initDatabase } = require('./models/database');
const logger = require('./utils/logger');

const authRoutes = require('./routes/authRoutes');
const boletimRoutes = require('./routes/boletimRoutes');
const auditRoutes = require('./routes/auditRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Garante que a pasta de uploads exista
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 1. Configurações de Segurança HTTP (Helmet)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net", "https://cdn.tailwindcss.com", "https://unpkg.com"],
      workerSrc: ["'self'", "blob:", "https://cdn.jsdelivr.net", "https://unpkg.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdn.tailwindcss.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com", "data:"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", "https://cdn.jsdelivr.net", "https://unpkg.com", "blob:"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// 2. Habilita CORS
app.use(cors());

// 3. Rate Limiter para proteção contra ataques de negação de serviço / abuso
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200, // Limite de requisições por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    sucesso: false,
    erro: 'Muitas requisições enviadas a partir deste IP. Por favor, tente novamente em alguns minutos.'
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // Limite mais restrito para validação de eleitor
  message: {
    sucesso: false,
    erro: 'Limite de tentativas de validação excedido. Tente novamente em 15 minutos.'
  }
});

app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

// 4. Middlewares de Parsing
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// 5. Servir Arquivos Estáticos (Frontend e Imagens de BUs enviadas)
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(uploadDir));

// 6. Registro das Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/boletins', boletimRoutes);
app.use('/api/audit', auditRoutes);

// 7. Rota de Verificação de Saúde (Healthcheck)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    projeto: 'AcompanhaBrasil',
    versao: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 8. Tratamento de Erros Global
app.use((err, req, res, next) => {
  logger.error('Erro não tratado na aplicação:', { error: err.message, stack: err.stack });
  res.status(err.status || 500).json({
    sucesso: false,
    erro: err.message || 'Erro interno no servidor.'
  });
});

// Inicialização do Banco e Servidor
async function startServer() {
  try {
    await initDatabase();
    if (require.main === module) {
      app.listen(PORT, () => {
        logger.info(`=======================================================`);
        logger.info(`   ACOMPANHABRASIL — AUDITORIA CIDADÃ DE BOLETINS DE URNA`);
        logger.info(`   Servidor rodando em: http://localhost:${PORT}`);
        logger.info(`   Painel Público:      http://localhost:${PORT}/painel.html`);
        logger.info(`   Modo: ${process.env.NODE_ENV || 'development'}`);
        logger.info(`=======================================================`);
      });
    }
  } catch (err) {
    logger.error('Falha crítica ao iniciar o servidor:', { error: err.message });
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
} else {
  // Em modo de importação / teste, apenas garante inicialização do schema
  initDatabase().catch(err => logger.error('Erro ao inicializar DB nos testes:', err));
}

module.exports = app;

