# Guia de Contribuição — AcompanhaBrasil

Agradecemos pelo seu interesse em contribuir com o **AcompanhaBrasil**! Este é um projeto de código aberto (Licença MIT), sem fins lucrativos e apartidário, dedicado à transparência eleitoral e auditoria cidadã.

---

## 🧭 Princípios de Desenvolvimento

1. **Privacidade por Design:** Qualquer nova funcionalidade deve respeitar a LGPD. **Nenhum dado pessoal identificável (PII)** como CPF, nome completo ou biometria pode ser persistido no banco de dados.
2. **Desempenho no Cliente:** A aplicação deve permanecer leve para carregar instantaneamente em redes 3G/4G no momento da apuração na porta da seção.
3. **Cobertura de Testes:** Todas as novas rotas, parsers e regras de validação matemática devem vir acompanhadas de testes automatizados com o runner nativo do Node.js (`npm test`).

---

## 🛠️ Como Contribuir

1. **Faça um Fork** deste repositório no seu GitHub.
2. **Crie uma Branch** para sua feature ou correção:
   ```bash
   git checkout -b feature/sua-melhoria-ou-correcao
   ```
3. **Instale as dependências e verifique os testes:**
   ```bash
   npm install
   npm test
   ```
4. **Implemente suas alterações** mantendo os comentários no código explicando o porquê de cada decisão técnica.
5. **Garanta que todos os testes passem:**
   ```bash
   npm test
   ```
6. **Commit com mensagens semânticas:**
   ```bash
   git commit -m "feat(qrbu): adiciona suporte ao padrão estendido de dados de urna"
   ```
7. **Envie para seu Fork:**
   ```bash
   git push origin feature/sua-melhoria-ou-correcao
   ```
8. **Abra um Pull Request** detalhando as mudanças realizadas.
