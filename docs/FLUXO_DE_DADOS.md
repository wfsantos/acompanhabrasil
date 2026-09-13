# Fluxo de Dados — AcompanhaBrasil

Este documento detalha o ciclo de vida da informação no sistema, desde a validação do cidadão até a consolidação pública dos Boletins de Urna (BUs).

---

## 1. Ciclo em 5 Etapas

```
[Etapa 1: Validação Cidadã]
       │
       ▼
[Etapa 2: Captura Câmera / QR Code / OCR]
       │
       ▼
[Etapa 3: Validação Matemática no Cliente]
       │
       ▼
[Etapa 4: Transmissão Criptografada e Persistência]
       │
       ▼
[Etapa 5: Auditoria Pública e Detecção de Divergências]
```

---

## 2. Detalhamento de Cada Etapa

### Etapa 1: Validação e Anonimização do Voluntário
1. O usuário informa CPF e Data de Nascimento no formulário.
2. O backend consulta o serviço de validação eleitoral (Mock oficial / API TSE).
3. O sistema obtém a **UF, Município, Zona Eleitoral e Seção** correspondentes ao título do eleitor.
4. O backend calcula o `volunteer_hash`:
   $$\text{volunteer\_hash} = \text{HMAC-SHA256}(\text{CPF} + \text{DataNasc}, \text{HMAC\_SALT})$$
5. O backend emite um `JWT` efêmero (expiração de 30 minutos) contendo:
   - `volunteer_hash`
   - `uf`, `municipio`, `zona`, `secao`
6. O CPF e a Data de Nascimento são **imediatamente descartados da memória RAM** e não são salvos em logs nem no banco de dados.

---

### Etapa 2: Captura do Boletim de Urna
1. O voluntário posiciona a câmera do celular sobre o Boletim de Urna impresso na porta da seção.
2. O leitor `jsQR` analisa os frames de vídeo em tempo real até identificar o QR Code oficial do TSE.
3. O parser de QR Code extrai o cabeçalho eleitoral e a contagem de votos.
4. Concomitantemente ou como fallback, o módulo `Tesseract.js` processa a imagem para extrair os números impressos.
5. O navegador gera a imagem comprimida do BU em formato JPEG/PNG e calcula seu hash `SHA-256`.

---

### Etapa 3: Validação Matemática de Consistência
Antes do envio, o sistema verifica as seguintes regras obrigatórias de consistência eleitoral:

1. **Equação do Comparecimento por Cargo:**
   $$\text{Total Comparecimento} = \sum \text{Votos Nominais} + \sum \text{Votos de Legenda} + \text{Votos em Branco} + \text{Votos Nulos}$$

2. **Equação dos Eleitores da Seção:**
   $$\text{Eleitores Aptos} = \text{Total Comparecimento} + \text{Abstenções (Faltosos)}$$

3. **Consistência Inter-Cargos:**
   O comparecimento apurado para os diferentes cargos (ex.: Presidente, Governador, Senador, Deputado) deve ser idêntico dentro da mesma seção eleitoral.

Se houver divergência matemática, o voluntário é alertado imediatamente na tela com sugestão de conferência manual antes da submissão.

---

### Etapa 4: Transmissão e Armazenamento
1. O payload contendo a imagem, o texto bruto do QRBU, os votos estruturados e o hash da imagem é transmitido via `POST /api/boletins` com o token JWT de autenticação.
2. O servidor valida:
   - Assinatura do JWT e correspondência da Zona/Seção.
   - Hash SHA-256 do arquivo de imagem recebido.
   - Consistência dos dados de votação.
3. Os dados são salvos na tabela `boletins` e `votos_candidatos`.

---

### Etapa 5: Auditoria Pública e Detecção de Divergências
1. Sempre que um novo BU de uma seção é recebido, o sistema executa o algoritmo de detecção de divergência:
   - Compara o total de votos de cada candidato entre todos os envios daquela mesma seção.
   - Compara o hash da imagem e a chave de segurança do QR Code da Urna.
2. Se houver discrepância entre dois envios da mesma seção:
   - A seção é marcada com `status = 'DIVERGENTE'`.
   - No Painel Público, a linha da seção é destacada com **badge e fundo vermelho**.
   - Os detalhes das duas submissões são exibidos lado a lado para escrutínio público e comparação das fotos originais.
