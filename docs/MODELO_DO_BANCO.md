# Modelo do Banco de Dados MySQL — AcompanhaBrasil

O banco de dados é estruturado em torno das entidades oficiais do processo eleitoral (Seções, Boletins de Urna e Votos), sem qualquer tabela de usuários cadastrados ou dados pessoais identificáveis (em estrita conformidade com a LGPD).

---

## 1. Como Importar o Banco de Dados no MySQL

O script SQL de criação e inicialização está disponível na raiz do repositório no arquivo [`schema.sql`](../schema.sql).

### Via Linha de Comando (CLI):
```bash
mysql -u root -p < schema.sql
```

### Via MySQL Workbench / DBeaver / phpMyAdmin:
1. Abra o arquivo `schema.sql` no editor SQL.
2. Execute o script completo (`Ctrl + Shift + Enter` ou botão *Execute All*).
3. O banco de dados `acompanhabrasil` e todas as tabelas e views serão criados com charset `utf8mb4`.

---

## 2. Diagrama Entidade-Relacionamento (DER)

```
+---------------------------+       1:N       +---------------------------+
|      SECOES_ELEITORAIS    |<----------------|         BOLETINS          |
+---------------------------+                 +---------------------------+
| id INT UNSIGNED (PK)      |                 | id INT UNSIGNED (PK)      |
| uf VARCHAR(2)             |                 | secao_id INT UNSIGNED(FK) |
| municipio VARCHAR(100)    |                 | codigo_municipio_tse      |
| zona INT UNSIGNED         |                 | zona INT UNSIGNED         |
| secao INT UNSIGNED        |                 | secao INT UNSIGNED        |
| local_votacao VARCHAR(255)|                 | data_eleicao DATE         |
| status_auditoria ENUM     |                 | turno TINYINT UNSIGNED    |
| total_envios INT UNSIGNED |                 | aptos INT UNSIGNED        |
| created_at DATETIME       |                 | comparecimento INT UNSIGNED
| updated_at DATETIME       |                 | faltosos INT UNSIGNED     |
+---------------------------+                 | brancos INT UNSIGNED      |
                                              | nulos INT UNSIGNED        |
                                              | qr_conteudo_bruto MEDTEXT |
                                              | qr_hash_assinatura VARCHAR|
                                              | imagem_url VARCHAR(255)   |
                                              | imagem_sha256 VARCHAR(64) |
                                              | volunteer_hash VARCHAR(64)|
                                              | status_validacao ENUM     |
                                              | created_at DATETIME       |
                                              +---------------------------+
                                                            |
                                                            | 1:N
                                                            v
                                              +---------------------------+
                                              |      VOTOS_DETALHE        |
                                              +---------------------------+
                                              | id INT UNSIGNED (PK)      |
                                              | boletim_id INT UNSIGNEDFK |
                                              | cargo VARCHAR(50)         |
                                              | numero_candidato VARCHAR  |
                                              | nome_candidato VARCHAR    |
                                              | partido VARCHAR(20)       |
                                              | tipo_voto ENUM            |
                                              | quantidade_votos INT UNSIG|
                                              +---------------------------+
```

---

## 3. Dicionário de Dados

### 3.1. Tabela `secoes_eleitorais`
Armazena os metadados agregados de cada seção eleitoral e o status de consolidação da auditoria.

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `INT UNSIGNED AUTO_INCREMENT` | Chave primária |
| `uf` | `VARCHAR(2)` | Sigla do Estado (ex: `SP`, `RJ`, `MG`) |
| `municipio` | `VARCHAR(100)` | Nome do Município |
| `codigo_municipio_tse` | `VARCHAR(10)` | Código oficial do município no TSE |
| `zona` | `INT UNSIGNED` | Número da Zona Eleitoral |
| `secao` | `INT UNSIGNED` | Número da Seção Eleitoral |
| `local_votacao` | `VARCHAR(255)` | Nome da Escola/Local de Votação |
| `status_auditoria` | `ENUM('AGUARDANDO', 'VALIDADO', 'DIVERGENTE')` | Status consolidado da auditoria |
| `total_envios` | `INT UNSIGNED` | Total de BUs recebidos para esta seção |
| `created_at` | `DATETIME` | Data do primeiro envio |
| `updated_at` | `DATETIME` | Data da última atualização |

### 3.2. Tabela `boletins`
Armazena cada submissão individual do Boletim de Urna enviada por um voluntário.

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `INT UNSIGNED AUTO_INCREMENT` | Chave primária |
| `secao_id` | `INT UNSIGNED` | Chave estrangeira (`secoes_eleitorais.id`) |
| `uf`, `municipio`, `zona`, `secao` | `VARCHAR` / `INT` | Dados do local da urna |
| `data_eleicao` | `DATE` | Data do pleito (ex: `2026-10-04`) |
| `turno` | `TINYINT UNSIGNED` | Turno (`1` ou `2`) |
| `aptos` | `INT UNSIGNED` | Total de eleitores aptos da seção |
| `comparecimento` | `INT UNSIGNED` | Total de votantes |
| `faltosos` | `INT UNSIGNED` | Total de abstenções |
| `brancos` | `INT UNSIGNED` | Total de votos em branco |
| `nulos` | `INT UNSIGNED` | Total de votos nulos |
| `qr_conteudo_bruto` | `MEDIUMTEXT` | Texto bruto decodificado do QR Code oficial |
| `qr_hash_assinatura` | `VARCHAR(128)` | Código de autenticidade da urna |
| `imagem_url` | `VARCHAR(255)` | Caminho do arquivo da foto do BU |
| `imagem_sha256` | `VARCHAR(64)` | Hash SHA-256 da imagem (Imutabilidade) |
| `volunteer_hash` | `VARCHAR(64)` | Hash do voluntário (HMAC-SHA256 - Zero CPF) |
| `status_validacao` | `ENUM('VALIDO', 'INCONSISTENTE_MATEMATICO', 'DIVERGENTE')` | Status da submissão |
| `created_at` | `DATETIME` | Data/hora do recebimento |

### 3.3. Tabela `votos_detalhe`
Armazena os votos apurados por cargo e candidato em cada BU.

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `INT UNSIGNED AUTO_INCREMENT` | Chave primária |
| `boletim_id` | `INT UNSIGNED` | Chave estrangeira (`boletins.id`) |
| `cargo` | `VARCHAR(50)` | Cargo (ex: `PRESIDENTE`, `GOVERNADOR`) |
| `numero_candidato` | `VARCHAR(20)` | Número do candidato, legenda ou `BRANCO`/`NULO` |
| `nome_candidato` | `VARCHAR(100)` | Nome da urna do candidato |
| `partido` | `VARCHAR(20)` | Sigla do Partido |
| `tipo_voto` | `ENUM('NOMINAL', 'LEGENDA', 'BRANCO', 'NULO')` | Tipo do voto |
| `quantidade_votos` | `INT UNSIGNED` | Quantidade apurada |

---

## 4. Views de Alta Performance

1. **`vw_totalizacao_candidatos`**: Totalização agregada e consolidada de votos de todos os candidatos em tempo real.
2. **`vw_resumo_auditoria_secoes`**: Resumo executivo do status de auditoria de cada seção eleitoral com dados do último envio.
