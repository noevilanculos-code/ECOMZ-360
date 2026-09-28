<div align="center">
  <img src="/assets/img/imagens/logo/ECOMZ-LOGO-09.png" alt="ECO-MZ 360 Logo" width="340" />
  <h1>ECO-MZ 360</h1>
  <p><strong>Plataforma Inteligente de Observação, Diagnóstico, Simulação e Gestão Ambiental de Moçambique</strong></p>
   <p>Projeto académico concebido para apoiar desafios ambientais e territoriais de Moçambique</p>
</div>

---

## Autenticação e Segurança

O login usa Firebase Authentication. As contas de demonstração com senhas fixas foram removidas. A API de ocorrências e a criação de projetos verificam Firebase ID tokens e papéis no banco; porém, pedidos e aprovações de perfil ainda usam armazenamento local, e os demais módulos não têm autorização server-side. Não use os fluxos locais como controle de acesso para dados ou operações de produção.

O limite atual do EcoBot é mantido em memória por processo e por endereço IP. Não equivale a proteção distribuída e precisa de um armazenamento compartilhado e identidade verificada antes de uma implantação com múltiplas instâncias.

A configuração web do Firebase é incluída no cliente por desenho. Restrinja as chaves de API por domínio e pelas APIs necessárias no Google Cloud Console, habilite apenas os provedores necessários no Firebase Authentication e nunca coloque a chave Gemini ou credenciais de serviços em arquivos versionados.

### Apresentação e contas de teste

A configuração Firebase do cliente está em `firebase-applet-config.json` e corresponde ao projeto `ecomz-360`; ela identifica o projeto, mas não é uma conta de login. As antigas contas locais de demonstração foram removidas: não existe email ou senha padrão ativa, e não se deve apresentar uma credencial antiga como funcional.

Para preparar um teste limitado das permissões da API:

1. No Firebase Console, habilite o provedor Email/Senha e crie uma conta exclusiva para o teste. Não reutilize uma conta pessoal nem publique a senha.
2. Inicie a aplicação com Firebase Admin e MySQL configurados e entre nessa conta uma vez. A autenticação da API cria o utilizador na tabela `users`.
3. Em uma conexão administrativa segura, substitua o email de exemplo abaixo pelo email cadastrado e atribua o papel usado pela API:

   ```sql
   INSERT IGNORE INTO user_roles (user_id, role_code)
   SELECT id, 'admin'
   FROM users
   WHERE email = 'admin-demo@example.invalid';
   ```

4. Esta atribuição protege as rotas de API que verificam papéis no servidor; ela não transforma a conta em um superutilizador completo na interface. O fluxo de aprovação/perfil da interface ainda usa armazenamento local e precisa de sincronização server-side. Após o teste, remova o papel atribuído ou desative a conta temporária no Firebase.

A chave Gemini deve ficar somente no `.env` local ou nos segredos do ambiente de hospedagem. Se uma chave foi compartilhada, revogue-a e gere outra.

No modo de desenvolvimento (`npm run dev`), se o MySQL não tiver ocorrências ou projetos, a interface usa exemplos fictícios de `src/data/masterData.ts`. Os protocolos aparecem com `DEMO-`, os projetos com `DEMO:` e a interface avisa que não são registos reais. As ocorrências reais continuam vindo da API quando existem dados persistidos. Esses exemplos não são carregados no build de produção nem enviados à API.

Não publique contas de demonstração, palavras-passe, chaves privadas ou dados pessoais no README. Se uma chave já foi compartilhada ou incluída num commit, revogue-a e gere uma nova; removê-la apenas no commit mais recente não a apaga do histórico Git.

O Portal API/ECO-CERT, os valores financeiros e vários indicadores apresentados pela interface são demonstrativos. O explorador não chama endpoints de dados reais, não há emissão/validação de API keys próprias, 2FA, auditoria financeira, feed satelital nem integração oficial implementados. As referências a instituições e fontes públicas indicam contexto, não parceria ou integração autorizada.

### Primeira fatia de persistência

Foi criada a migration `database/migrations/001_core_occurrences.sql` e a API autenticada `GET/POST /api/v1/occurrences` e `PATCH /api/v1/occurrences/:id/status`. O Context carrega a lista após autenticação, e o formulário principal só confirma a submissão depois de receber o registo persistido. As rotas exigem Firebase ID token; o servidor obtém a função do utilizador em `user_roles`, nunca do corpo enviado pelo navegador. Utilizadores novos recebem apenas o papel Cidadão. A migration também cria proveniência, histórico de estados e trilha de auditoria.

A migration `database/migrations/002_projects.sql` adiciona persistência para novos projetos. `GET /api/v1/projects` lista os registos; `POST /api/v1/projects` exige papel `gestor` ou `admin`, valida os campos no servidor e grava a criação na trilha de auditoria. Os projetos iniciais continuam sendo exemplos locais.

Requisitos do backend: Node.js 18+, MySQL 8/MariaDB compatível. Para ativar localmente, configure `DB_*` e credenciais Firebase Admin (`FIREBASE_SERVICE_ACCOUNT_JSON` ou Application Default Credentials) no `.env`, crie a base/conta MySQL com permissões mínimas e aplique as migrations em ordem: `mysql ecomz_db < database/migrations/001_core_occurrences.sql` e `mysql ecomz_db < database/migrations/002_projects.sql`. O endpoint `/api/health/ready` verifica conectividade ao banco. Para promover o primeiro administrador, faça-o manualmente após a conta aparecer em `users`, atribuindo `admin` em `user_roles` por uma conexão administrativa segura; ainda não há painel/API de aprovação server-side.

Fotos não são persistidas: o endpoint recusa submissões com imagem até existir armazenamento de evidências. A importação em lote, módulos móveis/offline e aprovação de perfis também permanecem demonstrativos. Notícias, avisos, simulações e relatórios ainda usam estado/mock local. Não configure credenciais administrativas Firebase no frontend e não use o fluxo de aprovação local para produção.

---

## 🎨 Otimizações de Interface & Experiência de Utilizador (UX)

1. **Scroll do Navegador Otimizado & Dinâmico**:
   - Barra de rolagem ultrafina (7px), com cantos arredondados, trilho translúcido e transição dinâmica com destaque verde esmeralda institucional (`#00A651`).
   - Suporte nativo para WebKit (Chrome, Edge, Safari, Opera) e Firefox (`scrollbar-width: thin; scrollbar-color`).
   - Rolagem suave habilitada globalmente (`scroll-behavior: smooth`).

2. **Tela de Login (Viewport 100vh)**:
   - Layout desenhado para preencher 100% da altura da tela (`h-screen overflow-hidden` em desktop/laptop), eliminando barras de rolagem desnecessárias.
   - Apresentação do projeto à esquerda, com logotipo, monitorização territorial, resposta a alertas e cobertura demonstrativa das 11 províncias.
   - Formulário corporativo autêntico à direita com suporte a temas Claro/Escuro.

---

## 🚀 Como Executar Localmente

**Pré-requisitos:** Node.js (versão 18 ou superior)

1. Instalar as dependências:
   ```bash
   npm install
   ```

2. Configurar a chave de API (opcional para funcionalidades Gemini):
   Copie `.env.example` para `.env` e defina a sua chave localmente:
   ```env
   GEMINI_API_KEY=sua_chave_aqui
   ```

3. Iniciar o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

4. Aceder no navegador:
   ```
   http://localhost:3000
   ```

### Windows

- Execute `iniciar.bat` para verificar Node.js 18+, instalar dependências ausentes pelo `package-lock.json`, criar `.env` a partir de `.env.example` se necessário e iniciar o servidor. O navegador abre depois de `/api/health` responder.
- Mantenha a janela do servidor aberta. Execute `parar.bat` para encerrar o listener do ECO-MZ 360 deste diretório; o script não encerra outro programa que esteja usando a porta 3000.
- Configure `GEMINI_API_KEY` apenas em `.env`. Para persistência, configure MySQL e Firebase Admin e aplique as migrations listadas acima; sem esses serviços, as APIs persistentes não estarão disponíveis.

---

## Publicação no GitHub

1. Revise o diff e confirme que `.env`, `node_modules/` e `dist/` não estão incluídos.
2. Nunca envie chaves Gemini nem credenciais reais. Use `.env.example` como modelo, sem valores secretos.
3. Execute `npm run lint` e `npm run build` antes de publicar.
4. Configure segredos e domínios autorizados separadamente no ambiente de hospedagem e no Firebase.
