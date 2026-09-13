# Modelo do Banco de Dados — AcompanhaBrasil

O banco de dados é estruturado em torno das entidades do processo eleitoral (Seções, Boletins de Urna e Votos), sem qualquer tabela de usuários cadastrados ou dados pessoais identificáveis.

---

## 1. Diagrama Entidade-Relacionamento (DER)

```
+---------------------------+       1:N       +---------------------------+
|      SECOES_ELEITORAIS    |<----------------|         BOLETINS          |
+---------------------------+                 +---------------------------+
| id (PK)                   |                 | id (PK)                   |
| uf                        |                 | secao_id (FK)             |
| municipio                 |                 | codigo_municipio_tse      |
| zona                      |                 | zona                      |
| secao                     |                 | secao                     |
| local_votacao             |                 | data_eleicao              |
| status_auditoria          |                 | turno                     |
| total_envios              |                 | aptos                     |
| created_at                |                 | comparecimento            |
| updated_at                |                 | faltosos                  |
+---------------------------+                 | brancos                   |
                                              | nulos                     |
                                              | qr_conteudo_bruto         |
                                              | qr_hash_assinatura        |
                                              | imagem_url                |
                                              | imagem_sha256             |
                                              | volunteer_hash            |
                                              | status_validacao          |
                                              | created_at                |
                                              +---------------------------+
                                                            |
                                                            | 1:N
                                                            v
                                              +---------------------------+
                                              |      VOTOS_DETALHE        |
                                              +---------------------------+
                                              | id (PK)                   |
                                              | boletim_id (FK)           |
                                              | cargo                     |
                                              | numero_candidato          |
                                              | nome_candidato            |
                                              | partido                   |
                                              | tipo_voto                 |
                                              | quantidade_votos          |
                                              +---------------------------+
```

---

## 2. Dicionário de Dados

### 2.1. Tabela `secoes_eleitorais`
Armazena os metadados agregados de cada seção eleitoral e o status de consolidação da auditoria.

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | INTEGER/SERIAL | Identificador único da seção |
| `uf` | VARCHAR(2) | Sigla do Estado (ex: `SP`, `RJ`, `MG`) |
| `municipio` | VARCHAR(100) | Nome do Município |
| `zona` | INTEGER | Número da Zona Eleitoral |
| `secao` | INTEGER | Número da Seção Eleitoral |
| `local_votacao` | VARCHAR(255) | Nome da Escola/Local de Votação (opcional) |
| `status_auditoria` | VARCHAR(20) | `AGUARDANDO`, `VALIDADO`, `DIVERGENTE` |
| `total_envios` | INTEGER | Quantidade de BUs recebidos para esta seção |
| `created_at` | TIMESTAMP | Data de criação do registro |
| `updated_at` | TIMESTAMP | Data da última atualização |

### 2.2. Tabela `boletins`
Armazena cada submissão individual do Boletim de Urna enviada por um voluntário.

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | INTEGER/SERIAL | Identificador único da submissão |
| `secao_id` | INTEGER | Chave estrangeira para `secoes_eleitorais` |
| `codigo_municipio_tse` | VARCHAR(10) | Código do município na base do TSE |
| `zona` | INTEGER | Zona Eleitoral |
| `secao` | INTEGER | Seção Eleitoral |
| `data_eleicao` | VARCHAR(10) | Data da eleição (ex: `2026-10-04`) |
| `turno` | INTEGER | Turno da Eleição (`1` ou `2`) |
| `aptos` | INTEGER | Total de eleitores aptos da seção |
| `comparecimento` | INTEGER | Total de eleitores que votaram |
| `faltosos` | INTEGER | Total de abstenções |
| `brancos` | INTEGER | Total de votos em branco |
| `nulos` | INTEGER | Total de votos nulos |
| `qr_conteudo_bruto` | TEXT | Texto decodificado integral do QR Code do BU |
| `qr_hash_assinatura` | VARCHAR(64) | Código/Hash de validação da urna extraído do BU |
| `imagem_url` | VARCHAR(255) | Caminho da imagem salva do BU |
| `imagem_sha256` | VARCHAR(64) | Hash SHA-256 da imagem enviada |
| `volunteer_hash` | VARCHAR(64) | Hash criptográfico do voluntário (HMAC-SHA256) |
| `status_validacao` | VARCHAR(20) | `VALIDO`, `INCONSISTENTE_MATEMATICO`, `DIVERGENTE` |
| `created_at` | TIMESTAMP | Data/hora do recebimento |

### 2.3. Tabela `votos_detalhe`
Armazena o detalhamento dos votos por cargo e candidato contidos em cada Boletim de Urna.

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | INTEGER/SERIAL | Identificador único |
| `boletim_id` | INTEGER | Chave estrangeira para `boletins` |
| `cargo` | VARCHAR(50) | Cargo disputado (ex: `PRESIDENTE`, `GOVERNADOR`, `DEPUTADO_FEDERAL`) |
| `numero_candidato` | VARCHAR(10) | Número do candidato ou partido (ou `BRANCO`/`NULO`) |
| `nome_candidato` | VARCHAR(100) | Nome da urna do candidato |
| `partido` | VARCHAR(20) | Sigla do Partido |
| `tipo_voto` | VARCHAR(20) | `NOMINAL`, `LEGENDA`, `BRANCO`, `NULO` |
| `quantidade_votos` | INTEGER | Total de votos computados para este item |

---

## 3. Garantias de Integridade
- **Chave Única Composta de Seção:** `UNIQUE(uf, municipio, zona, secao)` na tabela `secoes_eleitorais`.
- **Índices de Alto Desempenho:** Índices em `(uf, municipio)`, `(zona, secao)` e `imagem_sha256`.
- **Imutabilidade:** Registros em `boletins` e `votos_detalhe` são estritamente acumulativos (append-only) para auditoria histórica.
