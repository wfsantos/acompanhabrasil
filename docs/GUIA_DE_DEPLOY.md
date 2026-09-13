# Guia de Implantação e Deploy — AcompanhaBrasil

Este guia detalha os procedimentos para rodar o AcompanhaBrasil localmente em desenvolvimento e para publicar em ambientes de produção (Vercel / Netlify / Railway / Docker).

---

## 1. Execução Local (Ambiente de Desenvolvimento)

### Pré-requisitos
- Node.js versão 18.0.0 ou superior instalada
- NPM ou Yarn

### Passo a Passo
1. Clone o repositório:
   ```bash
   git clone https://github.com/acompanhabrasil/acompanhabrasil.git
   cd acompanhabrasil
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Crie o arquivo de configuração local `.env`:
   ```bash
   cp .env.example .env
   ```

4. Execute os testes automatizados para verificar a integridade da aplicação:
   ```bash
   npm test
   ```

5. Inicie o servidor:
   ```bash
   npm start
   # Ou para modo de desenvolvimento com hot-reload:
   npm run dev
   ```

6. Acesse a aplicação no seu navegador:
   - Interface do Voluntário: `http://localhost:3000`
   - Painel Público de Auditoria: `http://localhost:3000/painel.html`

---

## 2. Deploy em Produção

### Opção A: Deploy no Railway (Fullstack Node.js + PostgreSQL)
1. Crie uma conta no [Railway.app](https://railway.app).
2. Conecte seu repositório GitHub.
3. Adicione um serviço de banco de dados **PostgreSQL**.
4. Configure as seguintes variáveis de ambiente no dashboard do Railway:
   - `PORT`: `3000`
   - `NODE_ENV`: `production`
   - `DB_TYPE`: `postgres`
   - `DATABASE_URL`: `${{Postgres.DATABASE_URL}}`
   - `JWT_SECRET`: *(Gere uma chave aleatória de 64 caracteres)*
   - `HMAC_SALT`: *(Gere um salt criptográfico de 64 caracteres)*
5. O Railway executará automaticamente o `npm start`.

---

### Opção B: Deploy com Docker
Um `Dockerfile` leve com Node Alpine pode ser utilizado:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "src/server.js"]
```

Comandos para build e execução:
```bash
docker build -t acompanhabrasil:latest .
docker run -d -p 3000:3000 --env-file .env acompanhabrasil:latest
```

---

## 3. Boas Práticas de Segurança em Produção
1. **Certificado HTTPS/SSL:** Sempre habilite HTTPS obrigatório. O acesso à câmera (`getUserMedia`) no navegador do voluntário é bloqueado pelo navegador caso a conexão não seja segura (HTTPS ou localhost).
2. **Segredos Criptográficos:** Nunca comite arquivos `.env` no Git. Configure as chaves `JWT_SECRET` e `HMAC_SALT` exclusivamente via variáveis de ambiente da plataforma de hospedagem.
3. **Backups do Banco:** Configure rotinas periódicas de dump do banco de dados e backup das imagens em bucket S3/Cloud Storage.
