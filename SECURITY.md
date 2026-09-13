# Política de Segurança — AcompanhaBrasil

## 1. Relatório de Vulnerabilidades

A segurança da informação e a proteção da privacidade dos voluntários são prioridades absolutas no AcompanhaBrasil.

Se você identificar qualquer vulnerabilidade de segurança, falha de integridade criptográfica ou potencial vazamento de dados, solicitamos que nos notifique de forma responsável através de uma **Security Advisory** privada no GitHub ou abrindo uma issue com a tag `security`.

---

## 2. Padrões de Segurança Implementados

- **Criptografia Simétrica:** AES-256-GCM para dados sensíveis.
- **Anonimização Unidirecional:** HMAC-SHA256 para tokens de sessão de voluntários.
- **Integridade de Documentos:** Hash SHA-256 de todas as fotos de Boletins de Urna capturadas.
- **Proteções HTTP:** Helmet para cabeçalhos de segurança (CSP, X-Frame-Options, X-Content-Type-Options).
- **Controle de Abuso:** Rate Limiting em todas as rotas da API.
- **Conformidade LGPD:** Eliminação imediata da memória RAM de CPFs e datas de nascimento após emissão do token de sessão.
