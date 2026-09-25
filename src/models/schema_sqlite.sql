-- ==============================================================================
-- Esquema SQLite — AcompanhaBrasil (Fallback / Testes Locais)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS secoes_eleitorais (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uf VARCHAR(2) NOT NULL,
    municipio VARCHAR(100) NOT NULL,
    codigo_municipio_tse VARCHAR(10),
    zona INTEGER NOT NULL,
    secao INTEGER NOT NULL,
    local_votacao VARCHAR(255),
    status_auditoria VARCHAR(20) DEFAULT 'AGUARDANDO',
    total_envios INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(uf, municipio, zona, secao)
);

CREATE TABLE IF NOT EXISTS boletins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    secao_id INTEGER NOT NULL,
    codigo_municipio_tse VARCHAR(10),
    uf VARCHAR(2) NOT NULL,
    municipio VARCHAR(100) NOT NULL,
    zona INTEGER NOT NULL,
    secao INTEGER NOT NULL,
    data_eleicao VARCHAR(10) NOT NULL,
    turno INTEGER DEFAULT 1,
    aptos INTEGER NOT NULL DEFAULT 0,
    comparecimento INTEGER NOT NULL DEFAULT 0,
    faltosos INTEGER NOT NULL DEFAULT 0,
    brancos INTEGER NOT NULL DEFAULT 0,
    nulos INTEGER NOT NULL DEFAULT 0,
    qr_conteudo_bruto TEXT,
    qr_hash_assinatura VARCHAR(128),
    imagem_url VARCHAR(255),
    imagem_sha256 VARCHAR(64),
    volunteer_hash VARCHAR(64) NOT NULL,
    status_validacao VARCHAR(30) DEFAULT 'VALIDO',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(secao_id) REFERENCES secoes_eleitorais(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS votos_detalhe (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    boletim_id INTEGER NOT NULL,
    cargo VARCHAR(50) NOT NULL,
    numero_candidato VARCHAR(20) NOT NULL,
    nome_candidato VARCHAR(100),
    partido VARCHAR(20),
    tipo_voto VARCHAR(20) NOT NULL,
    quantidade_votos INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY(boletim_id) REFERENCES boletins(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_secoes_loc ON secoes_eleitorais(uf, municipio, zona, secao);
CREATE INDEX IF NOT EXISTS idx_secoes_status ON secoes_eleitorais(status_auditoria);
CREATE INDEX IF NOT EXISTS idx_boletins_secao ON boletins(secao_id);
CREATE INDEX IF NOT EXISTS idx_boletins_sha256 ON boletins(imagem_sha256);
CREATE INDEX IF NOT EXISTS idx_votos_boletim ON votos_detalhe(boletim_id);
