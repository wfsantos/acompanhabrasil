# Roteiro de Vídeo — AcompanhaBrasil (Apresentação e Demonstração)

**Objetivo do Vídeo:** Apresentação institucional, demonstração prática do funcionamento e divulgação cívica do projeto de auditoria cidadã.  
**Duração Estimada:** 2 minutos e 30 segundos a 3 minutos.  
**Tom do Vídeo:** Cívico, transparente, confiável, moderno e tecnológico.

---

## Estrutura das 10 Cenas

```
[01. O Momento da Votação] ➔ [02. Apresentação da Plataforma] ➔ [03. Privacidade e LGPD]
            │
            ▼
[04. Confirmação de Seção] ➔ [05. Acesso à Câmera no BU] ➔ [06. Leitura QRBU + OCR]
            │
            ▼
[07. Auditoria Matemática] ➔ [08. Hash SHA-256 e Envio] ➔ [09. Painel Público & Divergências]
            │
            ▼
[10. Chamada para Ação Cidadã]
```

---

### CENA 01: O Fechamento das Urnas e o Papel na Parede
* **Tempo estimado:** 00:00 - 00:15 (15s)
* **Visual:**
  * Imagens dinâmicas de uma escola eleitoral ao entardecer (relógio marcando 17h00).
  * Mesários encerrando a seção e afixando a fita longa do Boletim de Urna (BU) impresso na porta da sala de votação.
  * Cidadãos se aproximando com curiosidade para olhar os números no papel.
* **Locução:**
  > *"Às cinco horas da tarde, a votação se encerra em todo o Brasil. As urnas imprimem o Boletim de Urna, afixado publicamente nas portas de milhares de seções eleitorais. Mas como garantir que esses números impressos cheguem de forma transparente, aberta e auditável a toda a sociedade?"*
* **Texto em Tela (Lettering):**
  * **17:00h — A Democracia é Pública**
  * *Boletim de Urna: Documento Oficial e Cidadão*
* **Trilha Sonora:** Pulsante, sóbria, transmitindo seriedade cívica e expectativa.

---

### CENA 02: Apresentação do AcompanhaBrasil
* **Tempo estimado:** 00:15 - 00:30 (15s)
* **Visual:**
  * Logo do **AcompanhaBrasil** surge na tela com animação fluida (cores verde, amarelo e azul escuro).
  * Mockup de um smartphone moderno acessando o site pelo navegador (sem app para baixar).
  * Ícones de código aberto (GitHub, MIT License) em destaque.
* **Locução:**
  > *"Conheça o AcompanhaBrasil: um sistema web de auditoria cidadã de código aberto, criado por engenheiro da computação e ex-mesário eleitoral, que permite a qualquer pessoa conferir, validar e fiscalizar os Boletins de Urna direto pelo navegador do celular — sem precisar instalar nada."*
* **Texto em Tela (Lettering):**
  * **AcompanhaBrasil — Auditoria Cidadã**
  * *100% Web • Código Aberto (MIT) • Transparência Total*
* **Trilha Sonora:** Transição para um tom tecnológico, moderno e inspirador.

---

### CENA 03: Privacidade por Design e Conformidade LGPD (Passo 1)
* **Tempo estimado:** 00:30 - 00:48 (18s)
* **Visual:**
  * Gravação de tela do **Passo 1: Validação do Voluntário**.
  * Usuário digitando CPF e Data de Nascimento.
  * Efeito gráfico de cadeado/escudo mostrando a anonimização em tempo real: o CPF vira uma chave criptográfica (`HMAC-SHA256`) e os dados pessoais são descartados da memória.
* **Locução:**
  > *"A transparência caminha lado a lado com a privacidade. Em estrita conformidade com a LGPD, o AcompanhaBrasil não armazena seu CPF, biometria ou dados pessoais. Suas informações são convertidas instantaneamente em uma chave criptográfica anônima que garante a autenticidade sem rastrear quem você é."*
* **Texto em Tela (Lettering):**
  * **Privacidade Total (LGPD Compliant)**
  * *Zero Armazenamento de CPF • Criptografia HMAC-SHA256*

---

### CENA 04: Confirmação Assertiva de Seção e Zona Eleitoral
* **Tempo estimado:** 00:48 - 01:05 (17s)
* **Visual:**
  * Modal interativo de confirmação na tela: *"Você vota em São Paulo - SP | Zona 275 | Seção 142"*.
  * Destaque para o botão *"Alterar / Corrigir Minha Seção"*, mostrando a flexibilidade de selecionar qualquer uma das 27 UFs e digitar a seção exata se o eleitor tiver transferido o título.
  * Clique no botão azul *"Sim, Confirmo Minha Seção"*.
* **Locução:**
  > *"O sistema mapeia sua Zona e Seção eleitoral e você confirma os dados na tela com assertividade total. Se você mudou de domicílio ou deseja ajustar sua seção, basta um clique para definir o local exato da sua auditoria."*
* **Texto em Tela (Lettering):**
  * **Mapeamento Preciso da Seção**
  * *Cobertura Nacional em Todas as 27 UFs*

---

### CENA 05: A Câmera em Ação na Porta da Seção (Passo 2)
* **Tempo estimado:** 01:05 - 01:22 (17s)
* **Visual:**
  * Pessoa em primeiro plano segurando o smartphone em frente ao Boletim de Urna afixado na parede.
  * Tela do celular exibindo o visualizador de câmera do navegador com a moldura de foco e linha laser animada de escaneamento.
  * Câmera aproximando do QR Code impresso no papel do BU.
* **Locução:**
  > *"Com a seção confirmada, é hora da captura. O voluntário simplesmente aponta a câmera do celular para o Boletim de Urna afixado na parede. Sem complicação, o sistema aciona a lente em alta definição pelo próprio navegador."*
* **Texto em Tela (Lettering):**
  * **Captura em Tempo Real**
  * *MediaDevices API — Direto no Navegador*

---

### CENA 06: Dupla Tecnologia: Leitura Instantânea de QRBU + OCR
* **Tempo estimado:** 01:22 - 01:42 (20s)
* **Visual:**
  * Animação gráfica mostrando a decodificação:
    1. O leitor `jsQR` reconhece o código oficial da Justiça Eleitoral instantaneamente.
    2. O motor `Tesseract.js` faz o reconhecimento óptico de caracteres (OCR) das linhas impressas como camada extra de garantia.
  * Efeito de dados estruturados (candidatos, partidos e votos) sendo preenchidos automaticamente na tela.
* **Locução:**
  > *"Aqui entra a engenharia de dupla checagem: o sistema lê o QR Code oficial padrão TSE em frações de segundo e utiliza inteligência óptica de caracteres (OCR) para cruzar os números impressos. Todos os votos da urna são extraídos e organizados de forma automática."*
* **Texto em Tela (Lettering):**
  * **Dupla Verificação:** *jsQR (TSE) + OCR Tesseract.js*
  * *Extração Automática de Votos por Cargo*

---

### CENA 07: Auditoria Matemática de Consistência Eleitoral (Passo 3)
* **Tempo estimado:** 01:42 - 02:00 (18s)
* **Visual:**
  * Tela do **Passo 3: Conferência**.
  * Tabela limpa com total de Aptos, Comparecimento, Faltosos, Brancos, Nulos e votos nominais.
  * Banner de alerta mudando para verde: *"✓ Consistência Matemática Validada: Total de votos confere exatamente com o comparecimento"*.
* **Locução:**
  > *"Antes de publicar, o AcompanhaBrasil audita as equações eleitorais em tempo real: a soma de votos nominais, votos de legenda, brancos e nulos DEVE ser exatamente igual ao total de comparecimento. Se houver qualquer divergência no papel, o sistema sinaliza na hora para correção do voluntário."*
* **Texto em Tela (Lettering):**
  * **Validação Matemática Automática**
  * $\text{Votos} + \text{Brancos} + \text{Nulos} = \text{Comparecimento}$

---

### CENA 08: Assinatura Criptográfica e Publicação Imutável
* **Tempo estimado:** 02:00 - 02:18 (18s)
* **Visual:**
  * Voluntário tocando no botão verde *"Confirmar e Publicar Registro"*.
  * Tela de sucesso exibindo o carimbo verde de validação e o código do Hash criptográfico `SHA-256` da imagem capturada.
  * Animação do hash sendo registrado de forma permanente e auditável.
* **Locução:**
  > *"Ao confirmar, o sistema gera uma impressão digital criptográfica SHA-256 da fotografia e envia os dados consolidados. O boletim recebe um selo de integridade pública imutável, garantindo que a foto e os números jamais possam ser alterados ou fraudados."*
* **Texto em Tela (Lettering):**
  * **Integridade Criptográfica SHA-256**
  * *Registro Imutável e Auditável*

---

### CENA 09: O Painel Público e o Alerta Vermelho de Divergências
* **Tempo estimado:** 02:18 - 02:40 (22s)
* **Visual:**
  * Transição para o **Painel Público de Transparência** (`painel.html`).
  * Demonstração de filtros por Estado, Município, Zona e Seção.
  * Gráficos em tempo real de votos consolidados.
  * Destaque especial na tela: uma seção com **duplo envio divergente marcada com badge e linha vermelha vibrante** (`⚠️ Divergente`), abrindo o modal comparativo lado a lado com as fotos originais para auditoria popular.
* **Locução:**
  > *"Todos os boletins alimentam o Painel Público em tempo real, aberto para jornalistas, fiscais e qualquer cidadão. Se voluntários diferentes enviarem boletins da mesma seção com números discrepantes, o sistema acende um alerta vermelho instantâneo, permitindo comparar as fotos originais e identificar qualquer tentativa de erro ou manipulação."*
* **Texto em Tela (Lettering):**
  * **Painel de Auditoria em Tempo Real**
  * *Detecção Automática de Divergências em Vermelho*
  * *Download de Dados Abertos (JSON)*

---

### CENA 10: Encerramento e Chamada para Ação Cívica (CTA)
* **Tempo estimado:** 02:40 - 03:00 (20s)
* **Visual:**
  * Mosaico com dezenas de boletins sendo auditados por cidadãos em todo o Brasil.
  * Tela final elegante com o link do projeto, repositório do GitHub e selos de código aberto.
  * Frase de impacto em destaque.
* **Locução:**
  > *"A fiscalização da nossa democracia é um direito e um dever de todos nós. Audite a sua seção, participe da transparência eleitoral e fortaleça a cidadania. Acesse acompanhabrasil.org, inspecione o código no GitHub e faça parte da maior rede de auditoria popular do Brasil."*
* **Texto em Tela (Lettering):**
  * **AcompanhaBrasil — A Democracia Auditada por Quem Vota**
  * 🌐 *Acesse: acompanhabrasil.org*
  * 💻 *Código Aberto: github.com/acompanhabrasil*
* **Trilha Sonora:** Clímax musical inspirador que finaliza com um acorde marcante.
