# Política de Privacidade e Conformidade LGPD — AcompanhaBrasil

**Última atualização:** 13 de Setembro de 2026

A privacidade e a proteção de dados pessoais são pilares inegociáveis do projeto **AcompanhaBrasil**. Esta política descreve detalhadamente como o sistema trata informações em estrita conformidade com a **Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018)**.

---

## 1. Princípio Fundamental: Privacy by Design
O sistema foi concebido arquiteturalmente para que **nenhum dado pessoal identificável (PII)** seja armazenado de forma persistente. O modelo de dados é 100% focado na seção eleitoral e nos resultados públicos dos votos.

---

## 2. Tratamento de Dados na Validação Cidadã

### 2.1. O que solicitamos no formulário inicial?
- CPF (Cadastro de Pessoas Físicas)
- Data de Nascimento

### 2.2. Por que solicitamos? (Finalidade)
Apenas para realizar a consulta de validação cívica da Zona Eleitoral e Seção do voluntário, prevenindo envios robóticos/automatizados em massa (Spam) e assegurando que os voluntários reportem dados vinculados às suas seções de votação.

### 2.3. Como os dados são tratados?
1. O backend recebe temporariamente os dados via conexão segura HTTPS/TLS.
2. É gerado um identificador criptográfico pseudo-anônimo unidirecional:
   $$\text{volunteer\_hash} = \text{HMAC-SHA256}(\text{CPF} + \text{DataNascimento}, \text{SALT\_SECRETO})$$
3. A função HMAC é irreversível matematicamente, o que significa que é impossível recuperar o CPF ou a data de nascimento a partir do hash gerado.
4. O CPF e a data de nascimento em texto plano são **apagados imediatamente da memória do servidor**.
5. Não há campos de CPF, nome, telefone, email ou biometria no banco de dados.

---

## 3. Dados dos Boletins de Urna (Documento Público)
Os dados extraídos dos Boletins de Urna (quantitativo de votos por partido/candidato, brancos, nulos, comparecimento e fotos do papel impresso) são **informações de interesse público e irrestrito**, afixadas em local público por determinação legal da Justiça Eleitoral. Não constituem dados pessoais ou sensíveis sob a ótica da LGPD.

---

## 4. Uso de Câmera e Permissões do Navegador
O acesso à câmera do dispositivo é solicitado exclusivamente através da API padronizada do navegador (`navigator.mediaDevices.getUserMedia`).
- O fluxo de vídeo em tempo real é processado localmente no próprio aparelho do usuário para a leitura do QR Code (`jsQR`) e reconhecimento de caracteres (`Tesseract.js`).
- Apenas o quadro congelado do Boletim de Urna capturado e confirmado pelo usuário é enviado ao servidor.
- O sistema não acessa áudio, localização GPS contínua, contatos ou outros sensores do dispositivo.

---

## 5. Cookies e Rastreamento
- O AcompanhaBrasil **não utiliza cookies de rastreamento de terceiros**, pixels de publicidade ou ferramentas de monetização de dados.
- O único mecanismo de sessão utilizado é um token JWT efêmero (armazenado apenas na memória da aba aberta do navegador durante o fluxo de envio) com validade máxima de 30 minutos.

---

## 6. Direitos do Titular (Art. 18 da LGPD)
Como o sistema não armazena dados pessoais identificáveis em seus bancos de dados, não existem perfis de usuários, históricos nominativos ou cadastros a serem retificados ou excluídos. Caso qualquer cidadão tenha dúvidas sobre o funcionamento técnico dos algoritmos de anonimização, o código-fonte integral está publicamente disponível para auditoria no GitHub.
