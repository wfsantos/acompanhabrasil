# Guia Oficial de Implantação em VPS Linux — AcompanhaBrasil

Este guia fornece o passo a passo completo para implantar o **AcompanhaBrasil** em um servidor VPS Linux (Ubuntu 22.04/24.04 LTS ou Debian) no diretório `/home/www/acompanhabrasil`.

---

## 1. O Que Enviar para a VPS

### ✅ Arquivos e Pastas a Enviar:
* `src/` (código-fonte do backend)
* `public/` (frontend, HTML, CSS, JavaScript)
* `schema.sql` (script de criação do banco de dados MySQL)
* `package.json` e `package-lock.json`
* `.env.example`
* `docs/`
* `LICENSE` e `README.md`
* `uploads/` (pasta de fotos com `.gitkeep`)

### ❌ O Que NÃO Enviar (Gerado ou configurado na VPS):
* `node_modules/` (será gerado na VPS via `npm install`)
* `.env` local (será criado diretamente na VPS com credenciais do servidor)
* `database.sqlite` (não utilizado em produção com MySQL)
* `.git/` (opcional se enviar via zip/rsync, ou nativo se clonar via git)

---

## 2. Pré-requisitos na VPS

Conecte-se à sua VPS via SSH:
```bash
ssh usuario@seu-ip-ou-dominio.com
```

Atualize os pacotes do sistema:
```bash
sudo apt update && sudo apt upgrade -y
```

Instale os serviços necessários (Node.js 20, MySQL Server, Nginx, Git, PM2 e Certbot):
```bash
# 1. Instalar Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git nginx mysql-server

# 2. Instalar o gerenciador de processos PM2 globalmente
sudo npm install -g pm2

# 3. Instalar o Certbot para certificado SSL/HTTPS gratuito
sudo apt install -y certbot python3-certbot-nginx
```

---

## 3. Passo a Passo de Implantação

### Passo 1: Criar o Diretório e Clonar/Transferir o Projeto

```bash
# Cria o diretório de destino
sudo mkdir -p /home/www/acompanhabrasil
sudo chown -R $USER:$USER /home/www/acompanhabrasil

# Opção A: Clonar diretamente do seu repositório GitHub (Recomendado)
git clone https://github.com/SEU_USUARIO/acompanhabrasil.git /home/www/acompanhabrasil

# Opção B: Se estiver enviando do seu computador via Rsync/SCP:
# rsync -avz --exclude 'node_modules' --exclude '.env' d:/acompanhabrasil/ usuario@seu-ip:/home/www/acompanhabrasil/
```

Entre na pasta do projeto:
```bash
cd /home/www/acompanhabrasil
```

---

### Passo 2: Configurar o Banco de Dados MySQL

1. Acesse o terminal do MySQL como root:
```bash
sudo mysql
```

2. Crie o usuário e configure as permissões de acesso:
```sql
-- Cria o usuário dedicado para o sistema (substitua 'sua_senha_segura_mysql' por uma senha forte)
CREATE USER IF NOT EXISTS 'acompanha_user'@'localhost' IDENTIFIED BY 'sua_senha_segura_mysql';

-- Concede privilégios totais no banco acompanhabrasil
GRANT ALL PRIVILEGES ON acompanhabrasil.* TO 'acompanha_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

3. Execute o script `schema.sql` para criar o banco de dados, tabelas e views:
```bash
mysql -u acompanha_user -p < schema.sql
# Digite a senha criada acima quando solicitado
```

---

### Passo 3: Configurar o Arquivo `.env` de Produção

Crie o arquivo `.env` na VPS:
```bash
cp .env.example .env
nano .env
```

Preencha com as configurações da sua VPS:
```env
# Configurações do Servidor
PORT=3000
NODE_ENV=production

# Chaves Criptográficas Seguras (Gere com: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=coloque_aqui_uma_chave_longa_e_aleatoria_de_64_caracteres
HMAC_SALT=coloque_aqui_outro_salt_secreto_e_aleatorio_para_lgpd

# Banco de Dados MySQL
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=acompanha_user
DB_PASSWORD=sua_senha_segura_mysql
DB_NAME=acompanhabrasil

# Domínio e Upload
MAX_FILE_SIZE_BYTES=10485760
ALLOWED_ORIGINS=https://seu-dominio.com.br,https://www.seu-dominio.com.br
```

Salve e saia do editor (`Ctrl + O`, `Enter`, `Ctrl + X`).

---

### Passo 4: Instalar Dependências e Executar Testes

```bash
# Instala as dependências em modo produção
npm install --omit=dev

# Permissões na pasta de fotos
mkdir -p uploads
chmod -R 775 uploads

# Executa os testes automatizados para validar a integridade
npm test
```

---

### Passo 5: Iniciar e Gerenciar o Backend com PM2

O PM2 mantém sua aplicação Node.js rodando em background 24/7 e reinicia automaticamente se o servidor reiniciar.

```bash
# Inicia a aplicação
pm2 start src/server.js --name acompanhabrasil

# Salva a lista de processos para inicialização automática no boot do Linux
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER
```

Comandos úteis do PM2:
* `pm2 status` — Ver o status do servidor
* `pm2 logs acompanhabrasil` — Ver logs em tempo real
* `pm2 restart acompanhabrasil` — Reiniciar o servidor

---

### Passo 6: Configurar o Nginx como Proxy Reverso com HTTPS

> **IMPORTANTE:** A API de Câmera (`MediaDevices.getUserMedia`) do navegador dos celulares dos voluntários **SÓ FUNCIONA EM CONEXÕES SEGURAS HTTPS**. O certificado SSL é obrigatório.

1. Crie o arquivo de configuração do Nginx:
```bash
sudo nano /etc/nginx/sites-available/acompanhabrasil
```

2. Cole a configuração abaixo (substitua `seu-dominio.com.br` pelo seu domínio real):
```nginx
server {
    listen 80;
    server_name seu-dominio.com.br www.seu-dominio.com.br;

    client_max_body_size 15M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. Ative o site e reinicie o Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/acompanhabrasil /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

4. Emita o certificado SSL gratuito (Let's Encrypt / HTTPS automático):
```bash
sudo certbot --nginx -d seu-dominio.com.br -d www.seu-dominio.com.br
```

---

## 4. Resumo dos Serviços Ativos na VPS

| Serviço | Função | Comando de Verificação |
| :--- | :--- | :--- |
| **MySQL Server** | Armazena seções, BUs e votos | `sudo systemctl status mysql` |
| **PM2 / Node.js** | Executa a API e backend (Porta 3000) | `pm2 status` |
| **Nginx** | Servidor Web e Proxy Reverso HTTPS (Porta 80/443) | `sudo systemctl status nginx` |
| **Certbot** | Renovação automática do certificado SSL | `sudo certbot renew --dry-run` |

---

## 5. Como Atualizar o Sistema no Futuro

Quando você fizer alterações no código e subir para o GitHub:

```bash
cd /home/www/acompanhabrasil
git pull origin main
npm install --omit=dev
pm2 restart acompanhabrasil
```
