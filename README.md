# 🇧🇷 AcompanhaBrasil — Auditoria Cidadã de Boletins de Urna

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Status](https://img.shields.io/badge/Status-Produção%20%2F%20Auditável-blue.svg)](#)
[![LGPD](https://img.shields.io/badge/LGPD-Compatível%20(Privacy%20by%20Design)-success.svg)](#)

> **Sistema web de coleta, conferência independente e publicação transparente de Boletins de Urna (BUs) eleitorais.**  
> Permite que qualquer cidadão audite os boletins impressos e afixados nas seções eleitorais de forma simples, confiável e com privacidade garantida.

---

## 🎯 Objetivo Principal

O **AcompanhaBrasil** transforma o smartphone de qualquer cidadão em uma estação de auditoria cívica. Ao término da votação oficial (17h), os mesários imprimem e afixam o Boletim de Urna (BU) na porta da seção eleitoral. Pela legislação brasileira (Código Eleitoral e Resoluções do TSE), este é um documento público e aberto.

Através de uma aplicação 100% web (sem necessidade de instalar aplicativos de lojas proprietárias), o voluntário valida sua seção, aponta a câmera para o QR Code oficial do BU (com suporte a OCR complementar via Tesseract.js), verifica a consistência matemática e publica os dados na rede pública de auditoria com hash de integridade SHA-256.

---

## 🧭 Princípios Norteadores

1. **Transparência Total:** Todo o código é aberto (Open Source, Licença MIT), sem caixas pretas ou algoritmos ocultos.
2. **Privacidade por Design (LGPD):** Não armazenamos CPF, nome, biometria ou dados rastreáveis em banco de dados. Os identificadores de sessão utilizam `HMAC-SHA256` unidirecional e tokens JWT efêmeros.
3. **Simplicidade Cívica:** Fluxo intuitivo em **3 passos** (Identificação ➔ Captura ➔ Conferência e Publicação).
4. **Confiabilidade Dupla:** Decodificação de QR Code oficial (`jsQR`) combinada com Reconhecimento Óptico de Caracteres (`Tesseract.js`) e validação matemática de consistência eleitoral em tempo real.
5. **Repetibilidade & Sustentabilidade:** Arquitetura flexível compatível com qualquer eleição municipal, estadual ou federal.

---

## 🏗️ Arquitetura e Tecnologias

```
[ Navegador do Cidadão (Mobile/Desktop) ]
  ├── 1. Validação Cidadã (CPF + Data Nasc) -> Gera Hash Anônimo (Zero CPF salvo)
  ├── 2. Captura de Câmera (MediaDevices API)
  ├── 3. Leitor QRBU TSE (jsQR) + OCR (Tesseract.js)
  ├── 4. Validador de Consistência Matemática (Votos + Brancos + Nulos == Comparecimento)
  └── 5. Envio com Hash de Integridade (SHA-256)
             │
             ▼ REST API (Node.js + Express)
  ├── Middlewares: Helmet, Rate Limiter, CORS, JWT
  ├── Validador Criptográfico & Anonimização (AES-256, HMAC-SHA256)
  ├── Parser de QR Code de Boletim de Urna (QRBU)
  ├── Motor de Detecção de Divergências entre Envios
  └── Banco de Dados (SQLite / PostgreSQL)
             │
             ▼
[ Painel Público de Auditoria e Transparência ]
  ├── Filtros por Estado (UF), Município, Zona Eleitoral e Seção
  ├── Destaque Visual em Vermelho de Seções com Divergências
  ├── Visualizador da Imagem Original do BU + Hash SHA-256
  └── Exportação de Dados Abertos (JSON)
```

### Stack Tecnológica
- **Frontend:** HTML5 Semântico, Tailwind CSS, Vanilla JS ES6+ (leve e otimizado para conexões 3G/4G móveis).
- **Backend:** Node.js, Express.js.
- **QR Code Engine:** `jsQR` (processamento local em canvas).
- **OCR Engine:** `Tesseract.js` (WebAssembly worker no cliente).
- **Segurança & Criptografia:** AES-256-GCM, HMAC-SHA256, JWT, Helmet, Rate Limiting.
- **Banco de Dados:** SQLite (zero-config local) e PostgreSQL (produção).
- **Testes:** Suíte de testes automatizados com o test runner nativo do Node.js.

---

## 📂 Estrutura de Pastas

```
acompanhabrasil/
├── .env.example              # Modelo documentado de variáveis de ambiente
├── .gitignore                 # Exclusões seguras para git
├── LICENSE                    # Licença de código aberto MIT
├── README.md                  # Este documento
├── package.json               # Dependências e scripts npm
├── docs/                      # Documentação técnica e manuais
│   ├── ARQUITETURA.md         # Diagramas e decisões de arquitetura
│   ├── FLUXO_DE_DADOS.md      # Ciclo de vida dos dados e validações
│   ├── MODELO_DO_BANCO.md     # Esquema do banco de dados (DER) e dicionário
│   ├── MANUAL_DO_VOLUNTARIO.md# Guia passo a passo para o cidadão
│   ├── TERMOS_DE_USO.md       # Termos de uso do serviço
│   ├── POLITICA_DE_PRIVACIDADE.md # Conformidade estrita com a LGPD
│   └── GUIA_DE_DEPLOY.md      # Instruções para Railway, Vercel, Docker
├── src/                       # Código-fonte do Backend
│   ├── server.js              # Ponto de entrada do servidor Express
│   ├── config/                # Configurações de banco e segurança
│   ├── controllers/           # Controladores REST
│   ├── models/                # Schema SQL e camada de acesso DAO
│   ├── routes/                # Definição de rotas HTTP
│   ├── services/              # Serviços de negócio (criptografia, QR, validações)
│   └── utils/                 # Utilitários e logger sanitizado
├── public/                    # Frontend da Aplicação Web
│   ├── index.html             # Interface do voluntário (3 passos)
│   ├── painel.html            # Painel público de auditoria e transparência
│   ├── termos.html            # Página pública de termos
│   ├── privacidade.html        # Página pública de privacidade
│   ├── css/styles.css         # Estilos customizados e animações
│   └── js/                    # Módulos JavaScript Vanilla do cliente
└── tests/                     # Testes Automatizados
    ├── crypto.test.js         # Testes de criptografia e HMAC
    ├── qrBuParser.test.js     # Testes do decodificador de QRBU TSE
    ├── validation.test.js     # Testes de integridade matemática
    └── api.test.js            # Testes de integração dos endpoints HTTP
```

---

## 🚀 Instalação e Execução Local

### Pré-requisitos
- Node.js (versão 18.0.0 ou superior)
- NPM ou Yarn

### 1. Clonar o Repositório e Instalar Dependências
```bash
git clone https://github.com/acompanhabrasil/acompanhabrasil.git
cd acompanhabrasil
npm install
```

### 2. Configurar o Ambiente
Copie o arquivo de exemplo para criar o seu `.env` local:
```bash
cp .env.example .env
```

### 3. Rodar os Testes Automatizados
```bash
npm test
```

### 4. Iniciar o Servidor
```bash
npm start
# Ou em modo desenvolvimento com auto-reload:
npm run dev
```

Acesse no navegador:
- 📱 **Interface do Voluntário:** [http://localhost:3000](http://localhost:3000)
- 📊 **Painel Público de Auditoria:** [http://localhost:3000/painel.html](http://localhost:3000/painel.html)

---

## 📋 Fluxo do Voluntário (3 Passos)

1. **Validação Cívica (LGPD):** O voluntário informa CPF e Data de Nascimento. O sistema valida os dígitos e retorna a confirmação de Zona e Seção. Nenhum CPF é gravado no banco de dados.
2. **Captura do BU:** A câmera do celular é ativada pelo navegador. Ao enquadrar o QR Code do Boletim de Urna, os dados de votos são decodificados instantaneamente. Em caso de necessidade, o OCR lê os números impressos.
3. **Conferência e Publicação:** O sistema confere a equação eleitoral:
   $$\text{Votos Nominais} + \text{Votos em Branco} + \text{Votos Nulos} = \text{Comparecimento}$$
   O voluntário revisa, confirma e submete o registro, que recebe um hash `SHA-256` de integridade pública.

---

## 🤝 Como Contribuir

Contribuições da comunidade são muito bem-vindas! Siga os passos:

1. Faça um Fork do projeto no GitHub.
2. Crie uma branch para sua funcionalidade (`git checkout -b feature/minha-melhoria`).
3. Escreva testes automatizados cobrindo a alteração.
4. Execute `npm test` para certificar-se de que tudo passa com 100% de sucesso.
5. Faça o commit (`git commit -m 'feat: adiciona suporte a novo formato de QRBU'`).
6. Envie para o branch (`git push origin feature/minha-melhoria`).
7. Abra um **Pull Request**.

---

## 📄 Licença

Este projeto é distribuído sob a licença **MIT**. Consulte o arquivo [LICENSE](LICENSE) para mais informações.
