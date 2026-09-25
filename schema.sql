-- ==============================================================================
-- Esquema Oficial de Banco de Dados MySQL — AcompanhaBrasil v1.0
-- Projeto: Auditoria Cidadã de Boletins de Urna (Código Aberto - Licença MIT)
-- Compatível com: MySQL 5.7+, MySQL 8.0+, MySQL 8.4+ e MariaDB 10.3+
-- ==============================================================================

-- 1. Criação do Banco de Dados com suporte a UTF-8 completo (emojis, acentuação)
CREATE DATABASE IF NOT EXISTS `acompanhabrasil`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `acompanhabrasil`;

-- ------------------------------------------------------------------------------
-- 2. Tabela: secoes_eleitorais
-- Armazena os metadados consolidados de cada seção eleitoral e status de auditoria.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `secoes_eleitorais` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `uf` VARCHAR(2) NOT NULL COMMENT 'Sigla do Estado (ex: SP, RJ, MG, etc.)',
  `municipio` VARCHAR(100) NOT NULL COMMENT 'Nome oficial do município',
  `codigo_municipio_tse` VARCHAR(10) DEFAULT NULL COMMENT 'Código numérico do município no cadastro do TSE',
  `zona` INT UNSIGNED NOT NULL COMMENT 'Número da Zona Eleitoral',
  `secao` INT UNSIGNED NOT NULL COMMENT 'Número da Seção Eleitoral',
  `local_votacao` VARCHAR(255) DEFAULT NULL COMMENT 'Nome da escola ou local de votação',
  `status_auditoria` ENUM('AGUARDANDO', 'VALIDADO', 'DIVERGENTE') NOT NULL DEFAULT 'AGUARDANDO' COMMENT 'Status de validação dos envios desta seção',
  `total_envios` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Quantidade total de BUs recebidos para esta seção',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de cadastro do primeiro registro da seção',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Data da última atualização ou submissão',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_secao_local` (`uf`, `municipio`, `zona`, `secao`),
  INDEX `idx_secoes_filtro` (`uf`, `municipio`),
  INDEX `idx_secoes_zona_secao` (`zona`, `secao`),
  INDEX `idx_secoes_status` (`status_auditoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabela de Seções Eleitorais Auditadas';

-- ------------------------------------------------------------------------------
-- 3. Tabela: boletins
-- Armazena cada submissão individual do Boletim de Urna (BU) enviada por voluntários.
-- NOTA LGPD: Não armazena CPF ou dados pessoais do voluntário; apenas o volunteer_hash (HMAC-SHA256).
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `boletins` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `secao_id` INT UNSIGNED NOT NULL COMMENT 'Referência à seção eleitoral correspondente',
  `codigo_municipio_tse` VARCHAR(10) DEFAULT NULL COMMENT 'Código do município no TSE',
  `uf` VARCHAR(2) NOT NULL COMMENT 'Sigla da UF',
  `municipio` VARCHAR(100) NOT NULL COMMENT 'Nome do Município',
  `zona` INT UNSIGNED NOT NULL COMMENT 'Número da Zona Eleitoral',
  `secao` INT UNSIGNED NOT NULL COMMENT 'Número da Seção Eleitoral',
  `data_eleicao` DATE NOT NULL COMMENT 'Data do pleito eleitoral (AAAA-MM-DD)',
  `turno` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT 'Turno da eleição (1 ou 2)',
  `aptos` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Total de eleitores aptos a votar na seção',
  `comparecimento` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Total de eleitores que compareceram e votaram',
  `faltosos` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Total de abstenções / eleitores faltosos',
  `brancos` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Total de votos em branco apurados no BU',
  `nulos` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Total de votos nulos apurados no BU',
  `qr_conteudo_bruto` MEDIUMTEXT DEFAULT NULL COMMENT 'Texto bruto decodificado do QR Code oficial do BU (padrão QRBU)',
  `qr_hash_assinatura` VARCHAR(128) DEFAULT NULL COMMENT 'Código/Assinatura digital de validação da urna contida no BU',
  `imagem_url` VARCHAR(255) DEFAULT NULL COMMENT 'Caminho do arquivo de imagem do BU armazenado',
  `imagem_sha256` VARCHAR(64) DEFAULT NULL COMMENT 'Hash criptográfico SHA-256 da imagem para garantia de imutabilidade',
  `volunteer_hash` VARCHAR(64) NOT NULL COMMENT 'Identificador pseudo-anônimo gerado via HMAC-SHA256 (Zero PII/LGPD)',
  `status_validacao` ENUM('VALIDO', 'INCONSISTENTE_MATEMATICO', 'DIVERGENTE') NOT NULL DEFAULT 'VALIDO' COMMENT 'Resultado da auditoria matemática e de duplicidade',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Data e hora do recebimento da submissão',
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_boletins_secao` FOREIGN KEY (`secao_id`) REFERENCES `secoes_eleitorais` (`id`) ON DELETE CASCADE,
  INDEX `idx_boletins_secao_id` (`secao_id`),
  INDEX `idx_boletins_sha256` (`imagem_sha256`),
  INDEX `idx_boletins_volunteer` (`volunteer_hash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Submissões de Boletins de Urna';

-- ------------------------------------------------------------------------------
-- 4. Tabela: votos_detalhe
-- Detalhamento individual dos votos apurados para cada candidato, legenda, branco e nulo.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `votos_detalhe` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `boletim_id` INT UNSIGNED NOT NULL COMMENT 'Referência ao Boletim de Urna submetido',
  `cargo` VARCHAR(50) NOT NULL COMMENT 'Cargo eleitoral (ex: PRESIDENTE, GOVERNADOR, SENADOR, DEPUTADO_FEDERAL, PREFEITO)',
  `numero_candidato` VARCHAR(20) NOT NULL COMMENT 'Número do candidato, partido, BRANCO ou NULO',
  `nome_candidato` VARCHAR(100) DEFAULT NULL COMMENT 'Nome de urna do candidato',
  `partido` VARCHAR(20) DEFAULT NULL COMMENT 'Sigla do partido político',
  `tipo_voto` ENUM('NOMINAL', 'LEGENDA', 'BRANCO', 'NULO') NOT NULL DEFAULT 'NOMINAL' COMMENT 'Tipo do voto registrado',
  `quantidade_votos` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Total de votos recebidos',
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_votos_boletim` FOREIGN KEY (`boletim_id`) REFERENCES `boletins` (`id`) ON DELETE CASCADE,
  INDEX `idx_votos_boletim_id` (`boletim_id`),
  INDEX `idx_votos_cargo_candidato` (`cargo`, `numero_candidato`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Detalhamento dos Votos por Cargo e Candidato';

-- ------------------------------------------------------------------------------
-- 5. Views Otimizadas para Consulta Pública e Painel de Transparência
-- ------------------------------------------------------------------------------

-- View: Totalização Consolidada por Candidato
CREATE OR REPLACE VIEW `vw_totalizacao_candidatos` AS
SELECT 
  vd.cargo,
  vd.numero_candidato,
  vd.nome_candidato,
  vd.partido,
  vd.tipo_voto,
  SUM(vd.quantidade_votos) AS total_votos
FROM `votos_detalhe` vd
JOIN `boletins` b ON vd.boletim_id = b.id
GROUP BY vd.cargo, vd.numero_candidato, vd.nome_candidato, vd.partido, vd.tipo_voto
ORDER BY vd.cargo, total_votos DESC;

-- View: Resumo de Auditoria por Seção Eleitoral
CREATE OR REPLACE VIEW `vw_resumo_auditoria_secoes` AS
SELECT 
  s.id AS secao_id,
  s.uf,
  s.municipio,
  s.zona,
  s.secao,
  s.status_auditoria,
  s.total_envios,
  s.updated_at,
  (SELECT comparecimento FROM `boletins` WHERE secao_id = s.id ORDER BY id DESC LIMIT 1) AS ultimo_comparecimento,
  (SELECT aptos FROM `boletins` WHERE secao_id = s.id ORDER BY id DESC LIMIT 1) AS ultimos_aptos
FROM `secoes_eleitorais` s;
