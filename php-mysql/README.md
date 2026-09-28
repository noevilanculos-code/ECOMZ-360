# ECO-MZ 360 - Versão PHP, MySQL, HTML5, CSS3 e JavaScript

Esta pasta contém a versão completa e nativa da plataforma desenvolvida exclusivamente na stack clássica:
- **Banco de Dados**: MySQL / MariaDB (com script `database.sql`)
- **Backend**: PHP 7.4+ / PHP 8.x (com PDO e API REST)
- **Frontend**: HTML5 Semântico, CSS3 Moderno e JavaScript Puro (Vanilla JS + Fetch API)

---

## 🚀 Como Executar no seu Computador (XAMPP / WampServer / Laragon)

### Passo 1: Importar o Banco de Dados no MySQL
1. Abra o **phpMyAdmin** (geralmente em `http://localhost/phpmyadmin`).
2. Crie uma nova base de dados chamada **`ecomz_db`** (com codificação `utf8mb4_unicode_ci`).
3. Vá na aba **Importar**, selecione o arquivo **`database.sql`** desta pasta e clique em **Executar**.

### Passo 2: Configurar o Projeto no Servidor Web
1. Copie a pasta `php-mysql` para dentro do diretório raiz do seu servidor:
   - **XAMPP**: `C:/xampp/htdocs/ecomz-360/`
   - **WampServer**: `C:/wamp64/www/ecomz-360/`
   - **Linux / Apache**: `/var/www/html/ecomz-360/`

2. Se a sua senha do MySQL não for vazia, abra o arquivo `config.php` e ajuste:
   ```php
   $db_user = 'root';
   $db_pass = 'sua_senha_aqui';
   ```

### Passo 3: Abrir no Navegador
Acesse:
`http://localhost/ecomz-360/`

Pronto! A aplicação irá consultar as ocorrências e projetos gravados no MySQL via PHP e permitir adicionar novas denúncias diretamente na base de dados.
