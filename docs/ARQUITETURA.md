# Arquitetura do Sistema — AcompanhaBrasil

## 1. Visão Geral
O **AcompanhaBrasil** é uma plataforma distribuída e transparente para auditoria social dos resultados eleitorais a partir dos Boletins de Urna (BUs) impressos e afixados nas seções eleitorais ao término da votação oficial.

O sistema foi desenhado para garantir **auditorabilidade pública**, **alta disponibilidade**, **integridade criptográfica** e conformidade estrita com a **Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)**.

---

## 2. Princípios de Engenharia de Software

1. **Privacidade por Design (Privacy by Design):**
   - Nenhum dado pessoal identificável (PII), como CPF ou nome completo, é gravado no banco de dados.
   - O identificador de submissão do voluntário é gerado via algoritmo `HMAC-SHA256` utilizando um salt de aplicação e destruindo os dados em texto plano imediatamente após a emissão do token efêmero de sessão.

2. **Verificação Dupla no Cliente (Edge Computation):**
   - O processamento de decodificação de imagem ocorre diretamente no navegador do usuário utilizando workers:
     - **jsQR:** Para decodificação rápida e de alta precisão do padrão oficial de QR Code de Boletim de Urna (`QRBU`).
     - **Tesseract.js (WASM):** Para extração óptica de caracteres (OCR) dos cabeçalhos impressos (Zona, Seção, Comparecimento, Votos).
   - O cliente executa validação matemática prévia antes de qualquer requisição de rede.

3. **Imutabilidade e Integridade de Dados:**
   - Toda imagem de boletim enviada possui seu hash criptográfico `SHA-256` calculado tanto no cliente quanto no servidor.
   - Os registros de votos são comparados em nível de seção eleitoral para detecção instantânea de divergências ou tentativas de adulteração.

---

## 3. Diagrama de Arquitetura

```
+-------------------------------------------------------------------------+
|                              NAVEGADOR                                  |
|                                                                         |
|  +---------------------+   +---------------------+   +---------------+  |
|  | MediaDevices Camera |-->|   Leitor jsQR       |-->| Validador     |  |
|  +---------------------+   +---------------------+   | Matemático    |  |
|            |                         |               | (Edge JS)     |  |
|            v                         v               +---------------+  |
|  +---------------------+   +---------------------+           |          |
|  | Captura de Imagem   |-->|   OCR Tesseract.js  |-----------+          |
|  +---------------------+   +---------------------+           |          |
|            |                                                 v          |
|            +---------------------------------------> Envio via REST     |
+--------------------------------------------------------------|----------+
                                                               | (HTTPS/JSON)
                                                               v
+-------------------------------------------------------------------------+
|                        BACKEND NODE.JS / EXPRESS                        |
|                                                                         |
|  [ Middlewares: Helmet | Rate Limiter | CORS | JWT Auth ]               |
|                               |                                         |
|  +----------------------------+----------------------------+            |
|  |                            |                            |            |
|  v                            v                            v            |
|  +--------------------+  +--------------------+  +--------------------+ |
|  | Auth Controller    |  | Boletim Controller |  | Audit Controller   | |
|  | (Valida & Anonim.) |  | (Parsing & SHA-256)|  | (Detecção Diverg.) | |
|  +--------------------+  +--------------------+  +--------------------+ |
|            |                         |                     |            |
|            +-------------------------+---------------------+            |
|                                      |                                  |
|                                      v                                  |
|                        CAMADA DE PERSISTÊNCIA                           |
|                        (SQLite / PostgreSQL)                            |
+-------------------------------------------------------------------------+
                                       |
                                       v
+-------------------------------------------------------------------------+
|                   PAINEL PÚBLICO DE TRANSPARÊNCIA                       |
|   - Visualização por UF / Município / Zona / Seção                      |
|   - Gráficos de Votação por Cargo                                       |
|   - Destaque em Vermelho de Inconsistências                             |
|   - Auditoria e Download da Imagem Original + Hash SHA-256             |
+-------------------------------------------------------------------------+
```

---

## 4. Camadas da Aplicação

### 4.1. Camada de Apresentação (Frontend)
- **Tecnologias:** HTML5 semântico, Tailwind CSS, JavaScript Vanilla ES6+ modular.
- **Racional:** Evitar overhead de frameworks pesados (React, Angular) permitindo carregamento ultra-rápido em redes móveis (3G/4G) no portão das seções eleitorais.

### 4.2. Camada de Aplicação (Backend)
- **Tecnologias:** Node.js, Express.js.
- **Estrutura:**
  - `controllers/`: Gerenciamento de entrada, fluxo e respostas HTTP.
  - `services/`: Regras de negócio puras (criptografia, validação eleitoral, parser de QRBU).
  - `models/`: Interface com a base de dados SQL.
  - `routes/`: Declaração de rotas da API RESTful com middlewares de segurança.

### 4.3. Camada de Persistência (Banco de Dados)
- Compatibilidade híbrida com **SQLite** (para desenvolvimento e execução local sem dependências externas) e **PostgreSQL** (para escalabilidade horizontal e deploy em nuvem).
- Modelagem centrada na entidade **Seção Eleitoral** e **Boletim de Urna**, sem referências a pessoas físicas.
