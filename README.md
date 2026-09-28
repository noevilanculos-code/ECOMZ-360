<div align="center">
  <img src="/assets/img/imagens/logo/ECOMZ-LOGO-09.png" alt="ECO-MZ 360 Logo" width="340" />
  <h1>ECO-MZ 360</h1>
  <p><strong>Plataforma Inteligente de Observação, Diagnóstico, Simulação e Gestão Ambiental de Moçambique</strong></p>
  <p>Ministério da Terra e Ambiente (MTA) • Agência Nacional para o Controlo da Qualidade Ambiental (AQUA) • INGD</p>
</div>

---

## Autenticação e Segurança

As contas de demonstração estão disponíveis apenas no servidor de desenvolvimento (`npm run dev`) e não devem ser usadas como autenticação de produção. O fluxo de aprovação de perfis e permissões ainda usa armazenamento local do navegador; antes de disponibilizar o sistema a utilizadores reais, migre utilizadores, aprovações e autorização de papéis para um backend confiável e aplique as regras também no servidor.

A configuração web do Firebase é incluída no cliente por desenho. Restrinja as chaves de API por domínio e pelas APIs necessárias no Google Cloud Console, habilite apenas os provedores necessários no Firebase Authentication e nunca coloque a chave Gemini ou credenciais de serviços em arquivos versionados.

Não publique contas de demonstração, palavras-passe, chaves privadas ou dados pessoais no README. Se uma chave já foi compartilhada ou incluída num commit, revogue-a e gere uma nova; removê-la apenas no commit mais recente não a apaga do histórico Git.

---

## 🎨 Otimizações de Interface & Experiência de Utilizador (UX)

1. **Scroll do Navegador Otimizado & Dinâmico**:
   - Barra de rolagem ultrafina (7px), com cantos arredondados, trilho translúcido e transição dinâmica com destaque verde esmeralda institucional (`#00A651`).
   - Suporte nativo para WebKit (Chrome, Edge, Safari, Opera) e Firefox (`scrollbar-width: thin; scrollbar-color`).
   - Rolagem suave habilitada globalmente (`scroll-behavior: smooth`).

2. **Tela de Login 100% Organizada (Viewport 100vh)**:
   - Layout desenhado para preencher 100% da altura da tela (`h-screen overflow-hidden` em desktop/laptop), eliminando barras de rolagem desnecessárias.
   - Design institucional de alto nível à esquerda: gradiente nobre (`#031924` a `#0A3C52`), logotipo oficial, síntese estratégica e 3 pilares executivos (Vigilância Satelital, Resposta a Alertas e Integração das 11 Províncias).
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

---

## Publicação no GitHub

1. Revise o diff e confirme que `.env`, `node_modules/` e `dist/` não estão incluídos.
2. Nunca envie chaves Gemini nem credenciais reais. Use `.env.example` como modelo, sem valores secretos.
3. Execute `npm run lint` e `npm run build` antes de publicar.
4. Configure segredos e domínios autorizados separadamente no ambiente de hospedagem e no Firebase.
