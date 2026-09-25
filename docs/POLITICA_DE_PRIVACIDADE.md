# Política de Privacidade e Conformidade Legal — AcompanhaBrasil

**Última atualização:** 25 de Setembro de 2026

A privacidade, a proteção de dados e a conformidade legal são pilares inegociáveis do projeto **AcompanhaBrasil**. Esta política descreve detalhadamente como o sistema trata informações em estrita harmonia com a **Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018)** e com o **Marco Civil da Internet (Lei nº 12.965/2014)**.

---

## 1. Princípio Fundamental: Privacy by Design
O sistema foi concebido arquiteturalmente para que **nenhum dado pessoal identificável (PII)** como CPF, nome civil, telefone, email ou biometria seja armazenado de forma persistente. O modelo de dados é 100% focado na seção eleitoral e nos resultados públicos dos votos.

---

## 2. Tratamento de Dados na Validação Cidadã

### 2.1. O que solicitamos no formulário inicial?
* CPF (Cadastro de Pessoas Físicas)
* Data de Nascimento

### 2.2. Por que solicitamos? (Finalidade e Base Legal)
A coleta temporária visa unicamente viabilizar a validação cívica da Zona e Seção eleitoral do voluntário (prevenindo ataques automatizados / spams) e gerar uma credencial transitória de envio com amparo no Art. 7º, incisos II (cumprimento de obrigação legal) e IX (legítimo interesse cívico) da LGPD.

### 2.3. Capacidade Civil e Eleitores Facultativos (16 a 18 anos)
Em cumprimento à Constituição Federal (Art. 14, §1º, II, 'c') e ao Art. 14 da LGPD, o tratamento mínimo de dados de eleitores jovens (16 a 18 anos incompletos) é realizado estritamente em seu melhor interesse, para viabilizar o exercício legítimo de seus direitos políticos e cívicos de fiscalização eleitoral, sem criação de perfis comportamentais ou publicidade.

### 2.4. Como os dados são anonimizados?
1. O backend recebe temporariamente os dados via conexão segura e criptografada (HTTPS/TLS).
2. É gerado um identificador criptográfico pseudo-anônimo unidirecional:
   $$\text{volunteer\_hash} = \text{HMAC-SHA256}(\text{CPF} + \text{DataNascimento}, \text{SALT\_SECRETO})$$
3. A função HMAC é matematicamente irreversível: é impossível recuperar o CPF ou a data de nascimento original a partir do hash gerado.
4. O CPF e a data de nascimento em texto plano são **imediatamente destruídos da memória RAM do servidor**.
5. Não há campos de CPF, nome ou dados de contato no banco de dados.

---

## 3. Guarda de Registros de Acesso (Marco Civil da Internet)

Em cumprimento à obrigação legal expressa do **Artigo 15 da Lei Federal nº 12.965/2014 (Marco Civil da Internet)**, a infraestrutura do servidor (Nginx / Linux) mantém os registros de conexão e acesso a aplicações (endereço IP, porta lógica, data e hora de cada requisição) sob sigilo e ambiente controlado pelo prazo obrigatório de 6 (seis) meses.

> **Garantia de Não-Cruzamento:** Os logs de IP previstos no Marco Civil são mantidos exclusivamente em arquivos de log do servidor web para fins de auditoria de segurança da informação e eventual requisição judicial. Eles **não são associados, cruzados ou indexados** com as opções eleitorais, votos ou com a identidade do eleitor.

---

## 4. Dados dos Boletins de Urna (Documento de Domínio Público)
Os dados extraídos dos Boletins de Urna (quantitativo de votos por partido/candidato, brancos, nulos, comparecimento e fotos do papel impresso) são **informações de interesse público e irrestrito**, afixadas em local público por determinação legal da Justiça Eleitoral (Código Eleitoral e Resoluções do TSE). Não constituem dados pessoais ou sensíveis sob a ótica da LGPD.

---

## 5. Uso de Câmera e Permissões do Navegador
O acesso à câmera do dispositivo é solicitado exclusivamente através da API padronizada do navegador (`navigator.mediaDevices.getUserMedia`).
* O fluxo de vídeo em tempo real é processado localmente no próprio aparelho do usuário para a leitura do QR Code (`jsQR`) e reconhecimento de caracteres (`Tesseract.js`).
* Apenas o quadro congelado do Boletim de Urna capturado e confirmado pelo usuário é enviado ao servidor.
* O sistema não acessa áudio, localização GPS contínua, agenda de contatos ou outros sensores do dispositivo.

---

## 6. Cookies e Rastreamento
* O AcompanhaBrasil **não utiliza cookies de rastreamento de terceiros**, pixels de publicidade ou ferramentas de monetização de dados.
* O único mecanismo de sessão utilizado é um token JWT efêmero (armazenado apenas na memória da aba aberta do navegador durante o fluxo de envio) com validade máxima de 30 minutos.

---

## 7. Direitos do Titular (Art. 18 da LGPD)
Como o sistema não armazena dados pessoais identificáveis em seus bancos de dados relacionais, não existem cadastros nominativos, históricos de navegação individualizados ou perfis a serem retificados ou excluídos. O código-fonte integral está publicamente disponível no GitHub para auditoria independente de conformidade técnica.
